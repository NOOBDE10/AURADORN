import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Upload, Loader2 } from 'lucide-react';
import { Category, Product } from '../../types';
import { uploadImage, isImageUploadConfigured } from '../../lib/cloudinary';
import { inputCls, labelCls, btnGold, btnGhost } from './styles';

interface Props {
  categories: Category[];
  products: Product[];
  onSave: (c: Category) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export const CategoriesTab: React.FC<Props> = ({ categories, products, onSave, onDelete }) => {
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const countFor = (slug: string) => products.filter(p => p.category === slug).length;

  const startNew = () => {
    setIsNew(true);
    setError('');
    setEditing({ id: '', name: '', slug: '', description: '', image: '', itemCount: 0, featured: true, order: categories.length });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return setError('Name is required.');
    const slug = isNew ? slugify(name) : editing.slug;
    if (!slug) return setError('Please use letters or numbers in the name.');
    if (isNew && categories.some(c => c.slug === slug)) return setError('A category with this name already exists.');
    setBusy(true);
    try {
      await onSave({ ...editing, name, id: slug, slug });
      setEditing(null);
    } catch {
      setError('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Category) => {
    const n = countFor(c.slug);
    if (n > 0) {
      alert(`"${c.name}" still has ${n} product(s). Move or delete them first.`);
      return;
    }
    if (window.confirm(`Delete category "${c.name}"?`)) await onDelete(c.id);
  };

  const uploadCategoryImage = async (files: FileList | null) => {
    if (!files?.[0] || !editing) return;
    setBusy(true);
    try {
      const url = await uploadImage(files[0]);
      setEditing({ ...editing, image: url });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-[#FAF7F2]">Categories</h3>
          <p className="text-xs text-stone-400">These appear in the menu, homepage and shop filters.</p>
        </div>
        <button onClick={startNew} className={`${btnGold} inline-flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="divide-y divide-[#26211B] border border-[#26211B] rounded-2xl overflow-hidden">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-[#12100E]">
            {c.image ? <img loading="lazy" decoding="async" src={c.image} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-[#1A1713]" />}
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm text-[#FAF7F2]">{c.name} <span className="text-stone-500 text-xs font-sans">({countFor(c.slug)} products)</span></p>
              <p className="text-xs text-stone-400 truncate">{c.description}</p>
            </div>
            <input
              type="number"
              title="Display order"
              className="w-16 bg-[#14120F] border border-[#26211B] rounded-lg px-2 py-1 text-xs text-[#FAF7F2]"
              value={c.order ?? 0}
              onChange={e => onSave({ ...c, order: Number(e.target.value) })}
            />
            <button onClick={() => { setIsNew(false); setError(''); setEditing({ ...c }); }} className="p-2 text-stone-300 hover:text-[#E5C378] cursor-pointer" aria-label="Edit">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => remove(c)} className="p-2 text-stone-300 hover:text-rose-400 cursor-pointer" aria-label="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-[#0E0D0B] border border-[#2E2822] rounded-3xl w-full max-w-md p-6 space-y-3 text-xs font-sans">
            <h4 className="font-serif text-xl text-[#FAF7F2]">{isNew ? 'Add Category' : 'Edit Category'}</h4>
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Anklets (Payal)" />
            </div>
            <div>
              <label className={labelCls}>Short description</label>
              <input className={inputCls} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Image</label>
              <div className="flex gap-2 items-center">
                {editing.image && <img loading="lazy" decoding="async" src={editing.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <input className={inputCls} value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} placeholder="https://…" />
                {isImageUploadConfigured && (
                  <label className={`${btnGhost} inline-flex items-center gap-1 shrink-0`}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadCategoryImage(e.target.files)} />
                  </label>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
              <input type="checkbox" className="accent-[#C9A25D]" checked={editing.featured !== false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} />
              Show on homepage
            </label>
            {error && <p className="text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={busy} className={btnGold}>Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
