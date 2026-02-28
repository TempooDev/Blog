import { config, fields, collection } from '@keystatic/core';

const postSchema = {
    title: fields.slug({ name: { label: 'Title' } }),
    translationId: fields.text({ label: 'Translation ID', description: 'Shared ID to link translations of the same content' }),
    publishDate: fields.datetime({ label: 'Publish Date' }),
    img: fields.text({ label: 'Image Path', description: 'Path to the cover image (e.g. /assets/my-image.webp)' }),
    img_alt: fields.text({ label: 'Image Alt Text' }),
    description: fields.text({ label: 'Description', multiline: true }),
    tags: fields.array(fields.text({ label: 'Tag' }), {
        label: 'Tags',
        itemLabel: (props) => props.value,
    }),
    content: fields.mdx({ label: 'Content' }),
};

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        postsEn: collection({
            label: 'Posts (English)',
            slugField: 'title',
            path: 'src/content/posts/en/*',
            format: { contentField: 'content' },
            schema: { ...postSchema },
        }),
        postsEs: collection({
            label: 'Posts (Español)',
            slugField: 'title',
            path: 'src/content/posts/es/*',
            format: { contentField: 'content' },
            schema: { ...postSchema },
        }),
        workEn: collection({
            label: 'Work (English)',
            slugField: 'title',
            path: 'src/content/work/en/*',
            format: { contentField: 'content' },
            schema: { ...postSchema },
        }),
        workEs: collection({
            label: 'Work (Español)',
            slugField: 'title',
            path: 'src/content/work/es/*',
            format: { contentField: 'content' },
            schema: { ...postSchema },
        }),
    },
});