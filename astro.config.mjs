import rehypeMermaid from 'rehype-mermaid';
import addMermaidClass from './src/add-mermaid-classname.ts';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
markdown: {
    rehypePlugins: [
      addMermaidClass,
      rehypeMermaid,
    ]
  } ,
   integrations: [mdx(), react()],
});
