package main

import (
	"net"
	"net/textproto"
	"strings"
	"testing"
	"time"
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
	m := &Mailer{Host: host, Port: port, From: "Blog <newsletter@antoniobermudez.dev>"}
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
