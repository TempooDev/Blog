package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Version of the consent text shown next to the signup form. Bump it when the text changes,
// so each subscriber keeps proof of what they agreed to.
const consentVersion = "2026-10"

const (
	confirmTTL          = 7 * 24 * time.Hour
	unsubscribedTTL     = 30 * 24 * time.Hour
	confirmResendWindow = 10 * time.Minute
)

type Subscriber struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Email            string             `bson:"email" json:"email"`
	Lang             string             `bson:"lang" json:"lang"`
	Status           string             `bson:"status" json:"status"` // pending, active, unsubscribed
	ConfirmTokenHash string             `bson:"confirmTokenHash,omitempty" json:"-"`
	UnsubscribeToken string             `bson:"unsubscribeToken" json:"-"`
	ConsentAt        time.Time          `bson:"consentAt" json:"consentAt"`
	ConsentVersion   string             `bson:"consentVersion" json:"consentVersion"`
	ConfirmSentAt    time.Time          `bson:"confirmSentAt" json:"-"`
	ConfirmedAt      *time.Time         `bson:"confirmedAt,omitempty" json:"confirmedAt,omitempty"`
	UnsubscribedAt   *time.Time         `bson:"unsubscribedAt,omitempty" json:"unsubscribedAt,omitempty"`
}

type subscribeRequest struct {
	Email   string `json:"email"`
	Lang    string `json:"lang"`
	Consent bool   `json:"consent"`
	Website string `json:"website"` // honeypot: real users never fill it
}

var (
	subscribers *mongo.Collection
	sends       *mongo.Collection
	mailer      Sender
	limiter     = newRateLimiter(5, time.Hour)
)

func setupNewsletter(db *mongo.Database) {
	subscribers = db.Collection("newsletter_subscribers")
	sends = db.Collection("newsletter_sends")
	mailer = newSenderFromEnv()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := subscribers.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "confirmTokenHash", Value: 1}}},
		{Keys: bson.D{{Key: "unsubscribeToken", Value: 1}}},
	})
	if err != nil {
		log.Printf("Could not create newsletter indexes: %v\n", err)
	}
	if _, err := sends.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "digestId", Value: 1}}, Options: options.Index().SetUnique(true),
	}); err != nil {
		log.Printf("Could not create newsletter_sends index: %v\n", err)
	}

	if apiURL() == "" {
		log.Println("Newsletter: PUBLIC_API_URL is not set, confirmation and unsubscribe links will be broken")
	}
	if !mailer.Configured() {
		log.Println("Newsletter: mail driver not configured, emails will fail until MAIL_DRIVER and its variables are set")
	}
}

func siteURL() string {
	if u := os.Getenv("SITE_URL"); u != "" {
		return strings.TrimSuffix(u, "/")
	}
	return "https://antoniobermudez.dev"
}

// apiURL is the public URL of this service, used in confirmation and unsubscribe links.
func apiURL() string {
	return strings.TrimSuffix(os.Getenv("PUBLIC_API_URL"), "/")
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func normalizeLang(lang string) string {
	if lang == "es" {
		return "es"
	}
	return "en"
}

// normalizeEmail returns the lowercased address, or "" if it is not a plain valid address.
func normalizeEmail(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" || len(raw) > 254 {
		return ""
	}
	addr, err := mail.ParseAddress(raw)
	if err != nil || addr.Address != raw || addr.Name != "" {
		return ""
	}
	at := strings.LastIndex(raw, "@")
	if at < 1 || !strings.Contains(raw[at+1:], ".") {
		return ""
	}
	return strings.ToLower(raw)
}

func newsletterStatusURL(lang, status string) string {
	return fmt.Sprintf("%s/%s/newsletter/?status=%s", siteURL(), normalizeLang(lang), status)
}

func setCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// POST /newsletter/subscribe
func handleSubscribe(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req subscribeRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// Same answer whether the address is new, pending or already subscribed,
	// so the form can't be used to find out who is on the list.
	ok := func() {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Check your inbox to confirm"})
	}

	if req.Website != "" {
		ok()
		return
	}
	email := normalizeEmail(req.Email)
	if email == "" {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}
	if !req.Consent {
		http.Error(w, "Consent is required", http.StatusBadRequest)
		return
	}
	if !limiter.Allow(clientIP(r)) {
		http.Error(w, "Too many requests", http.StatusTooManyRequests)
		return
	}
	lang := normalizeLang(req.Lang)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing Subscriber
	err := subscribers.FindOne(ctx, bson.M{"email": email}).Decode(&existing)
	if err != nil && err != mongo.ErrNoDocuments {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	found := err == nil
	if found && existing.Status == "active" {
		ok()
		return
	}
	if found && existing.Status == "pending" && time.Since(existing.ConfirmSentAt) < confirmResendWindow {
		ok()
		return
	}

	token := randomHex(32)
	now := time.Now()
	unsubscribeToken := existing.UnsubscribeToken
	if unsubscribeToken == "" {
		unsubscribeToken = randomHex(32)
	}
	_, err = subscribers.UpdateOne(ctx, bson.M{"email": email}, bson.M{
		"$set": bson.M{
			"email":            email,
			"lang":             lang,
			"status":           "pending",
			"confirmTokenHash": hashToken(token),
			"unsubscribeToken": unsubscribeToken,
			"consentAt":        now,
			"consentVersion":   consentVersion,
			"confirmSentAt":    now,
		},
		"$unset": bson.M{"unsubscribedAt": ""},
	}, options.Update().SetUpsert(true))
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	confirmURL := apiURL() + "/newsletter/confirm?token=" + token
	if err := mailer.Send(confirmationEmail(email, lang, confirmURL)); err != nil {
		log.Printf("Error sending confirmation email: %v\n", err)
		// Let the person retry right away instead of waiting out the resend window
		subscribers.UpdateOne(ctx, bson.M{"email": email}, bson.M{"$set": bson.M{"confirmSentAt": time.Time{}}})
		http.Error(w, "Could not send the confirmation email", http.StatusBadGateway)
		return
	}
	ok()
}

// GET /newsletter/confirm?token=...
func handleConfirm(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var sub Subscriber
	err := subscribers.FindOne(ctx, bson.M{
		"confirmTokenHash": hashToken(token),
		"status":           "pending",
	}).Decode(&sub)
	if token == "" || err != nil || time.Since(sub.ConfirmSentAt) > confirmTTL {
		http.Redirect(w, r, newsletterStatusURL(sub.Lang, "invalid"), http.StatusSeeOther)
		return
	}

	_, err = subscribers.UpdateByID(ctx, sub.ID, bson.M{
		"$set":   bson.M{"status": "active", "confirmedAt": time.Now()},
		"$unset": bson.M{"confirmTokenHash": ""},
	})
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, newsletterStatusURL(sub.Lang, "confirmed"), http.StatusSeeOther)
}

// GET  /newsletter/unsubscribe?token=... shows a button (link scanners prefetch GETs).
// POST /newsletter/unsubscribe?token=... unsubscribes; also used by one-click List-Unsubscribe.
func handleUnsubscribe(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var sub Subscriber
	if token == "" || subscribers.FindOne(ctx, bson.M{"unsubscribeToken": token}).Decode(&sub) != nil {
		http.Redirect(w, r, newsletterStatusURL("en", "invalid"), http.StatusSeeOther)
		return
	}

	switch r.Method {
	case http.MethodGet:
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		renderUnsubscribePage(w, sub.Lang, unsubscribeURL(token))
	case http.MethodPost:
		if sub.Status != "unsubscribed" {
			_, err := subscribers.UpdateByID(ctx, sub.ID, bson.M{
				"$set":   bson.M{"status": "unsubscribed", "unsubscribedAt": time.Now()},
				"$unset": bson.M{"confirmTokenHash": ""},
			})
			if err != nil {
				http.Error(w, "Internal error", http.StatusInternalServerError)
				return
			}
		}
		// One-click requests from mail clients only need a 2xx.
		if r.FormValue("List-Unsubscribe") == "One-Click" {
			w.WriteHeader(http.StatusOK)
			return
		}
		http.Redirect(w, r, newsletterStatusURL(sub.Lang, "unsubscribed"), http.StatusSeeOther)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GET /admin/newsletter/subscribers
func handleAdminSubscribers(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := subscribers.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "consentAt", Value: -1}}))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var list []Subscriber
	if err := cursor.All(ctx, &list); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	counts := map[string]int{}
	for _, s := range list {
		counts[s.Status+"_"+s.Lang]++
	}
	if list == nil {
		list = []Subscriber{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"counts": counts, "subscribers": list})
}

