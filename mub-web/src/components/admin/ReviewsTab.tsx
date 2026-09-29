import React, { useState } from 'react';
import { CheckCircle2, EyeOff, Star, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { deleteReview, setReviewStatus } from '../../services/storeService';
import { cardCls, EmptyState, formatDateTime, ghostBtn, runAction } from './adminUi';

export const ReviewsTab: React.FC = () => {
  const { adminReviews, showToast } = useStore();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const list = adminReviews.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = adminReviews.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full border cursor-pointer capitalize ${filter === f ? 'bg-[#1C1815] text-white border-[#1C1815]' : 'bg-white border-[#EAE3D8]'}`}
          >
            {f === 'pending' ? `Waiting for approval (${pendingCount})` : f}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">New customer reviews are hidden until you approve them.</p>

      <div className={`${cardCls} overflow-hidden`}>
        {list.length === 0 ? (
          <EmptyState title={filter === 'pending' ? 'No reviews waiting' : 'No reviews'} />
        ) : (
          <div className="divide-y divide-[#F3EFEA]">
            {list.map(r => (
              <div key={r.id} className="p-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                    ))}
                  </span>
                  <span className="font-medium">{r.customerName}</span>
                  {r.customerEmail && <span className="text-stone-400">{r.customerEmail}</span>}
                  <span className="text-stone-400">{formatDateTime(r.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.status === 'approved' ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-stone-500">On: <span className="text-stone-800">{r.productName || r.productId}</span></p>
                {r.title && <p className="font-serif font-medium text-sm">{r.title}</p>}
                <p className="text-stone-700 whitespace-pre-line">{r.comment}</p>
                <div className="flex gap-2 pt-1">
                  {r.status === 'pending' ? (
                    <button onClick={() => runAction(() => setReviewStatus(r.id, 'approved'), showToast, 'Review approved')} className={`${ghostBtn} py-1.5 text-emerald-700`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  ) : (
                    <button onClick={() => runAction(() => setReviewStatus(r.id, 'pending'), showToast, 'Review hidden')} className={`${ghostBtn} py-1.5`}>
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => window.confirm('Delete this review?') && runAction(() => deleteReview(r.id), showToast, 'Review deleted')}
                    className={`${ghostBtn} py-1.5 text-rose-600`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
