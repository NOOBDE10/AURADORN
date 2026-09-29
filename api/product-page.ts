import { escapeHtml, getDb, originOf, productPath } from './_lib/site.js';

/**
 * GET /product/:id/:slug (rewritten here by vercel.json).
 * Serves the normal app HTML, with the product's title, description, image and JSON-LD
 * filled in, so WhatsApp/Facebook link previews and Google show the actual product.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = originOf(req);
  const id = (url.searchParams.get('id') || '').slice(0, 128);

  const indexRes = await fetch(`${origin}/index.html`);
  let html = await indexRes.text();
  const send = (body: string, status = 200) =>
    new Response(body, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
      },
    });

  if (!/^[A-Za-z0-9_-]+$/.test(id)) return send(html, 404);

  let p: Record<string, any> | null = null;
  let brand = 'Aura Adorn';
  try {
    const db = await getDb();
    const [snap, settingsSnap] = await Promise.all([db.doc(`products/${id}`).get(), db.doc('settings/general').get()]);
    p = snap.exists ? snap.data()! : null;
    brand = settingsSnap.data()?.brandName || brand;
  } catch (e) {
    console.error('product-page: Firestore unavailable', e);
    return send(html); // the app still works client-side
  }
  if (!p || p.status === 'draft') return send(html, 404);

  const canonical = `${origin}${productPath({ id, name: p.name })}`;
  const rawImage = Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : '/logo-512.jpg';
  const image = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  const price = Math.round(Number(p.price) || 0);
  const title = `${p.name} | ${brand}`;
  const description = `${p.name}: Rs ${price.toLocaleString('en-PK')}. ${String(p.description || 'Artificial jewellery').slice(0, 140)} Cash on Delivery all over Pakistan.`;
  const inStock = Number(p.stock) > 0 && p.status !== 'out_of_stock';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: (Array.isArray(p.images) ? p.images : [rawImage]).map((i: string) => (String(i).startsWith('http') ? i : `${origin}${i}`)),
    description: p.description || `${p.name}: artificial jewellery`,
    sku: id,
    brand: { '@type': 'Brand', name: brand },
    ...(p.details?.metal ? { material: p.details.metal } : {}),
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'PKR',
      price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const head = `
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="PKR" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  `;

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/\s*<meta property="og:type"[^>]*>/, '')
    .replace(/\s*<meta property="og:image"[^>]*>/, '')
    .replace('</head>', `${head}</head>`);

  return send(html);
}
