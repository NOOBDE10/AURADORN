/** Helpers shared by the SEO endpoints (product pages, sitemap, robots). */

export function originOf(req: Request): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function productPath(p: { id: string; name: string }): string {
  const slug = slugify(p.name);
  return slug ? `/product/${p.id}/${slug}` : `/product/${p.id}`;
}

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Loads Firestore lazily so a missing/invalid service account never breaks page delivery. */
export async function getDb() {
  const mod = await import('./firebase.js');
  return mod.db;
}
