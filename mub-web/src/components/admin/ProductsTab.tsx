import React, { useMemo, useState } from 'react';
import { Copy, Edit3, EyeOff, Plus, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductStatus } from '../../types';
import { deleteProduct, saveProduct } from '../../services/storeService';
import { formatPKR, splitList } from '../../utils/format';
import { cardCls, EmptyState, Field, ghostBtn, goldBtn, inputCls, primaryBtn, runAction } from './adminUi';
import { ImageUploader } from './ImageUploader';

type Draft = Omit<Product, 'rating' | 'reviewCount'> & { metalOptionsText: string; sizeOptionsText: string; tagsText: string };

function emptyDraft(defaultCategory: string): Draft {
  return {
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    category: defaultCategory,
    subCategory: '',
    stock: 1,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    images: [],
    details: { metal: '', karat: '', weight: '', stone: '', gemstoneWeight: '', certification: '', dimensions: '' },
    metalOptions: [],
    sizeOptions: [],
    tags: [],
    createdAt: '',
    metalOptionsText: '',
    sizeOptionsText: '',
    tagsText: '',
  };
}

function toDraft(p: Product): Draft {
  return {
    ...p,
    details: { ...p.details },
    metalOptionsText: (p.metalOptions || []).join(', '),
    sizeOptionsText: (p.sizeOptions || []).join(', '),
    tagsText: (p.tags || []).join(', '),
  };
}

