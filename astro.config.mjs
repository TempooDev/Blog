import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import rehypeMermaid from 'rehype-mermaid';
import expressiveCode from 'astro-expressive-code';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site:'https://antoniobermudez.dev/',
  integrations: [expressiveCode(), mdx(), react(), sitemap()],
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: 'img-svg',
        mermaidConfig: {
          startOnLoad: true,
          securityLevel: 'loose',
          fontFamily: 'monospace'
        }
      }]
    ]
  }
});