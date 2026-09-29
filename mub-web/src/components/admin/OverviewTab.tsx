import React from 'react';
import { AlertTriangle, Banknote, CheckCircle2, Circle, Clock, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { isOrderEmailConfigured } from '../../services/emailService';
import { isImageUploadConfigured } from '../../services/imageUpload';
import { formatPKR } from '../../utils/format';
import { cardCls, formatDateTime, StatusBadge } from './adminUi';

export type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'coupons' | 'reviews' | 'settings' | 'subscribers';

const Stat: React.FC<{ label: string; value: string; note?: string; icon: React.ReactNode; onClick?: () => void; tone?: string }> = ({
  label, value, note, icon, onClick, tone = 'text-[#1C1815]',
}) => (
  <div onClick={onClick} className={`${cardCls} p-5 ${onClick ? 'cursor-pointer hover:border-[#C9A25D]' : ''}`}>
    <div className="flex items-center justify-between text-stone-500 mb-2">
      <span className="text-[11px] uppercase tracking-wider font-semibold">{label}</span>
      {icon}
    </div>
    <p className={`font-serif text-2xl font-bold ${tone}`}>{value}</p>
    {note && <span className="text-[11px] text-stone-400 mt-1 block">{note}</span>}
  </div>
);

export const OverviewTab: React.FC<{ goTo: (tab: AdminTab, orderFilter?: string) => void }> = ({ goTo }) => {
  const { orders, allProducts, categories, settings, adminReviews } = useStore();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const delivered = orders.filter(o => o.status === 'delivered');
  const deliveredThisMonth = delivered.filter(o => o.createdAt >= monthStart);
  const pending = orders.filter(o => o.status === 'pending');
  const inProgress = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status));
  const lowStock = allProducts.filter(p => p.status !== 'draft' && p.stock <= 2);
  const pendingReviews = adminReviews.filter(r => r.status === 'pending').length;

  const checklist = [
    { done: categories.length > 0, label: 'Create categories', tab: 'categories' as AdminTab },
    { done: allProducts.length > 0, label: 'Add your first product', tab: 'products' as AdminTab },
    { done: Boolean(settings.whatsappNumber && settings.phone), label: 'Add WhatsApp & phone number in Settings', tab: 'settings' as AdminTab },
    { done: isOrderEmailConfigured, label: 'Set up new-order emails (SETUP.md step 5)' },
    { done: isImageUploadConfigured, label: 'Set up photo uploads (SETUP.md step 6)' },
  ];
  const setupComplete = checklist.every(c => c.done);

  return (
    <div className="space-y-6">
      {!setupComplete && (
        <div className={`${cardCls} p-5 space-y-2 border-[#C9A25D]`}>
          <p className="font-serif text-base">Getting started</p>
          {checklist.map(item => (
            <button
              key={item.label}
              onClick={() => item.tab && goTo(item.tab)}
              className={`flex items-center gap-2 text-xs ${item.tab ? 'cursor-pointer hover:underline' : 'cursor-default'} ${item.done ? 'text-emerald-700' : 'text-stone-700'}`}
            >
              {item.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-stone-300" />}
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="New orders"
          value={String(pending.length)}
          note="Call to confirm"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          tone={pending.length ? 'text-amber-700' : undefined}
          onClick={() => goTo('orders', 'pending')}
        />
        <Stat label="In progress" value={String(inProgress.length)} note="Confirmed / packing / dispatched" icon={<Package className="w-4 h-4 text-[#C9A25D]" />} onClick={() => goTo('orders')} />
        <Stat
          label="Sales this month"
          value={formatPKR(deliveredThisMonth.reduce((s, o) => s + o.totalAmount, 0))}
          note={`${deliveredThisMonth.length} delivered · all time ${formatPKR(delivered.reduce((s, o) => s + o.totalAmount, 0))}`}
          icon={<Banknote className="w-4 h-4 text-emerald-600" />}
        />
        <Stat
          label="Low stock"
          value={String(lowStock.length)}
          note="2 or fewer left"
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
          tone={lowStock.length ? 'text-rose-700' : undefined}
          onClick={() => goTo('products')}
        />
      </div>

      {pendingReviews > 0 && (
        <button onClick={() => goTo('reviews')} className="w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs cursor-pointer">
          {pendingReviews} customer review(s) waiting for your approval →
        </button>
      )}

      <div className={`${cardCls} p-5 space-y-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Latest orders</h3>
          <button onClick={() => goTo('orders')} className="text-xs text-[#C9A25D] font-semibold hover:underline cursor-pointer">View all →</button>
        </div>
        {orders.length === 0 ? (
          <p className="text-xs text-stone-500 py-4">No orders yet.</p>
        ) : (
          <div className="divide-y divide-[#F3EFEA]">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="font-mono font-bold w-32">{o.id}</span>
                <span className="flex-1 min-w-32">{o.customerName} · {o.city}</span>
                <span className="text-stone-400 hidden sm:inline">{formatDateTime(o.createdAt)}</span>
                <span className="font-semibold w-24">{formatPKR(o.totalAmount)}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className={`${cardCls} p-5 space-y-2`}>
          <h3 className="font-serif text-lg">Running low</h3>
          {lowStock.map(p => (
            <p key={p.id} className="text-xs flex justify-between">
              <span>{p.name}</span>
              <span className={p.stock === 0 ? 'text-rose-600 font-semibold' : 'text-amber-700'}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
