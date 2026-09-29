import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, MessageCircle, Phone, Printer, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { deleteOrder, updateOrderNote, updateOrderStatus } from '../../services/storeService';
import { formatPKR, whatsappLink } from '../../utils/format';
import { cardCls, EmptyState, formatDateTime, ghostBtn, inputCls, ORDER_STATUSES, primaryBtn, runAction, StatusBadge, statusClasses } from './adminUi';
import { printInvoice } from './printInvoice';

export const StatusSelect: React.FC<{ order: Order }> = ({ order }) => {
  const { showToast } = useStore();
  const [busy, setBusy] = useState(false);

  const change = async (status: OrderStatus) => {
    if (status === 'cancelled' && !window.confirm(`Cancel order ${order.id}?`)) return;
    setBusy(true);
    await runAction(() => updateOrderStatus(order.id, status), showToast, `Order ${order.id} → ${status}`);
    setBusy(false);
  };

  return (
    <select
      value={order.status}
      disabled={busy}
      onChange={e => change(e.target.value as OrderStatus)}
      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide cursor-pointer border ${statusClasses(order.status)}`}
    >
      {ORDER_STATUSES.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
};

const OrderDetail: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { settings, allProducts, showToast } = useStore();
  const [note, setNote] = useState(order.adminNote || '');
  const productPrice = new Map(allProducts.map(p => [p.id, p.price]));
  const priceMismatch = order.items.some(i => productPrice.has(i.productId) && productPrice.get(i.productId) !== i.price);
  const customerWhatsApp = whatsappLink(
    order.phone,
    `Assalam o Alaikum ${order.customerName}, this is ${settings.brandName}. We received your order ${order.id} (${formatPKR(order.totalAmount)}, Cash on Delivery). Please confirm your order and delivery address.`
  );

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap items-center gap-3 pr-8">
          <h3 className="font-mono text-lg font-bold">{order.id}</h3>
          <StatusBadge status={order.status} />
          <span className="text-xs text-stone-500">{formatDateTime(order.createdAt)}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Customer</p>
            <p className="font-semibold text-sm">{order.customerName}</p>
            <p>{order.phone}</p>
            {order.email && <p className="text-stone-500">{order.email}</p>}
            <div className="flex gap-2 pt-2">
              <a href={`tel:${order.phone}`} className={`${ghostBtn} py-1.5`}><Phone className="w-3.5 h-3.5" />Call</a>
              {customerWhatsApp && (
                <a href={customerWhatsApp} target="_blank" rel="noopener noreferrer" className={`${ghostBtn} py-1.5 text-emerald-700`}>
                  <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Delivery address</p>
            <p>{order.address}</p>
            <p>{[order.area, order.city, order.postalCode].filter(Boolean).join(', ')}</p>
            {order.notes && <p className="pt-2 text-stone-600"><strong>Note:</strong> {order.notes}</p>}
          </div>
        </div>

        {priceMismatch && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Some item prices differ from your current catalogue prices (the price may have changed after the order). Double-check the total when confirming.
          </div>
        )}

        <div className="divide-y divide-[#F3EFEA] border border-[#EAE3D8] rounded-2xl">
          {order.items.map((item, i) => (
            <div key={i} className="p-3 flex items-center gap-3 text-xs">
              {item.productImage && <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-stone-500">{[item.metal, item.size].filter(Boolean).join(' · ')}</p>
              </div>
              <span>{item.quantity} × {formatPKR(item.price)}</span>
              <span className="font-semibold w-24 text-right">{formatPKR(item.total)}</span>
            </div>
          ))}
          <div className="p-3 text-xs space-y-1 text-right">
            <p>Subtotal: {formatPKR(order.subtotal)}</p>
            {order.discount > 0 && <p className="text-rose-600">Discount{order.couponCode ? ` (${order.couponCode})` : ''}: − {formatPKR(order.discount)}</p>}
            <p>Delivery: {order.deliveryCharge > 0 ? formatPKR(order.deliveryCharge) : 'Free'}</p>
            <p className="text-base font-serif font-bold">Collect on delivery: {formatPKR(order.totalAmount)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-700">Status</p>
            <StatusSelect order={order} />
            <p className="text-[10px] text-stone-400">Stock is reduced automatically when you mark an order Confirmed, and added back if you cancel it.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-700">Private note (only you see this)</p>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className={inputCls} placeholder="e.g. Courier tracking no. / called customer" />
            <button
              onClick={() => runAction(() => updateOrderNote(order.id, note.trim()), showToast, 'Note saved')}
              className={`${ghostBtn} py-1.5`}
            >
              Save note
            </button>
          </div>
        </div>

        {order.trackingUpdates.length > 0 && (
          <div className="text-[11px] text-stone-500 space-y-0.5">
            <p className="font-semibold text-stone-600">History</p>
            {order.trackingUpdates.map((t, i) => (
              <p key={i}>{formatDateTime(t.timestamp)} — {t.title}</p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-3 border-t">
          <button onClick={() => printInvoice(order, settings)} className={primaryBtn}>
            <Printer className="w-4 h-4" /> Print invoice
          </button>
          <button
            onClick={async () => {
              if (!window.confirm(`Permanently delete order ${order.id}? This cannot be undone.`)) return;
              if (await runAction(() => deleteOrder(order.id), showToast, 'Order deleted')) onClose();
            }}
            className={`${ghostBtn} text-rose-600 ml-auto`}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function exportOrdersCsv(orders: Order[]) {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Order ID', 'Date', 'Status', 'Customer', 'Phone', 'Email', 'City', 'Address', 'Items', 'Subtotal', 'Discount', 'Coupon', 'Delivery', 'Total'];
  const lines = orders.map(o =>
    [
      o.id,
      new Date(o.createdAt).toLocaleString('en-PK'),
      o.status,
      o.customerName,
      o.phone,
      o.email,
      o.city,
      [o.address, o.area, o.postalCode].filter(Boolean).join(', '),
      o.items.map(i => `${i.quantity}x ${i.productName}`).join('; '),
      o.subtotal,
      o.discount,
      o.couponCode || '',
      o.deliveryCharge,
      o.totalAmount,
    ].map(cell).join(',')
  );
  const blob = new Blob([[header.map(cell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const OrdersTab: React.FC<{ initialFilter?: string }> = ({ initialFilter = 'all' }) => {
  const { orders } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return orders.filter(o => {
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (qDigits.length > 0 && o.phone.replace(/\D/g, '').includes(qDigits)) ||
        o.city.toLowerCase().includes(q);
      return matchesSearch && (statusFilter === 'all' || o.status === statusFilter);
    });
  }, [orders, search, statusFilter]);

  const openOrder = openOrderId ? orders.find(o => o.id === openOrderId) : null;

  return (
    <div className="space-y-5">
      <div className={`${cardCls} p-4 flex flex-wrap items-center gap-3`}>
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, name, phone or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} pl-9`}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="all">All orders ({orders.length})</option>
          {ORDER_STATUSES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label} ({orders.filter(o => o.status === s.value).length})
            </option>
          ))}
        </select>
        <button onClick={() => exportOrdersCsv(filtered)} disabled={filtered.length === 0} className={ghostBtn}>
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        {filtered.length === 0 ? (
          <EmptyState title={orders.length === 0 ? 'No orders yet' : 'No orders match your search'}>
            {orders.length === 0 && 'New orders appear here instantly — you will hear a chime and receive an email.'}
          </EmptyState>
        ) : (
          <div className="divide-y divide-[#F3EFEA]">
            {filtered.map(order => (
              <div
                key={order.id}
                onClick={() => setOpenOrderId(order.id)}
                className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs hover:bg-[#FAF8F5] cursor-pointer"
              >
                <div className="w-36">
                  <p className="font-mono font-bold">{order.id}</p>
                  <p className="text-[10px] text-stone-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex-1 min-w-40">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-stone-500">{order.phone} · {order.city}</p>
                </div>
                <div className="w-44 text-stone-600 truncate hidden md:block">
                  {order.items.map(i => `${i.quantity}× ${i.productName}`).join(', ')}
                </div>
                <div className="w-28 font-serif font-bold text-sm">{formatPKR(order.totalAmount)}</div>
                <div onClick={e => e.stopPropagation()}>
                  <StatusSelect order={order} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {openOrder && <OrderDetail order={openOrder} onClose={() => setOpenOrderId(null)} />}
    </div>
  );
};
