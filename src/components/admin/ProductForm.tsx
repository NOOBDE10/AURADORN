import React, { useState } from 'react';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';
import { Category, Product, ProductStatus } from '../../types';
import { uploadImage, isImageUploadConfigured } from '../../lib/cloudinary';
import { inputCls, labelCls, btnGold, btnGhost } from './styles';

interface Props {
  initial: Partial<Product>;
  categories: Category[];
  onSave: (product: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

export const ProductForm: React.FC<Props> = ({ initial, categories, onSave, onClose }) => {
  const [p, setP] = useState<Partial<Product>>(initial);
  const [optionsText, setOptionsText] = useState((initial.options || []).join(', '));
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP(prev => ({ ...prev, [key]: value }));
  const setDetail = (key: keyof Product['details'], value: string) =>
    setP(prev => ({ ...prev, details: { metal: '', ...(prev.details || {}), [key]: value } }));
  const images = p.images || [];

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadImage(file));
      set('images', [...images, ...urls]);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!/^https:\/\//.test(url)) {
      setError('Image link must start with https://');
      return;
    }
    set('images', [...images, url]);
    setImageUrlInput('');
  };

  const moveImageFirst = (idx: number) => set('images', [images[idx], ...images.filter((_, i) => i !== idx)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!p.name?.trim()) return setError('Product name is required.');
    if (!p.price || p.price <= 0) return setError('Sale price must be more than 0.');
    if (!p.category) return setError('Please choose a category.');
    if (images.length === 0) return setError('Please add at least one photo.');
    setSaving(true);
    try {
      await onSave({
        ...p,
        options: optionsText.split(',').map(s => s.trim()).filter(Boolean),
      });
      onClose();
    } catch {
      setError('Could not save. Check your connection and that you are signed in as admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E0D0B] border border-[#2E2822] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 relative text-[#FAF7F2]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-stone-400 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-serif text-2xl mb-5">{p.id ? 'Edit Product' : 'Add Product'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className={labelCls}>Product name *</label>
            <input className={inputCls} value={p.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Noor Kundan Choker Set" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Category *</label>
              <select className={inputCls} value={p.category || ''} onChange={e => set('category', e.target.value)}>
                <option value="">Choose…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sub-category</label>
              <input className={inputCls} value={p.subCategory || ''} onChange={e => set('subCategory', e.target.value)} placeholder="e.g. Choker sets" />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={p.status || 'active'} onChange={e => set('status', e.target.value as ProductStatus)}>
                <option value="active">Active (visible)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Sale price (Rs) *</label>
              <input type="number" min={0} className={inputCls} value={p.price ?? ''} onChange={e => set('price', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Original price (Rs)</label>
              <input type="number" min={0} className={inputCls} value={p.originalPrice ?? ''} onChange={e => set('originalPrice', Number(e.target.value))} placeholder="for a crossed-out price" />
            </div>
            <div>
              <label className={labelCls}>Stock qty</label>
              <input type="number" min={0} className={inputCls} value={p.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <label className={labelCls}>Photos * (first photo is the main one)</label>
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((url, i) => (
                  <div key={url + i} className={`relative rounded-lg overflow-hidden border ${i === 0 ? 'border-[#C9A25D]' : 'border-[#26211B]'}`}>
                    <img loading="lazy" decoding="async" src={url} alt="" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 text-[10px]">
                      {i !== 0 ? (
                        <button type="button" onClick={() => moveImageFirst(i)} className="px-1.5 py-0.5 hover:text-[#E5C378] cursor-pointer">Main</button>
                      ) : <span className="px-1.5 py-0.5 text-[#E5C378]">Main</span>}
                      <button type="button" onClick={() => set('images', images.filter((_, j) => j !== i))} className="px-1.5 py-0.5 hover:text-rose-400 cursor-pointer" aria-label="Remove photo">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isImageUploadConfigured && (
              <label className={`${btnGhost} inline-flex items-center gap-2`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? 'Uploading…' : 'Upload photos'}</span>
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={e => handleFiles(e.target.files)} />
              </label>
            )}
            <div className="flex gap-2">
              <input className={inputCls} value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="…or paste an image link (https://…)" />
              <button type="button" onClick={addImageUrl} className={btnGhost}>Add</button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={inputCls} value={p.description || ''} onChange={e => set('description', e.target.value)} placeholder="Describe the design, finish and occasion. Be honest that it is artificial jewellery." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Material & finish</label>
              <input className={inputCls} value={p.details?.metal || ''} onChange={e => setDetail('metal', e.target.value)} placeholder="e.g. Gold-plated alloy" />
            </div>
            <div>
              <label className={labelCls}>Stones</label>
              <input className={inputCls} value={p.details?.stone || ''} onChange={e => setDetail('stone', e.target.value)} placeholder="e.g. Kundan & pearls, AD / zircon" />
            </div>
            <div>
              <label className={labelCls}>Colour</label>
              <input className={inputCls} value={p.details?.color || ''} onChange={e => setDetail('color', e.target.value)} placeholder="e.g. Gold / green" />
            </div>
            <div>
              <label className={labelCls}>Includes</label>
              <input className={inputCls} value={p.details?.includes || ''} onChange={e => setDetail('includes', e.target.value)} placeholder="e.g. Necklace + earrings + tikka" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Choice label</label>
              <input className={inputCls} value={p.optionLabel || ''} onChange={e => set('optionLabel', e.target.value)} placeholder="e.g. Bangle size, Colour" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Choices (comma separated, leave empty if none)</label>
              <input className={inputCls} value={optionsText} onChange={e => setOptionsText(e.target.value)} placeholder="e.g. 2.4, 2.6, 2.8, 2.10" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-stone-300">
            {([['isFeatured', 'Featured'], ['isNewArrival', 'New arrival'], ['isBestSeller', 'Best seller']] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#C9A25D]" checked={Boolean(p[key])} onChange={e => set(key, e.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {error && <p className="text-rose-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-[#26211B]">
            <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={saving || uploading} className={btnGold}>{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
