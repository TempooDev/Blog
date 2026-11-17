import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { byPublishDateDesc } from "../../utils/dates";
import { postHref } from "../../utils/lines";
import { getLangStaticPaths, type Lang } from "../../utils/routing";
import { blogI18n } from "../../i18n/pages/collections";

export const getStaticPaths = getLangStaticPaths;

const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of the blog in each language: /es/rss.xml and /en/rss.xml */
export const GET: APIRoute = async ({ params, site }) => {
    const lang = params.lang as Lang;
    const posts = (await getCollection("blog", ({ id }) => id.startsWith(`${lang}/`))).sort(byPublishDateDesc);
    const t = blogI18n[lang];
    const home = new URL(`/${lang}/blog/`, site).href;

    const items = posts
        .map((post) => {
            const url = new URL(postHref(post), site).href;
            return `    <item>
      <title>${escape(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(post.data.description)}</description>${
          post.data.publishDate ? `\n      <pubDate>${post.data.publishDate.toUTCString()}</pubDate>` : ""
      }
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(t.metaTitle)}</title>
    <link>${home}</link>
    <description>${escape(t.tagline)}</description>
    <language>${lang}</language>
    <atom:link href="${new URL(`/${lang}/rss.xml`, site).href}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
    return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
