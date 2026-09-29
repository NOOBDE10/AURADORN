import { escapeHtml, getDb, originOf, productPath } from './_lib/site.js';

const POLICIES = ['shipping', 'returns', 'care', 'privacy', 'terms', 'contact'];

/** GET /sitemap.xml (rewritten here by vercel.json): all public pages, categories and products. */
export async function GET(req: Request): Promise<Response> {
  const origin = originOf(req);
  const urls: Array<{ loc: string; lastmod?: string; priority: string }> = [
    { loc: '/', priority: '1.0' },
    { loc: '/shop', priority: '0.9' },
    ...POLICIES.map(p => ({ loc: `/policies/${p}`, priority: '0.3' })),
  ];
  try {
    const db = await getDb();
    const [cats, prods] = await Promise.all([db.collection('categories').get(), db.collection('products').get()]);
    cats.forEach(d => urls.push({ loc: `/shop/${d.data().slug || d.id}`, priority: '0.8' }));
    prods.forEach(d => {
      const p = d.data();
      if (p.status === 'draft') return;
      urls.push({ loc: productPath({ id: d.id, name: p.name }), lastmod: (p.updatedAt || p.createdAt || '').slice(0, 10) || undefined, priority: '0.7' });
    });
  } catch (e) {
    console.error('sitemap: Firestore unavailable', e);
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(u => `  <url><loc>${escapeHtml(origin + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  });
}
