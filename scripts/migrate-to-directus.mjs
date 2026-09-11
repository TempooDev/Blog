import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DIRECTUS_URL = process.env.PUBLIC_DIRECTUS_URL || 'http://127.0.0.1:8055';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@antoniobermudez.dev';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

async function fetchAPI(apiPath, method = 'GET', body = null, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  let fetchBody = null;
  if (body instanceof FormData) {
    fetchBody = body; // let fetch set the Content-Type
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }
  
  const res = await fetch(`${DIRECTUS_URL}${apiPath}`, {
    method,
    headers,
    body: fetchBody
  });
  
  if (res.status === 204) {
    return null;
  }
  
  const data = await res.json();
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }
  return data.data;
}

async function uploadImage(imagePath, token) {
  if (!imagePath) return null;
  
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Image not found: ${fullPath}`);
    return null;
  }
  
  const buffer = fs.readFileSync(fullPath);
  const blob = new Blob([buffer], { type: 'image/webp' }); // Simplification, content-type is fine
  const filename = path.basename(fullPath);
  
  const formData = new FormData();
  formData.append('file', blob, filename);
  
  console.log(`Uploading ${filename}...`);
  const uploaded = await fetchAPI('/files', 'POST', formData, token);
  return uploaded.id; // Returns UUID of uploaded file
}

async function clearCollection(colName, token) {
  const items = await fetchAPI(`/items/${colName}`, 'GET', null, token);
  for (const item of items) {
    await fetchAPI(`/items/${colName}/${item.id}`, 'DELETE', null, token);
  }
  console.log(`s? Cleared all items from ${colName}`);
}

async function processCollection(colName, dirPath, token) {
  if (!fs.existsSync(dirPath)) return;
  
  await clearCollection(colName, token);

  const langs = ['en', 'es'];
  for (const lang of langs) {
    const langDir = path.join(dirPath, lang);
    if (!fs.existsSync(langDir)) continue;
    
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const fullPath = path.join(langDir, file);
      const contentRaw = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(contentRaw);
      
      const slug = file.replace(/\.mdx?$/, '');
      
      let coverImageId = null;
      if (data.img) {
        coverImageId = await uploadImage(data.img, token);
      }
      
      const payload = {
        status: 'published',
        title: data.title || slug,
        slug: slug,
        translation_id: data.translationId || slug,
        language: lang,
        publish_date: data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString(),
        cover_image: coverImageId,
        img_alt: data.img_alt || '',
        description: data.description || '',
        tags: data.tags || [],
        content: content.trim()
      };
      
      try {
        await fetchAPI(`/items/${colName}`, 'POST', payload, token);
        console.log(`✅ Migrated [${colName}/${lang}] ${slug}`);
      } catch (e) {
        console.error(`❌ Failed to migrate [${colName}/${lang}] ${slug}`, e.message);
      }
    }
  }
}

async function run() {
  console.log('Logging in...');
  const auth = await fetchAPI('/auth/login', 'POST', { email: EMAIL, password: PASSWORD });
  const token = auth.access_token;
  console.log('Logged in successfully!');

  console.log('Migrating Posts...');
  await processCollection('posts', path.join(process.cwd(), 'src/content/posts'), token);
  
  console.log('Migrating Work...');
  await processCollection('work', path.join(process.cwd(), 'src/content/work'), token);

  console.log('🎉 Migration complete!');
}

run().catch(err => {
  console.error("Migration failed:");
  console.error(err);
});
