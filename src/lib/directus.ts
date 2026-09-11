import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

export const directus = createDirectus(import.meta.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055').with(rest());

export { readItems, readItem };