const ProductForm: React.FC<{ initial: Draft; onClose: () => void }> = ({ initial, onClose }) => {
  const { categories, showToast } = useStore();
  const [d, setD] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD(prev => ({ ...prev, [key]: value }));
  const setDetail = (key: keyof Draft['details'], value: string) => setD(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.name.trim()) return showToast('Please enter the product name.', 'info');
    if (!(d.price > 0)) return showToast('Please enter a price greater than 0.', 'info');
    if (d.images.length === 0) return showToast('Please add at least one photo.', 'info');
    if (!d.category) return showToast('Please create a category first (Categories tab).', 'info');

    const originalPrice = d.originalPrice > d.price ? d.originalPrice : d.price;
    const { metalOptionsText, sizeOptionsText, tagsText, ...rest } = d;
    const now = new Date().toISOString();
    const product: Product = {
      ...rest,
      id: d.id || `p-${Date.now().toString(36)}`,
      name: d.name.trim(),
      description: d.description.trim(),
      price: Math.round(d.price),
      originalPrice: Math.round(originalPrice),
      discountPercentage: originalPrice > d.price ? Math.round(((originalPrice - d.price) / originalPrice) * 100) : 0,
      stock: Math.max(0, Math.round(d.stock)),
      metalOptions: splitList(metalOptionsText),
      sizeOptions: splitList(sizeOptionsText),
      tags: splitList(tagsText),
      createdAt: d.createdAt || now,
      rating: 0,
      reviewCount: 0,
    };

    setSaving(true);
    const ok = await runAction(() => saveProduct(product), showToast, `"${product.name}" saved`);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-serif text-xl text-[#1C1815] mb-5">{d.id ? 'Edit product' : 'Add new product'}</h3>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          <Field label="Photos * (first photo is the main one)">
            <ImageUploader images={d.images} onChange={imgs => set('images', imgs)} />
          </Field>

          <Field label="Product name *">
            <input className={inputCls} value={d.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kundan Bridal Necklace Set" required />
          </Field>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Sale price (Rs.) *">
              <input type="number" min={0} className={inputCls} value={d.price || ''} onChange={e => set('price', Number(e.target.value))} required />
            </Field>
            <Field label="Old price (Rs.)" hint="Shown crossed out. Leave empty for no sale.">
              <input type="number" min={0} className={inputCls} value={d.originalPrice || ''} onChange={e => set('originalPrice', Number(e.target.value))} />
            </Field>
            <Field label="Stock quantity">
              <input type="number" min={0} className={inputCls} value={d.stock} onChange={e => set('stock', Number(e.target.value))} />
            </Field>
            <Field label="Visibility">
              <select className={inputCls} value={d.status} onChange={e => set('status', e.target.value as ProductStatus)}>
                <option value="active">Published</option>
                <option value="draft">Hidden (draft)</option>
                <option value="out_of_stock">Show as sold out</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *">
              <select className={inputCls} value={d.category} onChange={e => set('category', e.target.value)}>
                {categories.length === 0 && <option value="">— create a category first —</option>}
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub-category / collection">
              <input className={inputCls} value={d.subCategory || ''} onChange={e => set('subCategory', e.target.value)} placeholder="e.g. Kundan, Party Wear" />
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={4} className={inputCls} value={d.description} onChange={e => set('description', e.target.value)} placeholder="Describe the piece — material, look, occasion…" />
          </Field>

          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] space-y-3">
            <p className="font-serif text-sm text-[#1C1815]">Specifications <span className="text-stone-400 font-sans text-[11px]">(optional — only filled fields are shown)</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Metal / material"><input className={inputCls} value={d.details.metal} onChange={e => setDetail('metal', e.target.value)} placeholder="e.g. Gold plated brass" /></Field>
              <Field label="Karat / purity"><input className={inputCls} value={d.details.karat || ''} onChange={e => setDetail('karat', e.target.value)} /></Field>
              <Field label="Weight"><input className={inputCls} value={d.details.weight || ''} onChange={e => setDetail('weight', e.target.value)} placeholder="e.g. 12 grams" /></Field>
              <Field label="Stones"><input className={inputCls} value={d.details.stone || ''} onChange={e => setDetail('stone', e.target.value)} placeholder="e.g. Zircon, Pearls" /></Field>
              <Field label="Stone weight"><input className={inputCls} value={d.details.gemstoneWeight || ''} onChange={e => setDetail('gemstoneWeight', e.target.value)} /></Field>
              <Field label="Certificate"><input className={inputCls} value={d.details.certification || ''} onChange={e => setDetail('certification', e.target.value)} /></Field>
              <Field label="Size / dimensions" className="col-span-2 sm:col-span-3"><input className={inputCls} value={d.details.dimensions || ''} onChange={e => setDetail('dimensions', e.target.value)} placeholder="e.g. Necklace length 16 inches" /></Field>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Colour / finish choices" hint="Comma separated, e.g. Gold, Silver, Rose Gold. Leave empty for none.">
              <input className={inputCls} value={d.metalOptionsText} onChange={e => set('metalOptionsText', e.target.value)} />
            </Field>
            <Field label="Size choices" hint="Comma separated, e.g. 6, 7, 8 or 2.4, 2.6, 2.8. Leave empty for none.">
              <input className={inputCls} value={d.sizeOptionsText} onChange={e => set('sizeOptionsText', e.target.value)} />
            </Field>
          </div>

          <Field label="Search keywords" hint="Comma separated — helps customers find this product.">
            <input className={inputCls} value={d.tagsText} onChange={e => set('tagsText', e.target.value)} placeholder="bridal, kundan, choker" />
          </Field>

          <div className="flex flex-wrap gap-5">
            {([
              ['isFeatured', 'Featured on home page'],
              ['isNewArrival', 'New arrival tag'],
              ['isBestSeller', 'Best seller tag'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={Boolean(d[key])} onChange={e => set(key, e.target.checked)} className="accent-[#C9A25D]" />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Special badge" hint="Shows a gold badge and lists the piece under 'Exclusives'.">
              <select
                className={inputCls}
                value={d.loyaltyBadge?.type === 'limited_edition' ? 'limited' : d.loyaltyBadge ? 'exclusive' : 'none'}
                onChange={e => {
                  const v = e.target.value;
                  set('isLimitedEdition', v === 'limited');
                  set('loyaltyBadge', v === 'none' ? undefined : {
                    type: v === 'limited' ? 'limited_edition' : 'vault_exclusive',
                    label: v === 'limited' ? 'Limited Edition' : 'Exclusive',
                    editionNumber: d.loyaltyBadge?.editionNumber || '',
                  });
                }}
              >
                <option value="none">None</option>
                <option value="limited">Limited Edition</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </Field>
            {d.loyaltyBadge && (
              <Field label="Badge note" hint="Optional, e.g. 'Only 10 made'">
                <input
                  className={inputCls}
                  value={d.loyaltyBadge.editionNumber || ''}
                  onChange={e => set('loyaltyBadge', { ...d.loyaltyBadge!, editionNumber: e.target.value })}
                />
              </Field>
            )}
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductsTab: React.FC = () => {
  const { allProducts, categories, showToast } = useStore();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter(p =>
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (!q || p.name.toLowerCase().includes(q) || (p.subCategory || '').toLowerCase().includes(q))
    );
  }, [allProducts, search, categoryFilter]);

  const categoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${inputCls} pl-9 bg-white`} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={`${inputCls} w-auto bg-white`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <button onClick={() => setEditing(emptyDraft(categories[0]?.slug || ''))} className={goldBtn}>
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={cardCls}>
          <EmptyState title={allProducts.length === 0 ? 'No products yet' : 'No products match'}>
            {allProducts.length === 0 && (categories.length === 0
              ? 'Create your categories first (Categories tab), then add products here.'
              : 'Press "Add product" to add your first piece.')}
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`${cardCls} p-4 flex gap-4 ${p.status === 'draft' ? 'opacity-70' : ''}`}>
              {p.images[0]
                ? <img src={p.images[0]} alt="" className="w-24 h-24 object-cover rounded-xl border border-[#EAE3D8] shrink-0" />
                : <div className="w-24 h-24 rounded-xl bg-[#F3EFEA] shrink-0" />}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#8C7662] truncate">{categoryName(p.category)}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${p.stock === 0 ? 'bg-rose-50 text-rose-700' : p.stock <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-medium text-[#1C1815] truncate mt-0.5">{p.name}</h4>
                  <p className="font-serif text-sm font-semibold text-[#1C1815]">
                    {formatPKR(p.price)}
                    {p.originalPrice > p.price && <span className="font-sans text-xs text-stone-400 line-through ml-2">{formatPKR(p.originalPrice)}</span>}
                  </p>
                  {p.status === 'draft' && <span className="inline-flex items-center gap-1 text-[10px] text-stone-500"><EyeOff className="w-3 h-3" />Hidden</span>}
                  {p.status === 'out_of_stock' && <span className="text-[10px] text-rose-600">Shown as sold out</span>}
                </div>
                <div className="flex items-center gap-1 pt-2 border-t border-[#F3EFEA]">
                  <button onClick={() => setEditing(toDraft(p))} className={`${ghostBtn} flex-1 py-1.5`}>
                    <Edit3 className="w-3.5 h-3.5 text-[#C9A25D]" /> Edit
                  </button>
                  <button
                    onClick={() => setEditing({ ...toDraft(p), id: '', createdAt: '', name: `${p.name} (copy)` })}
                    className="p-2 text-stone-400 hover:text-stone-800 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${p.name}" permanently?`)) {
                        runAction(() => deleteProduct(p.id), showToast, 'Product deleted');
                      }
                    }}
                    className="p-2 text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
