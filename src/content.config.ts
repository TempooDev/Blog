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
            description: (item.description || '').trim(),
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

// Weekly newsletter issues. Unlike posts, a missing or private `digests` collection only logs
// a warning, so the site still builds before the newsletter is set up in Directus.
const digestsLoader = () => ({
  name: 'directus-digests',
  load: async ({ store, logger, renderMarkdown }) => {
    // Start from scratch so unpublished or deleted issues don't linger in the content cache
    store.clear();
    const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055';
    const response = await fetch(`${DIRECTUS_URL}/items/digests?limit=-1`);
    if (!response.ok) {
      logger.warn(`Skipping newsletter issues, Directus answered ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();

    for (const item of data.data) {
      if (item.status !== 'published') continue;
      const items = Array.isArray(item.items) ? item.items : [];
      const intro = await renderMarkdown(item.intro || '');
      const outro = await renderMarkdown(item.outro || '');

      store.set({
        id: `${item.language}/${item.slug}`,
        data: {
          title: item.title,
          translationId: item.translation_id,
          description: (item.description || '').trim(),
          publishDate: item.publish_date ? new Date(item.publish_date) : new Date(),
          tags: [...new Set(items.map((i) => i.category).filter(Boolean))],
          img: item.cover_image ? `${DIRECTUS_URL}/assets/${item.cover_image}` : "",
          img_alt: '',
          issueNumber: item.issue_number ?? undefined,
          items: items.map((i) => ({
            title: i.title || '',
            url: i.url || '',
            source: i.source || '',
            category: i.category || '',
            summary: i.summary || '',
            whyItMatters: i.why_it_matters || '',
          })),
          outroHtml: outro.html,
          promo: item.promo_title
            ? {
                title: item.promo_title,
                text: (item.promo_text || '').trim(),
                url: item.promo_url || '',
                cta: item.promo_cta || '',
              }
            : undefined,
        },
        rendered: { html: intro.html },
      });
    }
  },
});

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
	newsletter: defineCollection({
		loader: digestsLoader(),
		schema: z.object({
			title: z.string(),
			translationId: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
			issueNumber: z.number().optional(),
			items: z.array(z.object({
				title: z.string(),
				url: z.string(),
				source: z.string(),
				category: z.string(),
				summary: z.string(),
				whyItMatters: z.string(),
			})),
			outroHtml: z.string(),
			promo: z.object({
				title: z.string(),
				text: z.string(),
				url: z.string(),
				cta: z.string(),
			}).optional(),
		}),
	}),
};
