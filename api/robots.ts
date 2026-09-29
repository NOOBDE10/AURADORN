import { originOf } from './_lib/site.js';

/** GET /robots.txt (rewritten here by vercel.json), pointing crawlers at the sitemap for this domain. */
export function GET(req: Request): Response {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${originOf(req)}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400' } });
}
