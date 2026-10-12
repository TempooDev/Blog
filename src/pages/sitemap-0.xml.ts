import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { DEFAULT_LANG, LANGS, getAlternatePaths, type Lang } from "../utils/routing";

interface SitemapUrl {
  path: string;
  lastmod?: Date;
  alternates: Partial<Record<Lang, string>>;
}

const latest = (dates: Date[]) =>
  dates.length ? new Date(Math.max(...dates.map((d) => d.valueOf()))) : undefined;

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const [posts, work] = await Promise.all([getCollection("blog"), getCollection("work")]);
  const urls: SitemapUrl[] = [];

  for (const lang of LANGS) {
    const inLang = <T extends { id: string }>(entries: T[]) =>
      entries.filter((e) => e.id.startsWith(`${lang}/`));
    const postDates = inLang(posts).map((p) => p.data.publishDate);
    const workDates = inLang(work).map((w) => w.data.publishDate);

    const pages: [string, Date | undefined][] = [
      [`/${lang}/`, latest([...postDates, ...workDates])],
      [`/${lang}/blog/`, latest(postDates)],
      [`/${lang}/work/`, latest(workDates)],
      [`/${lang}/about/`, undefined],
    ];
    for (const [path, lastmod] of pages) {
      urls.push({ path, lastmod, alternates: await getAlternatePaths(path) });
    }
  }

  for (const entry of [...posts, ...work]) {
    const alternates = await getAlternatePaths("", entry);
    const [lang] = entry.id.split("/") as [Lang];
    urls.push({ path: alternates[lang]!, lastmod: entry.data.publishDate, alternates });
  }

  const body = urls
    .map(({ path, lastmod, alternates }) => {
      const links = Object.entries(alternates);
      const hreflangs =
        links.length > 1
          ? [...links, ["x-default", alternates[DEFAULT_LANG] ?? links[0][1]]]
              .map(
                ([hreflang, href]) =>
                  `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(new URL(href!, site).href)}"/>`,
              )
              .join("")
          : "";
      return `<url><loc>${escapeXml(new URL(path, site).href)}</loc>${
        lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""
      }${hreflangs}</url>`;
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
