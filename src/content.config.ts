import { defineCollection, z } from 'astro:content';

const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055';

function directusLoader(collectionName) {
  return {
    name: `directus-${collectionName}`,
    async load({ store, parseData }) {
      const res = await fetch(`${DIRECTUS_URL}/items/${collectionName}?limit=-1`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${collectionName} from Directus: ${res.statusText}`);
      }
      const data = await res.json();
      
      for (const item of data.data) {
        if (item.status !== 'published') continue;
        
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
             // In Astro 5+ you can provide rendered HTML, but if we provide `body`, Astro parses it
          },
          body: item.content || ''
        });
      }
    }
  };
}

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
