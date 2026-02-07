/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_COMMENTS_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
