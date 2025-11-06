import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OUT_DIR = 'public/fonts';

const families = [
  { name: 'Public Sans', query: 'Public+Sans:wght@400;700', fileBase: 'public-sans', weights: [400, 700] },
  { name: 'Rubik', query: 'Rubik:wght@500', fileBase: 'rubik', weights: [500] },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

function extractFontUrl(block) {
  // Google Fonts v2 CSS lists multiple src entries; pick first woff2 in block.
  const all = [...block.matchAll(/url\((https:[^\)\s]+\.woff2)\)/gi)].map(m => m[1]);
  return all[0] || null;
}

async function processFamily({ name, query, fileBase, weights }) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
  const css = await fetchText(cssUrl);
  // Split into @font-face blocks
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
  for (const w of weights) {
    // Filter blocks by weight and normal style
    const candidates = blocks.filter((b) => b.includes(`font-weight: ${w}`) && b.includes('font-style: normal'))
                      || blocks.filter((b) => b.includes(`font-weight:${w}`));
    // Prefer latin basic range if present to reduce file size
    const block = candidates.find((b) => b.includes('U+0000-00FF'))
              || candidates[candidates.length - 1];
    if (!block) {
      console.warn(`[warn] No @font-face block found for ${name} weight ${w}`);
      continue;
    }
    const url = extractFontUrl(block);
    if (!url) {
      console.warn(`[warn] No woff2 URL found for ${name} weight ${w}`);
      continue;
    }
    const buf = await fetchBuffer(url);
    const outName = `${fileBase}-${w}.woff2`;
    const outPath = join(OUT_DIR, outName);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, buf);
    console.log(`[ok] Saved ${outName} (${(buf.length/1024).toFixed(1)} KiB)`);
  }
}

try {
  for (const fam of families) {
    // eslint-disable-next-line no-await-in-loop
    await processFamily(fam);
  }
  console.log('\nAll fonts downloaded to', OUT_DIR);
} catch (err) {
  console.error('Error while fetching fonts:', err);
  process.exit(1);
}
