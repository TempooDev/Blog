import { defineCollection, z } from 'astro:content';

const directusLoader = (configOrCollection) => {
  const collection = typeof configOrCollection === 'string' ? configOrCollection : configOrCollection.collection;
  return {
    name: `directus-${collection}`,
    load: async ({ store, logger, parseData, renderMarkdown }) => {
      const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055';
      const response = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=-1`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${collection} from Directus: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      for (const item of data.data) {
        if (item.status !== 'published') continue;
        
        let html = '';
        if (typeof renderMarkdown === 'function') {
           const result = await renderMarkdown(item.content || '');
           html = result.html;
        } else {
           html = `<p>${item.content}</p>`; // Fallback
        }
        console.log(`Rendered HTML for ${item.slug}: ${html.length} characters`);

        store.set({
          id: `${item.language}/${item.slug}`,
          data: {
            title: item.title,
            translationId: item.translation_id,
            description: item.description || '',
            publishDate: item.publish_date ? new Date(item.publish_date) : new Date(),
            tags: item.tags || [],
            img: item.cover_image ? `${DIRECTUS_URL}/assets/${item.cover_image}` : "",
            img_alt: item.img_alt || '',
          },
          rendered: {
            html
          }
        });
      }
    }
  };
};

export const collections = {
	work: defineCollection({
		loader: directusLoader('work'),
		schema: z.object({
			title: z.string(),
			translationId: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
		}),
	}),
	blog: defineCollection({
		loader: directusLoader('posts'),
		schema: z.object({
			title: z.string(),
			translationId: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
		}),
	}),
};
