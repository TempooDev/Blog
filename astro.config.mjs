import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { remarkMermaid } from "./src/plugins/remark-mermaid.mjs";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import { unified } from '@astrojs/markdown-remark';
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
  output: 'static',
  integrations: [
    expressiveCode(),
    mdx(),
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          es: "es",
        },
      },
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname;
        // Do not include the root "/" as it's just a redirect
        if (path === '/') return false;
        return path.startsWith('/en/') || path.startsWith('/es/');
      },
    }),
  ].flat(),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: true,
      fallbackType: "redirect",
      redirectToDefaultLocale: false,
    },
    fallback: {
      es: "en",
    }
  },
  redirects: {
    ...getPostRedirects(),
    ...getWorkRedirects(),
    '/about': '/en/about',
    '/blog': '/en/blog',
    '/work': '/en/work',
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaid],
    }),
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
