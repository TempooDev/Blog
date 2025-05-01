import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import rehypeMermaid from 'rehype-mermaid';
import expressiveCode from 'astro-expressive-code';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [expressiveCode(), mdx(), react()],
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