import React, { useState } from 'react';
import { Edit3, Plus, Tag, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { deleteCoupon, normalizeCouponCode, saveCoupon } from '../../services/storeService';
import { formatPKR } from '../../utils/format';
import { describeCoupon } from '../../utils/pricing';
import { cardCls, EmptyState, Field, ghostBtn, goldBtn, inputCls, primaryBtn, runAction } from './adminUi';

function newCoupon(): Coupon {
  return {
    id: '',
    code: '',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxUses: 0,
    usedCount: 0,
    active: true,
    expiresAt: '',
    description: '',
    createdAt: '',
  };
}

function couponState(c: Coupon): { label: string; cls: string } {
  if (!c.active) return { label: 'Off', cls: 'bg-stone-100 text-stone-600' };
  if (c.expiresAt && new Date(`${c.expiresAt}T23:59:59`) < new Date()) return { label: 'Expired', cls: 'bg-rose-50 text-rose-700' };
  if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { label: 'Used up', cls: 'bg-rose-50 text-rose-700' };
  return { label: 'Active', cls: 'bg-emerald-50 text-emerald-700' };
}

const CouponForm: React.FC<{ initial: Coupon; isNew: boolean; onClose: () => void }> = ({ initial, isNew, onClose }) => {
  const { coupons, showToast } = useStore();
  const [c, setC] = useState<Coupon>(initial);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeCouponCode(c.code);
    if (!code) return showToast('Please enter a code using letters and numbers.', 'info');
    if (isNew && coupons.some(x => x.id === code)) return showToast(`Code ${code} already exists — edit it instead.`, 'info');
    if (!(c.value > 0)) return showToast('Please enter a discount amount.', 'info');
    if (c.type === 'percent' && c.value > 100) return showToast('A percentage discount cannot be more than 100%.', 'info');

    setSaving(true);
    const ok = await runAction(
      () => saveCoupon({
        ...c,
        code,
        id: code,
        value: Number(c.value),
        minOrder: Number(c.minOrder) || 0,
        maxUses: Number(c.maxUses) || 0,
        createdAt: c.createdAt || new Date().toISOString(),
      }),
      showToast,
      `Coupon ${code} saved`
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
        <h3 className="font-serif text-xl mb-5">{isNew ? 'New discount code' : `Edit ${c.code}`}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Field label="Code *" hint="What customers type at checkout, e.g. EID20. Letters and numbers only.">
            <input
              className={`${inputCls} uppercase font-mono`}
              value={c.code}
              disabled={!isNew}
              onChange={e => setC({ ...c, code: normalizeCouponCode(e.target.value) })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount type">
              <select className={inputCls} value={c.type} onChange={e => setC({ ...c, type: e.target.value as Coupon['type'] })}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (Rs.)</option>
              </select>
            </Field>
            <Field label={c.type === 'percent' ? 'Percent off *' : 'Rupees off *'}>
              <input type="number" min={1} max={c.type === 'percent' ? 100 : undefined} className={inputCls} value={c.value || ''} onChange={e => setC({ ...c, value: Number(e.target.value) })} required />
            </Field>
            <Field label="Minimum order (Rs.)" hint="0 = no minimum">
              <input type="number" min={0} className={inputCls} value={c.minOrder} onChange={e => setC({ ...c, minOrder: Number(e.target.value) })} />
            </Field>
            <Field label="Usage limit" hint={`0 = unlimited · used ${c.usedCount} time(s)`}>
              <input type="number" min={0} className={inputCls} value={c.maxUses} onChange={e => setC({ ...c, maxUses: Number(e.target.value) })} />
            </Field>
            <Field label="Expires on" hint="Leave empty to never expire">
              <input type="date" className={inputCls} value={c.expiresAt || ''} onChange={e => setC({ ...c, expiresAt: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={c.active ? 'on' : 'off'} onChange={e => setC({ ...c, active: e.target.value === 'on' })}>
                <option value="on">Active</option>
                <option value="off">Turned off</option>
              </select>
            </Field>
          </div>
          <Field label="Internal note" hint="Only you see this, e.g. 'Eid campaign on Instagram'">
            <input className={inputCls} value={c.description || ''} onChange={e => setC({ ...c, description: e.target.value })} />
          </Field>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save code'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CouponsTab: React.FC = () => {
  const { coupons, orders, showToast } = useStore();
  const [editing, setEditing] = useState<{ coupon: Coupon; isNew: boolean } | null>(null);

  const revenueByCode = (code: string) =>
    orders.filter(o => o.couponCode === code && o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Create codes customers can enter in their shopping bag for a discount.</p>
        <button onClick={() => setEditing({ coupon: newCoupon(), isNew: true })} className={goldBtn}>
          <Plus className="w-4 h-4" /> New code
        </button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        {coupons.length === 0 ? (
          <EmptyState title="No discount codes yet">Press "New code" to create one, e.g. WELCOME10 for 10% off.</EmptyState>
        ) : (
          <div className="divide-y divide-[#F3EFEA]">
            {coupons.map(c => {
              const state = couponState(c);
              return (
                <div key={c.id} className="p-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <div className="flex items-center gap-2 w-40">
                    <Tag className="w-4 h-4 text-[#C9A25D]" />
                    <span className="font-mono font-bold text-sm">{c.code}</span>
                  </div>
                  <div className="flex-1 min-w-40">
                    <p className="font-medium">{describeCoupon(c)}{c.minOrder > 0 && ` on orders over ${formatPKR(c.minOrder)}`}</p>
                    <p className="text-stone-500">
                      Used {c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ''} times
                      {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}`}
                      {revenueByCode(c.code) > 0 && ` · ${formatPKR(revenueByCode(c.code))} in orders`}
                    </p>
                    {c.description && <p className="text-stone-400">{c.description}</p>}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${state.cls}`}>{state.label}</span>
                  <button
                    onClick={() => runAction(() => saveCoupon({ ...c, active: !c.active }), showToast, c.active ? `${c.code} turned off` : `${c.code} turned on`)}
                    className={`${ghostBtn} py-1.5`}
                  >
                    {c.active ? 'Turn off' : 'Turn on'}
                  </button>
                  <button onClick={() => setEditing({ coupon: c, isNew: false })} className="p-2 text-stone-500 hover:text-stone-900 cursor-pointer" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.confirm(`Delete code ${c.code}?`) && runAction(() => deleteCoupon(c.id), showToast, 'Code deleted')}
                    className="p-2 text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && <CouponForm initial={editing.coupon} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </div>
  );
};
