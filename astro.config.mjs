import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import rehypeMermaid from 'rehype-mermaid';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [expressiveCode(), mdx(), react()],
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, {
        theme: 'neutral',
        mermaidConfig: {
          startOnLoad: true,
          securityLevel: 'loose',
          fontFamily: 'monospace'
        }
      }]
    ]
  }
});