package main

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	textTemplate "text/template"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

//go:embed templates/*
var templateFS embed.FS

var (
	htmlTemplates = template.Must(template.ParseFS(templateFS, "templates/*.html"))
	textTemplates = textTemplate.Must(textTemplate.ParseFS(templateFS, "templates/*.txt"))
)

// Digest is one weekly issue, stored in the Directus `digests` collection.
type Digest struct {
	ID          int          `json:"id"`
	Title       string       `json:"title"`
	Slug        string       `json:"slug"`
	Language    string       `json:"language"`
	IssueNumber int          `json:"issue_number"`
	Status      string       `json:"status"`
	Intro       string       `json:"intro"`
	Items       []DigestItem `json:"items"`
	Outro       string       `json:"outro"`
	PublishDate string       `json:"publish_date"`
	SentAt      *string      `json:"sent_at"`
	PromoTitle  string       `json:"promo_title"`
	PromoText   string       `json:"promo_text"`
	PromoURL    string       `json:"promo_url"`
	PromoCTA    string       `json:"promo_cta"`
}

const digestFields = "id,title,slug,language,issue_number,status,intro,items,outro,publish_date,sent_at,promo_title,promo_text,promo_url,promo_cta"

type DigestItem struct {
	Title        string `json:"title"`
	URL          string `json:"url"`
	Source       string `json:"source"`
	Category     string `json:"category"`
	Summary      string `json:"summary"`
	WhyItMatters string `json:"why_it_matters"`
}

var emailStrings = map[string]map[string]string{
	"es": {
		"confirmSubject": "Confirma tu suscripción a la newsletter",
		"confirmIntro":   "Has pedido recibir la newsletter semanal de IA y tecnología de antoniobermudez.dev.",
		"confirmButton":  "Confirmar suscripción",
		"confirmIgnore":  "Si no has sido tú, ignora este correo: sin confirmar no te llegará nada y tu dirección se borra en 7 días.",
		"readOnline":     "Leer en el blog",
		"whyItMatters":   "Por qué importa",
		"unsubscribe":    "Darse de baja",
		"footer":         "Recibes este correo porque te suscribiste en antoniobermudez.dev.",
		"unsubTitle":     "Darse de baja de la newsletter",
		"unsubText":      "Pulsa el botón para dejar de recibir la newsletter.",
		"unsubButton":    "Darme de baja",
		"promoCta":       "Más información",
	},
	"en": {
		"confirmSubject": "Confirm your newsletter subscription",
		"confirmIntro":   "You asked to receive the weekly AI and tech newsletter from antoniobermudez.dev.",
		"confirmButton":  "Confirm subscription",
		"confirmIgnore":  "If this wasn't you, ignore this email: nothing will be sent without confirmation and your address is deleted in 7 days.",
		"readOnline":     "Read on the blog",
		"whyItMatters":   "Why it matters",
		"unsubscribe":    "Unsubscribe",
		"footer":         "You get this email because you subscribed on antoniobermudez.dev.",
		"unsubTitle":     "Unsubscribe from the newsletter",
		"unsubText":      "Press the button to stop receiving the newsletter.",
		"unsubButton":    "Unsubscribe",
		"promoCta":       "Learn more",
	},
}

func renderBoth(name string, data interface{}) (string, string, error) {
	var h, t bytes.Buffer
	if err := htmlTemplates.ExecuteTemplate(&h, name+".html", data); err != nil {
		return "", "", err
	}
	if err := textTemplates.ExecuteTemplate(&t, name+".txt", data); err != nil {
		return "", "", err
	}
	return t.String(), h.String(), nil
}

func confirmationEmail(to, lang, confirmURL string) Email {
	s := emailStrings[normalizeLang(lang)]
	text, html, err := renderBoth("confirm", map[string]interface{}{"T": s, "URL": confirmURL})
	if err != nil {
		log.Printf("Error rendering confirmation email: %v\n", err)
	}
	return Email{To: to, Subject: s["confirmSubject"], Text: text, HTML: html}
}

