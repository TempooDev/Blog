import { defineConfig } from 'astro';
import mermaid from 'mermaid';

export default defineConfig({
  plugins: [
    {
      name: 'mermaid',
      use: mermaid,
      options: {},
    },
  ],
});