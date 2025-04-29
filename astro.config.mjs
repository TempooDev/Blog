import { defineConfig } from 'astro/config';
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