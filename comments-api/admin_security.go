package main

import (
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

// dashboardCSP only lets the dashboard run its own inline script and style (pinned by hash),
// talk to this API, and never be framed. Built once from the embedded page.
var dashboardCSP = buildDashboardCSP(dashboardHTML)

var inlineBlock = regexp.MustCompile(`(?s)<(script|style)>(.*?)</(?:script|style)>`)

func buildDashboardCSP(page []byte) string {
	var scripts, styles []string
	for _, m := range inlineBlock.FindAllSubmatch(page, -1) {
		sum := sha256.Sum256(m[2])
		hash := "'sha256-" + base64.StdEncoding.EncodeToString(sum[:]) + "'"
		if string(m[1]) == "script" {
			scripts = append(scripts, hash)
		} else {
			styles = append(styles, hash)
		}
	}
	return "default-src 'none'; script-src " + strings.Join(scripts, " ") +
		"; style-src " + strings.Join(styles, " ") +
		"; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
}

// setAdminHeaders keeps admin pages and data out of caches and frames.
func setAdminHeaders(w http.ResponseWriter) {
	h := w.Header()
	h.Set("Cache-Control", "no-store")
	h.Set("X-Frame-Options", "DENY")
	h.Set("X-Content-Type-Options", "nosniff")
	h.Set("Referrer-Policy", "no-referrer")
	h.Set("X-Robots-Tag", "noindex, nofollow")
}

// crossSiteRequest reports whether a state-changing request came from another site. The browser
// resends Basic Auth credentials on its own, so without this a page elsewhere could make the
// logged-in browser approve comments or send the newsletter. curl sends neither header and passes.
func crossSiteRequest(r *http.Request) bool {
	if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
		return false
	}
	if site := r.Header.Get("Sec-Fetch-Site"); site != "" {
		return site != "same-origin" && site != "none"
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		u, err := url.Parse(origin)
		return err != nil || u.Host != r.Host
	}
	return false
}