// cleanupSubscribers drops unconfirmed signups and old unsubscribes, so no address is kept
// longer than needed.
func cleanupSubscribers() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pending, err := subscribers.DeleteMany(ctx, bson.M{
		"status":        "pending",
		"confirmSentAt": bson.M{"$lt": time.Now().Add(-confirmTTL)},
	})
	if err != nil {
		return err
	}
	gone, err := subscribers.DeleteMany(ctx, bson.M{
		"status":         "unsubscribed",
		"unsubscribedAt": bson.M{"$lt": time.Now().Add(-unsubscribedTTL)},
	})
	if err != nil {
		return err
	}
	log.Printf("Newsletter cleanup: %d unconfirmed and %d unsubscribed removed\n", pending.DeletedCount, gone.DeletedCount)
	return nil
}

// clientIP returns the visitor's IP for rate limiting. Behind Traefik the TCP peer is the proxy,
// so it uses the last X-Forwarded-For hop (the one the proxy appended; earlier hops can be forged
// by the client). If another proxy sits in front (e.g. Cloudflare), set CLIENT_IP_HEADER to the
// header it sets, such as CF-Connecting-IP.
func clientIP(r *http.Request) string {
	if h := os.Getenv("CLIENT_IP_HEADER"); h != "" {
		if ip := strings.TrimSpace(r.Header.Get(h)); ip != "" {
			return ip
		}
	}
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		hops := strings.Split(fwd, ",")
		return strings.TrimSpace(hops[len(hops)-1])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// rateLimiter allows `max` events per key in a sliding window. In memory: fine for one instance.
type rateLimiter struct {
	mu     sync.Mutex
	max    int
	window time.Duration
	hits   map[string][]time.Time
}

func newRateLimiter(max int, window time.Duration) *rateLimiter {
	return &rateLimiter{max: max, window: window, hits: map[string][]time.Time{}}
}

func (l *rateLimiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	if len(l.recent(key)) >= l.max {
		return false
	}
	l.hits[key] = append(l.hits[key], time.Now())
	return true
}

// Blocked reports whether the key used up its budget, without counting a new event.
func (l *rateLimiter) Blocked(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	return len(l.recent(key)) >= l.max
}

// Record counts one event for the key.
func (l *rateLimiter) Record(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.hits[key] = append(l.recent(key), time.Now())
}

// recent drops expired hits for the key and returns the rest. Callers hold the lock.
func (l *rateLimiter) recent(key string) []time.Time {
	now := time.Now()
	kept := l.hits[key][:0]
	for _, t := range l.hits[key] {
		if now.Sub(t) < l.window {
			kept = append(kept, t)
		}
	}
	l.hits[key] = kept
	return kept
}

// Prune forgets keys with no hits left in the window.
func (l *rateLimiter) Prune() {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	for key, hits := range l.hits {
		if len(hits) == 0 || now.Sub(hits[len(hits)-1]) >= l.window {
			delete(l.hits, key)
		}
	}
}

func unsubscribeURL(token string) string {
	return apiURL() + "/newsletter/unsubscribe?token=" + url.QueryEscape(token)
}
