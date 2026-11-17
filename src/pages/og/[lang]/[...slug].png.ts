import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { renderCover } from "../../../utils/cover";
import { toStations } from "../../../utils/lines";
import { LANGS, type Lang } from "../../../utils/routing";

/** /og/<lang>/<slug>.png — the generated cover of each post, built at compile time. */
export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getCollection("blog");
    return LANGS.flatMap((lang) =>
        toStations(posts.filter((p) => p.id.startsWith(`${lang}/`))).map((station) => ({
            params: { lang, slug: station.post.id.split("/").slice(1).join("/") },
            props: { post: station.post, number: station.number, lines: station.lines },
        })),
    );
};

export const GET: APIRoute = async ({ params, props }) => {
    const { post, number, lines } = props as {
        post: CollectionEntry<"blog">;
        number: string;
        lines: Parameters<typeof renderCover>[0]["lines"];
    };
    const png = await renderCover({
        title: post.data.title,
        number,
        lines,
        tags: post.data.tags,
        lang: params.lang as Lang,
    });
    return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
