import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { remarkMermaid } from "./src/plugins/remark-mermaid.mjs";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPostRedirects() {
  const redirects = {};
  const postsDir = './src/content/posts/en';

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    files.forEach(file => {
      const slug = file.replace(/\.mdx?$/, '');
      redirects[`/blog/${slug}`] = `/en/blog/${slug}`;
    });
  }
  return redirects;
}

function getWorkRedirects() {
  const redirects = {};
  const workDir = './src/content/work/en';
  
  if (fs.existsSync(workDir)) {
    const files = fs.readdirSync(workDir);
    files.forEach(file => {
      const slug = file.replace(/\.mdx?$/, '');
      redirects[`/work/${slug}`] = `/en/work/${slug}`;
    });
  }
  return redirects;
}

export default defineConfig({
  site: "https://antoniobermudez.dev/",
  integrations: [
    expressiveCode(),
    mdx(),
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: true,
      fallbackType: "redirect",
      redirectToDefaultLocale: true,
    },
    fallback: {
      es: "en",
    }
  },
  redirects: {
    ...getPostRedirects(),
    ...getWorkRedirects(),
  },
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  vite: {
    resolve: {
      alias: {
        '@components': resolve(__dirname, 'src/components'),
        '@layouts': resolve(__dirname, 'src/layouts'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@content': resolve(__dirname, 'src/content'),
        '@assets': resolve(__dirname, 'public/assets'),
        '@i18n': resolve(__dirname, 'src/i18n'),
      },
    },
  },
});
