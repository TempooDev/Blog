package main

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/robfig/cron/v3"
)

func TestNormalizeEmail(t *testing.T) {
	cases := map[string]string{
		"Ana@Example.com":          "ana@example.com",
		"  ana@example.com ":       "ana@example.com",
		"ana@localhost":            "",
		"Ana <ana@example.com>":    "",
		"not-an-email":             "",
		"":                         "",
		"a@b.c, other@example.com": "",
	}
	for in, want := range cases {
		if got := normalizeEmail(in); got != want {
			t.Errorf("normalizeEmail(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestRateLimiter(t *testing.T) {
	l := newRateLimiter(2, time.Hour)
	if !l.Allow("ip") || !l.Allow("ip") {
		t.Fatal("first two requests should pass")
	}
	if l.Allow("ip") {
		t.Fatal("third request should be limited")
	}
	if !l.Allow("other") {
		t.Fatal("limits are per key")
	}
}

func TestDigestEmail(t *testing.T) {
	t.Setenv("PUBLIC_API_URL", "https://comments.example.com")
	t.Setenv("SITE_URL", "https://antoniobermudez.dev")
	d := Digest{
		ID: 1, Title: "IA y tecnología #1", Slug: "ia-tecnologia-1", Language: "es",
		Intro: "Hola.\n\nSegundo párrafo <b>con html</b>.",
		Items: []DigestItem{{Title: "Nuevo modelo", URL: "https://example.com/a", Source: "Example", Category: "IA",
			Summary: "Resumen", WhyItMatters: "Porque sí"}},
	}
	e, err := digestEmail(d, "ana@example.com", "tok")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{
		"https://antoniobermudez.dev/es/newsletter/ia-tecnologia-1/",
		"https://comments.example.com/newsletter/unsubscribe?token=tok",
		"Por qué importa",
		"&lt;b&gt;con html&lt;/b&gt;",
	} {
		if !strings.Contains(e.HTML, want) {
			t.Errorf("HTML missing %q", want)
		}
	}
	if !strings.Contains(e.Text, "Nuevo modelo\nhttps://example.com/a") {
		t.Errorf("text version missing item:\n%s", e.Text)
	}
	if e.UnsubscribeURL == "" {
		t.Error("digest emails must carry List-Unsubscribe")
	}
}

func TestBuildMessageHeaders(t *testing.T) {
	msg, err := buildMessage("Antonio Bermúdez <newsletter@antoniobermudez.dev>", Email{
		To: "ana@example.com", Subject: "Confirma tu suscripción", Text: "hola", HTML: "<p>hola</p>",
		UnsubscribeURL: "https://comments.example.com/newsletter/unsubscribe?token=x",
	}, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	s := string(msg)
	for _, want := range []string{
		"List-Unsubscribe: <https://comments.example.com/newsletter/unsubscribe?token=x>",
		"List-Unsubscribe-Post: List-Unsubscribe=One-Click",
		"Subject: =?utf-8?q?",
		"From: =?utf-8?q?Antonio_Berm=C3=BAdez?= <newsletter@antoniobermudez.dev>",
		"Content-Type: text/html; charset=utf-8",
	} {
		if !strings.Contains(s, want) {
			t.Errorf("message missing %q", want)
		}
	}
}

// fakeSMTP accepts one message and returns its DATA section.
func fakeSMTP(t *testing.T) (addr string, got chan string) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	got = make(chan string, 1)
	go func() {
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		tp := textproto.NewConn(conn)
		tp.PrintfLine("220 fake")
		for {
			line, err := tp.ReadLine()
			if err != nil {
				return
			}
			switch {
			case strings.HasPrefix(line, "EHLO"):
				tp.PrintfLine("250 fake")
			case strings.HasPrefix(line, "DATA"):
				tp.PrintfLine("354 go")
				data, _ := tp.ReadDotLines()
				got <- strings.Join(data, "\n")
				tp.PrintfLine("250 ok")
			case strings.HasPrefix(line, "QUIT"):
				tp.PrintfLine("221 bye")
				return
			default:
				tp.PrintfLine("250 ok")
			}
		}
	}()
	return ln.Addr().String(), got
}

func TestMailerSend(t *testing.T) {
	addr, got := fakeSMTP(t)
	host, port, _ := net.SplitHostPort(addr)
	m := &SMTPSender{Host: host, Port: port, From: "Blog <newsletter@antoniobermudez.dev>"}
	if err := m.Send(confirmationEmail("ana@example.com", "en", "https://x/confirm?token=1")); err != nil {
		t.Fatal(err)
	}
	select {
	case data := <-got:
		if !strings.Contains(data, "Confirm your newsletter subscription") || !strings.Contains(data, "token=3D1") {
			t.Errorf("unexpected message:\n%s", data)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("no message received")
	}
}

func TestHTTPSender(t *testing.T) {
	var got map[string]interface{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer secret" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		json.NewDecoder(r.Body).Decode(&got)
		w.WriteHeader(http.StatusAccepted)
	}))
	defer srv.Close()

	h := &HTTPSender{URL: srv.URL, Token: "secret", From: "Blog <newsletter@antoniobermudez.dev>"}
	err := h.Send(Email{To: "ana@example.com", Subject: "Hola", Text: "t", HTML: "<p>h</p>",
		UnsubscribeURL: "https://x/newsletter/unsubscribe?token=1"})
	if err != nil {
		t.Fatal(err)
	}
	headers, _ := got["headers"].(map[string]interface{})
	if got["to"] != "ana@example.com" || headers["List-Unsubscribe-Post"] != "List-Unsubscribe=One-Click" {
		t.Errorf("unexpected payload: %v", got)
	}
}

func TestSenderFromEnv(t *testing.T) {
	t.Setenv("MAIL_DRIVER", "http")
	if _, ok := newSenderFromEnv().(*HTTPSender); !ok {
		t.Error("MAIL_DRIVER=http should give an HTTPSender")
	}
	t.Setenv("MAIL_DRIVER", "")
	if _, ok := newSenderFromEnv().(*SMTPSender); !ok {
		t.Error("SMTP is the default driver")
	}
}

func TestClientIP(t *testing.T) {
	r := httptest.NewRequest(http.MethodPost, "/newsletter/subscribe", nil)
	r.RemoteAddr = "10.0.0.2:1234"
	if got := clientIP(r); got != "10.0.0.2" {
		t.Errorf("without proxy headers, got %q", got)
	}
	// A client can prepend fake hops; the proxy appends the real one last
	r.Header.Set("X-Forwarded-For", "1.1.1.1, 203.0.113.7")
	if got := clientIP(r); got != "203.0.113.7" {
		t.Errorf("should use the last hop, got %q", got)
	}
	t.Setenv("CLIENT_IP_HEADER", "CF-Connecting-IP")
	r.Header.Set("CF-Connecting-IP", "198.51.100.9")
	if got := clientIP(r); got != "198.51.100.9" {
		t.Errorf("should use CLIENT_IP_HEADER, got %q", got)
	}
}

func TestAdminLoginRateLimit(t *testing.T) {
	t.Setenv("ADMIN_USER", "admin")
	t.Setenv("ADMIN_PASSWORD", "secret")
	loginLimiter = newRateLimiter(5, 15*time.Minute)
	h := authMiddleware(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	call := func(ip, user, pass string, withCreds bool) int {
		r := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
		r.RemoteAddr = ip + ":1234"
		if withCreds {
			r.SetBasicAuth(user, pass)
		}
		w := httptest.NewRecorder()
		h(w, r)
		return w.Code
	}

	// Requests without credentials (the browser's first hit) don't count
	for i := 0; i < 10; i++ {
		if code := call("10.0.0.1", "", "", false); code != http.StatusUnauthorized {
			t.Fatalf("no credentials: got %d", code)
		}
	}
	if code := call("10.0.0.1", "admin", "secret", true); code != http.StatusOK {
		t.Fatalf("right password should pass, got %d", code)
	}
	for i := 0; i < 5; i++ {
		if code := call("10.0.0.1", "admin", "wrong", true); code != http.StatusUnauthorized {
			t.Fatalf("attempt %d: got %d", i+1, code)
		}
	}
	// Locked out, even with the right password
	if code := call("10.0.0.1", "admin", "secret", true); code != http.StatusTooManyRequests {
		t.Fatalf("after 5 failures: got %d", code)
	}
	// Other IPs are not affected
	if code := call("10.0.0.2", "admin", "secret", true); code != http.StatusOK {
		t.Fatalf("other IP: got %d", code)
	}
}

func TestDigestEmailPromo(t *testing.T) {
	d := Digest{ID: 1, Title: "AI & tech #2", Slug: "ai-tech-2", Language: "en",
		Items:      []DigestItem{{Title: "News", URL: "https://example.com/a", Summary: "Summary"}},
		PromoTitle: "Tempoo Analytics", PromoText: "Privacy-first analytics.", PromoURL: "https://tempooanalytics.eu"}
	e, err := digestEmail(d, "ana@example.com", "tok")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"Tempoo Analytics", "Privacy-first analytics.", `href="https://tempooanalytics.eu"`, "Learn more"} {
		if !strings.Contains(e.HTML, want) {
			t.Errorf("HTML missing %q", want)
		}
	}
	if !strings.Contains(e.Text, "Learn more: https://tempooanalytics.eu") {
		t.Errorf("text version missing promo link:\n%s", e.Text)
	}

	d.PromoTitle, d.PromoURL = "", "javascript:alert(1)"
	if e, _ = digestEmail(d, "ana@example.com", "tok"); strings.Contains(e.HTML, "Privacy-first") {
		t.Error("promo block must not render without a title")
	}
	d.PromoTitle = "Bad link"
	if e, _ = digestEmail(d, "ana@example.com", "tok"); strings.Contains(e.HTML, "javascript:") {
		t.Error("unsafe promo URL must be sanitised")
	}
}

func TestFetchDueDigests(t *testing.T) {
	var query url.Values
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query = r.URL.Query()
		if r.Header.Get("Authorization") != "Bearer secret" {
			t.Errorf("missing token")
		}
		w.Write([]byte(`{"data":[{"id":7,"language":"es","status":"published","sent_at":null,"promo_title":"P"}]}`))
	}))
	defer srv.Close()
	t.Setenv("DIRECTUS_URL", srv.URL)
	t.Setenv("DIRECTUS_TOKEN", "secret")

	due, err := fetchDueDigests(context.Background(), "2026-11-02")
	if err != nil {
		t.Fatal(err)
	}
	if len(due) != 1 || due[0].ID != 7 || due[0].PromoTitle != "P" {
		t.Errorf("got %+v", due)
	}
	for k, v := range map[string]string{
		"filter[status][_eq]":        "published",
		"filter[sent_at][_null]":     "true",
		"filter[publish_date][_lte]": "2026-11-02",
	} {
		if query.Get(k) != v {
			t.Errorf("%s = %q, want %q", k, query.Get(k), v)
		}
	}
}

func TestNewsletterSchedule(t *testing.T) {
	sched, err := cron.ParseStandard(newsletterSchedule())
	if err != nil {
		t.Fatal(err)
	}
	// Sunday 1 Nov 2026 12:00 UTC: next run is Monday 2 Nov at 19:00 Madrid (18:00 UTC, winter time)
	next := sched.Next(time.Date(2026, 11, 1, 12, 0, 0, 0, time.UTC))
	if want := time.Date(2026, 11, 2, 18, 0, 0, 0, time.UTC); !next.Equal(want) {
		t.Errorf("next run %v, want %v", next.UTC(), want)
	}
}
