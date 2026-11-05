type Dated = { data: { publishDate?: Date | undefined } };

// Newest first. Entries with no publish date in Directus go last.
export const byPublishDateDesc = (a: Dated, b: Dated) =>
  (b.data.publishDate?.valueOf() ?? 0) - (a.data.publishDate?.valueOf() ?? 0);
