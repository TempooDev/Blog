import type { CollectionEntry } from "astro:content";
import type { Lang } from "./routing";

/**
 * The five fixed lines of the blog map. Posts pick one or two in Directus (`lines`);
 * technologies stay as plain tags. Colors live in global.css as --l1…--l5.
 */
export const LINES = [
    { id: "arquitectura", code: "L1", color: "var(--l1)", label: { es: "Arquitectura", en: "Architecture" } },
    { id: "ia", code: "L2", color: "var(--l2)", label: { es: "IA", en: "AI" } },
    { id: "infra", code: "L3", color: "var(--l3)", label: { es: "Infra", en: "Infra" } },
    { id: "producto", code: "L4", color: "var(--l4)", label: { es: "Producto", en: "Product" } },
    { id: "oficio", code: "L5", color: "var(--l5)", label: { es: "Oficio", en: "Craft" } },
] as const;

export type LineId = (typeof LINES)[number]["id"];
export type Line = (typeof LINES)[number];

export const getLine = (id: LineId): Line => LINES.find((l) => l.id === id)!;

/** Projects drawn as the terminal (end of line) of a line. */
export const TERMINALS: {
    line: LineId;
    name: string;
    href: string | { es: string; en: string };
    description: { es: string; en: string };
}[] = [
    {
        line: "producto",
        name: "Tempoo Analytics",
        href: "https://tempooanalytics.eu/",
        description: {
            es: "Analítica web propia, sin cookies y de código abierto. Con API pública y servidor MCP.",
            en: "My own cookie-free, open source web analytics. With a public API and MCP server.",
        },
    },
    {
        line: "ia",
        name: "relay-mcp",
        href: "https://github.com/TempooDev",
        description: {
            es: "Proyecto de IA en local basado en MCP.",
            en: "A local AI project built on MCP.",
        },
    },
    {
        line: "arquitectura",
        name: "BlazorSignalStore",
        href: { es: "/es/work/blazorsignalstore/", en: "/en/work/blazorsignalstore/" },
        description: {
            es: "Gestión de estado reactiva para aplicaciones Blazor.",
            en: "Reactive state management for Blazor apps.",
        },
    },
];

export const terminalHref = (t: (typeof TERMINALS)[number], lang: Lang) =>
    typeof t.href === "string" ? t.href : t.href[lang];

type Post = CollectionEntry<"blog">;

export interface Station {
    post: Post;
    /** Two-digit station number: publication order inside the language, 01 = oldest. */
    number: string;
    lines: Line[];
    href: string;
    year: number | undefined;
}

const byDateAsc = (a: Post, b: Post) =>
    (a.data.publishDate?.valueOf() ?? 0) - (b.data.publishDate?.valueOf() ?? 0);

export const postHref = (post: Post) => {
    const [lang, ...slug] = post.id.split("/");
    return `/${lang}/blog/${slug.join("/")}/`;
};

/** All posts of a language as stations, newest first. */
export function toStations(posts: Post[]): Station[] {
    return [...posts]
        .sort(byDateAsc)
        .map((post, i) => ({
            post,
            number: String(i + 1).padStart(2, "0"),
            lines: post.data.lines.map(getLine),
            href: postHref(post),
            year: post.data.publishDate?.getUTCFullYear(),
        }))
        .reverse();
}

/** Previous and next station on a given line (chronological), for the post page. */
export function neighbours(stations: Station[], current: Station, line: LineId) {
    const onLine = stations.filter((s) => s.post.data.lines.includes(line)).reverse(); // oldest first
    const i = onLine.findIndex((s) => s.post.id === current.post.id);
    return { prev: i > 0 ? onLine[i - 1] : undefined, next: i >= 0 ? onLine[i + 1] : undefined };
}

const MONTHS = {
    es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "16 nov 2026" / "16 Nov 2026", always in UTC like the CMS dates. */
export function formatDate(date: Date | undefined, lang: Lang) {
    if (!date) return "";
    return `${date.getUTCDate()} ${MONTHS[lang][date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
