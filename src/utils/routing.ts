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

    const lang = getLangFromPath(pathname);
    if (!lang) return {};
    const rest = withTrailingSlash(pathname.slice(lang.length + 1) || "/");
    return Object.fromEntries(LANGS.map((l) => [l, `/${l}${rest}`]));
}
