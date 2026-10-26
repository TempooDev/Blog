package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"mime"
	"mime/quotedprintable"
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

// Mailer sends through any SMTP provider with STARTTLS (Mailjet, Brevo, Scaleway, SES...).
type Mailer struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string // e.g. "Antonio Bermúdez <newsletter@antoniobermudez.dev>"
}

func newMailerFromEnv() *Mailer {
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	return &Mailer{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     port,
		User:     os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASSWORD"),
		From:     os.Getenv("NEWSLETTER_FROM"),
	}
}

func (m *Mailer) Configured() bool {
	return m.Host != "" && m.From != ""
}

func (m *Mailer) Send(e Email) error {
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
