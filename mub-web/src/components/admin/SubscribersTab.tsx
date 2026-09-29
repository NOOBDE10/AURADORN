import React, { useState } from 'react';
import { Copy, Download, Search, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { deleteSubscriber } from '../../services/storeService';
import { cardCls, EmptyState, formatDateTime, ghostBtn, inputCls, runAction } from './adminUi';

export const SubscribersTab: React.FC = () => {
  const { subscribers, showToast } = useStore();
  const [search, setSearch] = useState('');
  const list = subscribers.filter(s => s.email.toLowerCase().includes(search.trim().toLowerCase()));

  const exportCsv = () => {
    const csv = ['Email,Subscribed', ...subscribers.map(s => `"${s.email}","${s.subscribedAt}"`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${inputCls} pl-9 bg-white`} placeholder="Search email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button
          disabled={subscribers.length === 0}
          onClick={() => {
            navigator.clipboard.writeText(subscribers.map(s => s.email).join(', '));
            showToast(`Copied ${subscribers.length} emails.`, 'gold');
          }}
          className={ghostBtn}
        >
          <Copy className="w-3.5 h-3.5" /> Copy all
        </button>
        <button disabled={subscribers.length === 0} onClick={exportCsv} className={ghostBtn}>
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        {list.length === 0 ? (
          <EmptyState title="No subscribers yet">People who sign up with the newsletter form in the footer appear here.</EmptyState>
        ) : (
          <div className="divide-y divide-[#F3EFEA]">
            {list.map(s => (
              <div key={s.id} className="p-3 px-4 flex items-center gap-4 text-xs">
                <span className="flex-1 font-medium">{s.email}</span>
                <span className="text-stone-400">{formatDateTime(s.subscribedAt)}</span>
                <button
                  onClick={() => window.confirm(`Remove ${s.email}?`) && runAction(() => deleteSubscriber(s.id), showToast, 'Subscriber removed')}
                  className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
