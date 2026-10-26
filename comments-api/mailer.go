package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"mime"
	"mime/quotedprintable"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// Email is a multipart/alternative message (plain text + HTML).
type Email struct {
	To             string
	Subject        string
	Text           string
	HTML           string
	UnsubscribeURL string // adds List-Unsubscribe headers (RFC 8058) when set
}

// Sender delivers one email. The driver is picked with MAIL_DRIVER, so the provider can be
// swapped (SMTP provider, Amazon SES, an own service) without touching the newsletter code.
type Sender interface {
	Send(e Email) error
	Configured() bool
}

// newSenderFromEnv: MAIL_DRIVER=smtp (default) | http | log
func newSenderFromEnv() Sender {
	from := os.Getenv("NEWSLETTER_FROM")
	switch os.Getenv("MAIL_DRIVER") {
	case "http":
		return &HTTPSender{URL: os.Getenv("MAIL_HTTP_URL"), Token: os.Getenv("MAIL_HTTP_TOKEN"), From: from}
	case "log":
		return &LogSender{}
	default:
		return newSMTPSenderFromEnv()
	}
}

// SMTPSender sends through any SMTP server with STARTTLS: Mailjet, Brevo, Scaleway TEM,
// Amazon SES (SMTP interface) or a self-hosted MTA.
type SMTPSender struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string // e.g. "Antonio Bermúdez <newsletter@antoniobermudez.dev>"
}

func newSMTPSenderFromEnv() *SMTPSender {
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	return &SMTPSender{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     port,
		User:     os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASSWORD"),
		From:     os.Getenv("NEWSLETTER_FROM"),
	}
}

func (m *SMTPSender) Configured() bool {
	return m.Host != "" && m.From != ""
}

func (m *SMTPSender) Send(e Email) error {
	if !m.Configured() {
		return fmt.Errorf("SMTP is not configured (SMTP_HOST / NEWSLETTER_FROM)")
	}
	msg, err := buildMessage(m.From, e, time.Now())
	if err != nil {
		return err
	}
	var auth smtp.Auth
	if m.User != "" {
		auth = smtp.PlainAuth("", m.User, m.Password, m.Host)
	}
	return smtp.SendMail(m.Host+":"+m.Port, auth, envelopeAddress(m.From), []string{e.To}, msg)
}

// HTTPSender POSTs each email as JSON to an HTTP endpoint (an own mail service, or an adapter
// in front of a provider API). Any 2xx answer counts as delivered.
//
//	{"from": "...", "to": "...", "subject": "...", "text": "...", "html": "...", "headers": {"List-Unsubscribe": "..."}}
type HTTPSender struct {
	URL   string
	Token string // sent as "Authorization: Bearer <token>" when set
	From  string
}

func (h *HTTPSender) Configured() bool {
	return h.URL != "" && h.From != ""
}

func (h *HTTPSender) Send(e Email) error {
	if !h.Configured() {
		return fmt.Errorf("HTTP mail driver is not configured (MAIL_HTTP_URL / NEWSLETTER_FROM)")
	}
	headers := map[string]string{}
	if e.UnsubscribeURL != "" {
		headers["List-Unsubscribe"] = "<" + e.UnsubscribeURL + ">"
		headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
	}
	payload, err := json.Marshal(map[string]interface{}{
		"from": h.From, "to": e.To, "subject": e.Subject, "text": e.Text, "html": e.HTML, "headers": headers,
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, h.URL, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if h.Token != "" {
		req.Header.Set("Authorization", "Bearer "+h.Token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return fmt.Errorf("mail service returned %s", resp.Status)
	}
	return nil
}

// LogSender only logs the email. For local development.
type LogSender struct{}

func (LogSender) Configured() bool { return true }

func (LogSender) Send(e Email) error {
	log.Printf("[mail] to=%s subject=%q\n%s\n", e.To, e.Subject, e.Text)
	return nil
}

// envelopeAddress returns the bare address from "Name <addr>".
func envelopeAddress(from string) string {
	if i := strings.LastIndex(from, "<"); i >= 0 {
		return strings.TrimSuffix(from[i+1:], ">")
	}
	return from
}

func encodeFrom(from string) string {
	i := strings.LastIndex(from, "<")
	if i <= 0 {
		return from
	}
	name := strings.TrimSpace(from[:i])
	return mime.QEncoding.Encode("utf-8", name) + " " + from[i:]
}

func buildMessage(from string, e Email, now time.Time) ([]byte, error) {
	boundary := randomHex(16)
	domain := envelopeAddress(from)
	if i := strings.LastIndex(domain, "@"); i >= 0 {
		domain = domain[i+1:]
	}

	var b bytes.Buffer
	header := func(k, v string) { fmt.Fprintf(&b, "%s: %s\r\n", k, v) }
	header("From", encodeFrom(from))
	header("To", e.To)
	header("Subject", mime.QEncoding.Encode("utf-8", e.Subject))
	header("Date", now.Format(time.RFC1123Z))
	header("Message-ID", fmt.Sprintf("<%s@%s>", randomHex(12), domain))
	header("MIME-Version", "1.0")
	if e.UnsubscribeURL != "" {
		header("List-Unsubscribe", "<"+e.UnsubscribeURL+">")
		header("List-Unsubscribe-Post", "List-Unsubscribe=One-Click")
	}
	header("Content-Type", `multipart/alternative; boundary="`+boundary+`"`)
	b.WriteString("\r\n")

	for _, part := range []struct{ ctype, body string }{
		{"text/plain", e.Text},
		{"text/html", e.HTML},
	} {
		fmt.Fprintf(&b, "--%s\r\n", boundary)
		fmt.Fprintf(&b, "Content-Type: %s; charset=utf-8\r\n", part.ctype)
		b.WriteString("Content-Transfer-Encoding: quoted-printable\r\n\r\n")
		qp := quotedprintable.NewWriter(&b)
		if _, err := qp.Write([]byte(part.body)); err != nil {
			return nil, err
		}
		if err := qp.Close(); err != nil {
			return nil, err
		}
		b.WriteString("\r\n")
	}
	fmt.Fprintf(&b, "--%s--\r\n", boundary)
	return b.Bytes(), nil
}

func randomHex(n int) string {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return hex.EncodeToString(buf)
}