// paragraphs splits plain text with blank lines into paragraphs for the templates.
func paragraphs(s string) []string {
	var out []string
	for _, p := range strings.Split(strings.ReplaceAll(s, "\r\n", "\n"), "\n\n") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func digestEmail(d Digest, to, unsubToken string) (Email, error) {
	lang := normalizeLang(d.Language)
	data := map[string]interface{}{
		"T":              emailStrings[lang],
		"Digest":         d,
		"Intro":          paragraphs(d.Intro),
		"Outro":          paragraphs(d.Outro),
		"Promo":          paragraphs(d.PromoText),
		"OnlineURL":      fmt.Sprintf("%s/%s/newsletter/%s/", siteURL(), lang, d.Slug),
		"UnsubscribeURL": unsubscribeURL(unsubToken),
	}
	text, html, err := renderBoth("digest", data)
	if err != nil {
		return Email{}, err
	}
	return Email{To: to, Subject: d.Title, Text: text, HTML: html, UnsubscribeURL: unsubscribeURL(unsubToken)}, nil
}

func renderUnsubscribePage(w io.Writer, lang, action string) {
	err := htmlTemplates.ExecuteTemplate(w, "unsubscribe.html", map[string]interface{}{
		"T": emailStrings[normalizeLang(lang)], "Lang": normalizeLang(lang), "Action": action,
	})
	if err != nil {
		log.Printf("Error rendering unsubscribe page: %v\n", err)
	}
}

func directusURL() string {
	if base := strings.TrimSuffix(os.Getenv("DIRECTUS_URL"), "/"); base != "" {
		return base
	}
	return "http://directus:8055"
}

func directusGet(ctx context.Context, path string, out interface{}) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, directusURL()+path, nil)
	if err != nil {
		return err
	}
	if token := os.Getenv("DIRECTUS_TOKEN"); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("directus returned %s", resp.Status)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func fetchDigest(ctx context.Context, id string) (Digest, error) {
	var body struct {
		Data Digest `json:"data"`
	}
	err := directusGet(ctx, "/items/digests/"+url.PathEscape(id)+"?fields="+digestFields, &body)
	return body.Data, err
}

// fetchDueDigests returns the published issues that haven't been sent and whose publish date has come.
// Drafts are never returned: publishing in Directus is the "reviewed, ready to go" step.
func fetchDueDigests(ctx context.Context, today string) ([]Digest, error) {
	q := url.Values{}
	q.Set("fields", digestFields)
	q.Set("limit", "-1")
	q.Set("filter[status][_eq]", "published")
	q.Set("filter[sent_at][_null]", "true")
	q.Set("filter[publish_date][_lte]", today)
	var body struct {
		Data []Digest `json:"data"`
	}
	err := directusGet(ctx, "/items/digests?"+q.Encode(), &body)
	return body.Data, err
}

// markDigestSent writes sent_at back to Directus so the editor can see it. Best effort.
func markDigestSent(id int) {
	base := directusURL()
	payload, _ := json.Marshal(map[string]string{"sent_at": time.Now().UTC().Format(time.RFC3339)})
	req, err := http.NewRequest(http.MethodPatch, fmt.Sprintf("%s/items/digests/%d", base, id), bytes.NewReader(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("DIRECTUS_TOKEN"))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Could not mark digest %d as sent: %v\n", id, err)
		return
	}
	resp.Body.Close()
}

// waitForPage polls the issue's public page until the site deploy has published it.
func waitForPage(pageURL string, timeout time.Duration) bool {
	deadline := time.Now().Add(timeout)
	for {
		resp, err := http.Get(pageURL)
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				return true
			}
		}
		if time.Now().After(deadline) {
			return false
		}
		time.Sleep(30 * time.Second)
	}
}

