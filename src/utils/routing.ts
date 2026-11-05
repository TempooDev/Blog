import { getCollection, type CollectionEntry } from "astro:content";

export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export function getLangStaticPaths() {
    return LANGS.map((lang) => ({ params: { lang } }));
}

export function getLangFromPath(pathname: string): Lang | undefined {
    const match = pathname.match(/^\/(en|es)(\/|$)/);
    return match ? (match[1] as Lang) : undefined;
}

/** Service pages have translated slugs, and the GDPR page only exists in English. */
export const SERVICE_PAGES: { id: string; es?: string; en: string }[] = [
    { id: "index", es: "/es/servicios/", en: "/en/services/" },
    { id: "ai-consulting", es: "/es/servicios/consultoria-ia/", en: "/en/services/ai-consulting/" },
    { id: "ai-integration", es: "/es/servicios/integracion-ia/", en: "/en/services/ai-integration/" },
    { id: "ai-automation", es: "/es/servicios/automatizacion-ia/", en: "/en/services/ai-automation/" },
    { id: "technical-consulting", es: "/es/servicios/consultoria-tecnologica/", en: "/en/services/fractional-cto/" },
    { id: "gdpr-compliant-ai", en: "/en/services/gdpr-compliant-ai/" },
];

export function findServicePage(pathname: string) {
    return SERVICE_PAGES.find((page) => page.es === pathname || page.en === pathname);
}

const withTrailingSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

/**
 * Returns the URL path of each language version of the current page, keyed by lang.
 * Posts/projects/newsletter issues are matched through `translationId` because their slugs differ per language.
 * Returns an empty object when the page has no language versions (404, root redirect...).
 */
export async function getAlternatePaths(
    pathname: string,
    entry?: CollectionEntry<"blog" | "work" | "newsletter">,
): Promise<Partial<Record<Lang, string>>> {
    if (entry) {
        const basePath = entry.collection === "blog" ? "blog" : entry.collection;
        const entries = await getCollection(entry.collection);
        const alternates: Partial<Record<Lang, string>> = {};
        for (const e of entries) {
            if (e.data.translationId !== entry.data.translationId) continue;
            const [lang, ...slugParts] = e.id.split("/");
            alternates[lang as Lang] = `/${lang}/${basePath}/${slugParts.join("/")}/`;
        }
        return alternates;
    }

    const servicePage = findServicePage(pathname);
    if (servicePage) {
        return Object.fromEntries(LANGS.flatMap((l) => (servicePage[l] ? [[l, servicePage[l]]] : [])));
    }

    const lang = getLangFromPath(pathname);
    if (!lang) return {};
    const rest = withTrailingSlash(pathname.slice(lang.length + 1) || "/");
    return Object.fromEntries(LANGS.map((l) => [l, `/${l}${rest}`]));
}
