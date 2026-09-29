import { useEffect } from 'react';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Updates the page title, description, canonical URL and Open Graph tags for the current view. */
export function useDocumentMeta(meta: { title: string; description?: string; image?: string } | null) {
  const title = meta?.title;
  const description = meta?.description;
  const image = meta?.image;
  useEffect(() => {
    if (!title) return;
    document.title = title;
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', new URL(image, window.location.origin).toString());
    const url = window.location.origin + window.location.pathname;
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setCanonical(url);
  }, [title, description, image]);
}
