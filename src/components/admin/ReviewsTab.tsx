import React, { useEffect, useState } from 'react';
import { Check, Trash2, EyeOff } from 'lucide-react';
import { Review } from '../../types';
import { fetchAllReviews, updateReviewStatus, deleteReview } from '../../services/storeService';

export const ReviewsTab: React.FC<{ showToast: (m: string, t?: 'success' | 'info' | 'gold') => void }> = ({ showToast }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await fetchAllReviews());
    } catch {
      showToast('Could not load reviews.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (r: Review, status: 'approved' | 'pending') => {
    await updateReviewStatus(r.id, status);
    setReviews(prev => prev.map(x => (x.id === r.id ? { ...x, status } : x)));
    showToast(status === 'approved' ? 'Review published.' : 'Review hidden.', 'gold');
  };

  const remove = async (r: Review) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(r.id);
    setReviews(prev => prev.filter(x => x.id !== r.id));
  };

  if (loading) return <p className="text-xs text-stone-400">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-xs text-stone-400">No reviews yet. New customer reviews appear here for approval before they show on the site.</p>;

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="p-4 rounded-2xl border border-[#26211B] bg-[#12100E] text-xs font-sans">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[#FAF7F2] font-medium">{r.customerName} · {'★'.repeat(r.rating)}<span className="text-stone-600">{'★'.repeat(5 - r.rating)}</span></p>
              <p className="text-stone-500">{r.productName} · {new Date(r.createdAt).toLocaleDateString('en-PK')}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${r.status === 'approved' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'}`}>{r.status}</span>
          </div>
          {r.title && <p className="mt-2 text-[#E5C378]">{r.title}</p>}
          <p className="mt-1 text-stone-300 whitespace-pre-line">{r.comment}</p>
          <div className="flex gap-2 mt-3">
            {r.status !== 'approved' ? (
              <button onClick={() => setStatus(r, 'approved')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800/60 text-emerald-200 hover:bg-emerald-700 cursor-pointer"><Check className="w-3.5 h-3.5" /> Approve</button>
            ) : (
              <button onClick={() => setStatus(r, 'pending')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#26211B] text-stone-300 hover:text-white cursor-pointer"><EyeOff className="w-3.5 h-3.5" /> Hide</button>
            )}
            <button onClick={() => remove(r)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#26211B] text-stone-300 hover:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};