// POST /admin/newsletter/send?digest=ID          sends the issue to every active subscriber of its language.
// POST /admin/newsletter/send?digest=ID&test=a@b  sends only to that address (no tracking, can repeat).
func handleAdminSend(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := r.URL.Query().Get("digest")
	if id == "" {
		http.Error(w, "Missing digest", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	d, err := fetchDigest(ctx, id)
	if err != nil {
		http.Error(w, "Could not load digest: "+err.Error(), http.StatusBadGateway)
		return
	}

	if test := r.URL.Query().Get("test"); test != "" {
		email, err := digestEmail(d, test, "test")
		if err == nil {
			err = mailer.Send(email)
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write([]byte("Test sent"))
		return
	}

	if d.Status != "published" {
		http.Error(w, "Digest is not published", http.StatusConflict)
		return
	}
	err = claimSend(ctx, d)
	if mongo.IsDuplicateKeyError(err) {
		http.Error(w, "Digest already sent", http.StatusConflict)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	go sendDigest(d, r.URL.Query().Get("wait") != "false")
	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte("Sending"))
}

// claimSend records that an issue is being sent. The unique index on digestId makes sure
// an issue is only sent once, even if the manual endpoint and the weekly job both fire.
func claimSend(ctx context.Context, d Digest) error {
	_, err := sends.InsertOne(ctx, bson.M{"digestId": d.ID, "lang": normalizeLang(d.Language), "startedAt": time.Now()})
	return err
}

// newsletterSchedule is when the weekly job sends the issues that are ready. Monday 19:00 Madrid time
// leaves the day to review the Monday draft in Directus. Override with NEWSLETTER_SEND_SCHEDULE
// (cron syntax, "off" disables it).
func newsletterSchedule() string {
	if v := strings.TrimSpace(os.Getenv("NEWSLETTER_SEND_SCHEDULE")); v != "" {
		return v
	}
	return "CRON_TZ=Europe/Madrid 0 19 * * 1"
}

// sendDueDigests sends every published issue that hasn't gone out yet. Issues still in draft
// are left alone, so an issue only goes out once it has been reviewed and published.
func sendDueDigests() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	madrid, err := time.LoadLocation("Europe/Madrid")
	if err != nil {
		madrid = time.UTC
	}
	due, err := fetchDueDigests(ctx, time.Now().In(madrid).Format("2006-01-02"))
	if err != nil {
		log.Printf("Newsletter: could not load due issues: %v\n", err)
		notifyTelegram("Newsletter: no he podido leer los números de Directus, no se ha enviado nada: " + err.Error())
		return
	}
	if len(due) == 0 {
		log.Println("Newsletter: no published issue waiting to be sent")
		notifyTelegram("Newsletter: no hay ningún número publicado pendiente de enviar. Si había uno en borrador, publícalo y envíalo a mano.")
		return
	}
	for _, d := range due {
		err := claimSend(ctx, d)
		if mongo.IsDuplicateKeyError(err) {
			continue
		}
		if err != nil {
			log.Printf("Newsletter: could not start sending digest %d: %v\n", d.ID, err)
			continue
		}
		log.Printf("Newsletter: sending digest %d (%s)\n", d.ID, d.Language)
		go sendDigest(d, true)
	}
}

// releaseSend drops the send record when nothing was sent, so the issue can be sent again.
func releaseSend(id int) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	sends.DeleteOne(ctx, bson.M{"digestId": id})
}

func sendDigest(d Digest, waitForDeploy bool) {
	lang := normalizeLang(d.Language)
	if waitForDeploy {
		pageURL := fmt.Sprintf("%s/%s/newsletter/%s/", siteURL(), lang, d.Slug)
		if !waitForPage(pageURL, 30*time.Minute) {
			log.Printf("Digest %d: page %s not online after 30 min, sending anyway\n", d.ID, pageURL)
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Hour)
	defer cancel()

	cursor, err := subscribers.Find(ctx, bson.M{"status": "active", "lang": lang})
	if err != nil {
		log.Printf("Digest %d: error loading subscribers: %v\n", d.ID, err)
		releaseSend(d.ID)
		return
	}
	var list []Subscriber
	if err := cursor.All(ctx, &list); err != nil {
		log.Printf("Digest %d: error decoding subscribers: %v\n", d.ID, err)
		releaseSend(d.ID)
		return
	}

	delay := 500 * time.Millisecond
	if v, err := time.ParseDuration(os.Getenv("NEWSLETTER_SEND_DELAY")); err == nil {
		delay = v
	}
	sent, failed := 0, 0
	for _, s := range list {
		email, err := digestEmail(d, s.Email, s.UnsubscribeToken)
		if err == nil {
			err = mailer.Send(email)
		}
		if err != nil {
			failed++
			log.Printf("Digest %d: error sending to subscriber %s: %v\n", d.ID, s.ID.Hex(), err)
		} else {
			sent++
		}
		time.Sleep(delay)
	}

	sends.UpdateOne(ctx, bson.M{"digestId": d.ID}, bson.M{"$set": bson.M{
		"finishedAt": time.Now(), "sent": sent, "failed": failed,
	}})
	markDigestSent(d.ID)

	msg := fmt.Sprintf("Newsletter \"%s\" (%s): %d enviados, %d fallidos", d.Title, lang, sent, failed)
	log.Println(msg)
	if err := notifyTelegram(msg); err != nil {
		log.Printf("Error notifying Telegram: %v\n", err)
	}
}
