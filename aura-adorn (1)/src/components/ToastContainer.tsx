import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-[#1C1815] text-[#FAF8F5] px-4 py-3 rounded-lg shadow-2xl border border-[#C9A25D]/40 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          {toast.type === 'gold' ? (
            <Sparkles className="w-5 h-5 text-[#C9A25D] shrink-0" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#E6D4AF] shrink-0" />
          )}
          <p className="text-sm font-sans tracking-wide font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};
