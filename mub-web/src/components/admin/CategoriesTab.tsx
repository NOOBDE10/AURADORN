import React, { useState } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { createDefaultCategories, deleteCategory, saveCategory } from '../../services/storeService';
import { slugify } from '../../utils/format';
import { cardCls, EmptyState, Field, ghostBtn, goldBtn, inputCls, primaryBtn, runAction } from './adminUi';
import { ImageUploader } from './ImageUploader';

type CategoryDraft = Omit<Category, 'itemCount'>;

const CategoryForm: React.FC<{ initial: CategoryDraft; isNew: boolean; onClose: () => void }> = ({ initial, isNew, onClose }) => {
  const { categories, showToast } = useStore();
  const [d, setD] = useState<CategoryDraft>(initial);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = isNew ? slugify(d.slug || d.name) : d.slug;
    if (!d.name.trim() || !slug) return showToast('Please enter a category name.', 'info');
    if (isNew && categories.some(c => c.slug === slug)) {
      return showToast(`A category with the link name "${slug}" already exists.`, 'info');
    }
    setSaving(true);
    const ok = await runAction(
      () => saveCategory({ ...d, id: slug, slug, name: d.name.trim(), description: d.description.trim() }),
      showToast,
      `Category "${d.name}" saved`
    );
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-serif text-xl mb-5">{isNew ? 'New category' : 'Edit category'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Field label="Name *">
            <input
              className={inputCls}
              value={d.name}
              onChange={e => setD({ ...d, name: e.target.value, slug: isNew ? slugify(e.target.value) : d.slug })}
              required
            />
          </Field>
          {isNew && (
            <Field label="Link name" hint="Used in the web address. Cannot be changed later.">
              <input className={inputCls} value={d.slug} onChange={e => setD({ ...d, slug: slugify(e.target.value) })} />
            </Field>
          )}
          <Field label="Short description">
            <input className={inputCls} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
          </Field>
          <Field label="Display order" hint="Lower numbers appear first.">
            <input type="number" className={inputCls} value={d.sortOrder ?? ''} onChange={e => setD({ ...d, sortOrder: Number(e.target.value) })} />
          </Field>
          <Field label="Photo">
            <ImageUploader multiple={false} images={d.image ? [d.image] : []} onChange={imgs => setD({ ...d, image: imgs[0] || '' })} />
          </Field>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CategoriesTab: React.FC = () => {
  const { categories, allProducts, showToast } = useStore();
  const [editing, setEditing] = useState<{ draft: CategoryDraft; isNew: boolean } | null>(null);

  const productCount = (slug: string) => allProducts.filter(p => p.category === slug).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Categories appear on the home page and in the shop filters.</p>
        <button
          onClick={() => setEditing({ isNew: true, draft: { id: '', name: '', slug: '', description: '', image: '', sortOrder: categories.length + 1 } })}
          className={goldBtn}
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className={cardCls}>
          <EmptyState title="No categories yet">
            <p>Start with our 6 standard jewellery categories (Rings, Necklaces, Earrings, Bracelets, Bangles, Bridal Sets) — you can rename, re-photo or delete them after.</p>
            <button
              onClick={() => runAction(createDefaultCategories, showToast, 'Starter categories created')}
              className={`${primaryBtn} mx-auto mt-4`}
            >
              Create starter categories
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className={`${cardCls} p-4 flex gap-4 items-center`}>
              {c.image
                ? <img src={c.image} alt="" className="w-16 h-16 rounded-xl object-cover border" />
                : <div className="w-16 h-16 rounded-xl bg-[#F3EFEA]" />}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-stone-500">{productCount(c.slug)} products · order {c.sortOrder ?? '—'}</p>
              </div>
              <button onClick={() => setEditing({ isNew: false, draft: c })} className="p-2 text-stone-500 hover:text-stone-900 cursor-pointer" title="Edit">
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const count = productCount(c.slug);
                  if (count > 0) {
                    showToast(`Move or delete the ${count} product(s) in "${c.name}" first.`, 'info');
                    return;
                  }
                  if (window.confirm(`Delete category "${c.name}"?`)) runAction(() => deleteCategory(c.id), showToast, 'Category deleted');
                }}
                className="p-2 text-stone-400 hover:text-rose-600 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && <CategoryForm initial={editing.draft} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </div>
  );
};
