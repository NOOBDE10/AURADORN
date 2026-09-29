import React from 'react';
import { OrderStatus } from '../../types';
import { friendlyFirebaseError } from '../../firebase/config';

export const inputCls =
  'w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D] disabled:opacity-60';

export const primaryBtn =
  'px-5 py-2.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

export const goldBtn =
  'px-4 py-2.5 bg-[#C9A25D] hover:bg-[#B88E3E] text-[#181412] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50';

export const ghostBtn =
  'px-4 py-2.5 bg-white hover:bg-[#F0EAE1] text-[#1C1815] border border-[#EAE3D8] rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50';

export const cardCls = 'bg-white rounded-2xl border border-[#EAE3D8]';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  hint,
  children,
  className,
}) => (
  <label className={`block ${className || ''}`}>
    <span className="block text-xs font-medium text-stone-700 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[10px] text-stone-400 mt-1">{hint}</span>}
  </label>
);

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending (new)' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Packing' },
  { value: 'shipped', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered (paid)' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function statusClasses(status: OrderStatus): string {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'shipped':
      return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'processing':
      return 'bg-indigo-50 text-indigo-800 border-indigo-300';
    case 'confirmed':
      return 'bg-purple-50 text-purple-800 border-purple-300';
    case 'cancelled':
      return 'bg-rose-50 text-rose-800 border-rose-300';
    default:
      return 'bg-amber-50 text-amber-800 border-amber-300';
  }
}

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full uppercase text-[10px] font-semibold border ${statusClasses(status)}`}>
    {ORDER_STATUSES.find(s => s.value === status)?.label.replace(/ \(.*\)/, '') || status}
  </span>
);

/** Runs an admin action and reports success/failure as a toast. */
export async function runAction(
  action: () => Promise<unknown>,
  showToast: (message: string, type?: 'success' | 'info' | 'gold') => void,
  successMessage?: string
): Promise<boolean> {
  try {
    await action();
    if (successMessage) showToast(successMessage, 'gold');
    return true;
  } catch (e) {
    console.error(e);
    showToast(friendlyFirebaseError(e), 'info');
    return false;
  }
}

export function formatDateTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

export const EmptyState: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="py-14 px-6 text-center space-y-2">
    <p className="font-serif text-base text-[#1C1815]">{title}</p>
    {children && <div className="text-xs font-sans text-stone-500 max-w-md mx-auto">{children}</div>}
  </div>
);
