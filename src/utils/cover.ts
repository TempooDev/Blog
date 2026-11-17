import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Line } from "./lines";
import type { Lang } from "./routing";

/**
 * Generated post cover (1600×840), also used as og:image. Light palette only:
 * a band of the main line crosses the image with the post's station on it; a
 * transfer gets a second line crossing at 45° and a black station.
 */
export const COVER_WIDTH = 1600;
export const COVER_HEIGHT = 840;

const C = { bg: "#F4F2EE", ink: "#121212", ink2: "#5C5A55" };
// Same hex as --l1…--l5 in light mode (CSS variables don't exist here).
const LINE_HEX: Record<string, string> = {
    arquitectura: "#D7263D",
    ia: "#0FA37F",
    infra: "#F29E02",
    producto: "#1E88E5",
    oficio: "#5B3FD1",
};

const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/og", file));
let fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[] | undefined;
const loadFonts = () =>
    (fonts ??= [
        { name: "Overpass", data: font("overpass-600.ttf"), weight: 600, style: "normal" },
        { name: "Overpass", data: font("overpass-700.ttf"), weight: 700, style: "normal" },
        { name: "Overpass Mono", data: font("overpass-mono-400.ttf"), weight: 400, style: "normal" },
        { name: "Overpass Mono", data: font("overpass-mono-700.ttf"), weight: 700, style: "normal" },
    ]);

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
    type,
    props: { style, children },
});

const STATION = { es: "Estación", en: "Station" };

export async function renderCover({
    title,
    number,
    lines,
    tags,
    lang,
}: {
    title: string;
    number: string;
    lines: Line[];
    tags: string[];
    lang: Lang;
}) {
    const [main, second] = lines;
    const mainHex = main ? LINE_HEX[main.id] : C.ink;
    const sx = 1310;
    const sy = 640;
    // 72 px fits ~95 characters in three lines; longer titles step down.
    const titleSize = title.length > 95 ? 60 : 72;

    const children: Node[] = [];

    if (second) {
        children.push(
            h("div", {
                position: "absolute",
                left: sx - 640,
                top: sy - 14,
                width: 1280,
                height: 28,
                backgroundColor: LINE_HEX[second.id],
                transform: "rotate(-45deg)",
            }),
        );
    }
    children.push(
        h("div", { position: "absolute", left: 0, top: sy - 14, width: COVER_WIDTH, height: 28, backgroundColor: mainHex }),
        h("div", {
            position: "absolute",
            left: sx - 48,
            top: sy - 48,
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#FFFFFF",
            border: `12px solid ${second ? C.ink : mainHex}`,
        }),
    );

    const chips = lines.map((line) =>
        h(
            "div",
            {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 22px 7px",
                borderRadius: 26,
                backgroundColor: LINE_HEX[line.id],
                color: "#FFFFFF",
            },
            [
                h("span", { fontFamily: "Overpass Mono", fontWeight: 700, fontSize: 22 }, line.code),
                h("span", { fontFamily: "Overpass", fontWeight: 700, fontSize: 24 }, line.label[lang]),
            ],
        ),
    );

    children.push(
        h(
            "div",
            { position: "absolute", left: 96, top: 88, right: 96, display: "flex", flexDirection: "column" },
            [
                h("div", { display: "flex", alignItems: "center", gap: 14 }, [
                    ...chips,
                    h(
                        "span",
                        {
                            marginLeft: lines.length ? 10 : 0,
                            fontFamily: "Overpass Mono",
                            fontWeight: 700,
                            fontSize: 24,
                            letterSpacing: 3,
                            color: C.ink2,
                        },
                        `${STATION[lang].toUpperCase()} ${number}`,
                    ),
                ]),
                h(
                    "div",
                    {
                        marginTop: 36,
                        maxWidth: 1180,
                        maxHeight: Math.ceil(titleSize * 1.08 * 3) + 4,
                        overflow: "hidden",
                        fontFamily: "Overpass",
                        fontWeight: 700,
                        fontSize: titleSize,
                        lineHeight: 1.08,
                        letterSpacing: -1,
                        color: C.ink,
                    },
                    title,
                ),
                tags.length
                    ? h(
                          "div",
                          { marginTop: 26, fontFamily: "Overpass Mono", fontSize: 26, color: C.ink2 },
                          tags.slice(0, 5).join("  ·  "),
                      )
                    : h("div", {}),
            ],
        ),
        h(
            "div",
            {
                position: "absolute",
                left: 96,
                top: 748,
                fontFamily: "Overpass Mono",
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 1,
                color: C.ink,
            },
            "antoniobermudez.dev",
        ),
    );

    const svg = await satori(
        h(
            "div",
            {
                position: "relative",
                display: "flex",
                width: COVER_WIDTH,
                height: COVER_HEIGHT,
                backgroundColor: C.bg,
                overflow: "hidden",
            },
            children,
        ) as never,
        { width: COVER_WIDTH, height: COVER_HEIGHT, fonts: loadFonts() },
    );
    return new Resvg(svg, { fitTo: { mode: "width", value: COVER_WIDTH } }).render().asPng();
}
