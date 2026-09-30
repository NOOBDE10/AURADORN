import { Product } from '../types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Shareable product URL, e.g. /product/p-lx3k9/noor-kundan-choker-set */
export function productPath(product: Pick<Product, 'id' | 'name'>): string {
  const slug = slugify(product.name);
  return slug ? `/product/${product.id}/${slug}` : `/product/${product.id}`;
}

export function categoryPath(slug: string): string {
  return !slug || slug === 'all' ? '/shop' : `/shop/${slug}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

/** Only web images (https:// or site-relative) can be shown; anything else (e.g. a C:\ path) falls back. */
export function safeImageUrl(url: string | undefined, fallback = '/logo-512.jpg'): string {
  const u = (url || '').trim();
  return /^https:\/\//i.test(u) || (u.startsWith('/') && !u.startsWith('//')) ? u : fallback;
}
