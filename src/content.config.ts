import { defineCollection, z } from 'astro:content';

const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055';
// Build-time only token (never PUBLIC_*, so it never reaches the browser). The Public role can't
// read posts, work or digests, so drafts stay private; the build reads them with this token.
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

// Only published items: drafts never leave Directus, not even into the build.
const fetchPublished = (collection) => {
  const query = new URLSearchParams({ limit: '-1', 'filter[status][_eq]': 'published' });
  return fetch(`${DIRECTUS_URL}/items/${collection}?${query}`, {
    headers: DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {},
  });
};

const directusLoader = (configOrCollection) => {
  const collection = typeof configOrCollection === 'string' ? configOrCollection : configOrCollection.collection;
  return {
    name: `directus-${collection}`,
    load: async ({ store, logger, parseData, renderMarkdown }) => {
      const response = await fetchPublished(collection);

      if (!response.ok) {
        const hint = response.status === 401 || response.status === 403
          ? ' (check the DIRECTUS_TOKEN secret: it needs read access to this collection)'
          : '';
        throw new Error(`Failed to fetch ${collection} from Directus: ${response.status} ${response.statusText}${hint}`);
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
            // No fallback to the current time: it would declare the build time as the publish date.
            publishDate: item.publish_date ? new Date(item.publish_date) : undefined,
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
    const response = await fetchPublished('digests');
    // With a token, a refusal means the token is misconfigured: fail instead of silently
    // publishing the site without its newsletter issues (the Monday send waits for those pages).
    if (DIRECTUS_TOKEN && (response.status === 401 || response.status === 403)) {
      throw new Error(`Failed to fetch digests from Directus: ${response.status} ${response.statusText} (check the DIRECTUS_TOKEN secret: it needs read access to digests)`);
    }
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
          publishDate: item.publish_date ? new Date(item.publish_date) : undefined,
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
			publishDate: z.coerce.date().optional(),
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
			publishDate: z.coerce.date().optional(),
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
			publishDate: z.coerce.date().optional(),
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
