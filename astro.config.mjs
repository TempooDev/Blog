import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import rehypeMermaid from "rehype-mermaid";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPostRedirects() {
  const redirects = {};
  const postsDir = './src/content/posts/en';

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    files.forEach(file => {
      const slug = file.replace(/\.mdx?$/, '');
      redirects[`/blog/${slug}`] = `/blog/en/${slug}`;
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
      redirects[`/work/${slug}`] = `/work/en/${slug}`;
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
    defaultLocale: "es",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: true,
      fallbackType: "redirect",
      redirectToDefaultLocale: true,
    },
    fallback: {
      en: "es",
    }
  },
  redirects: {
    ...getPostRedirects(),
    ...getWorkRedirects(),
  },
  markdown: {
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: "img-svg",
          mermaidConfig: {
            startOnLoad: true,
            securityLevel: "loose",
            fontFamily: "monospace",
          },
        },
      ],
    ],
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
