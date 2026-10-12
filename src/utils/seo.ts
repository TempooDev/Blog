import type { CollectionEntry } from "astro:content";
import type { Lang } from "./routing";

export const SITE_NAME = "Antonio Bermúdez";
export const DEFAULT_IMAGE = "/assets/portrait.webp";

export const OG_LOCALES: Record<Lang, string> = {
    en: "en_US",
    es: "es_ES",
};

const AUTHOR = {
    "@type": "Person",
    name: "Antonio Bermúdez Rodríguez",
    jobTitle: "Software Engineer",
    sameAs: [
        "https://github.com/TempooDev",
        "https://www.linkedin.com/in/antoniobermudezr/",
    ],
};

export function getPersonJsonLd(site: URL) {
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: site.href,
            inLanguage: ["en", "es"],
        },
        {
            "@context": "https://schema.org",
            ...AUTHOR,
            url: site.href,
            image: new URL(DEFAULT_IMAGE, site).href,
        },
    ];
}

export function getEntryJsonLd(
    entry: CollectionEntry<"blog" | "work">,
    url: URL,
    lang: Lang,
    image: string,
) {
    return [
        {
            "@context": "https://schema.org",
            "@type": entry.collection === "blog" ? "BlogPosting" : "CreativeWork",
            headline: entry.data.title,
            description: entry.data.description,
            image,
            datePublished: entry.data.publishDate.toISOString(),
            inLanguage: lang,
            keywords: entry.data.tags.join(", "),
            mainEntityOfPage: url.href,
            url: url.href,
            author: { ...AUTHOR, url: url.origin },
        },
    ];
}
