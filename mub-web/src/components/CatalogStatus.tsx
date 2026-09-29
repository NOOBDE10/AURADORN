import React from 'react';
import { Loader2, Sparkles, WifiOff } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { whatsappLink } from '../utils/format';

/** Shown instead of the product grid while loading, on error, or before any products exist. */
export function useCatalogBlocked(): boolean {
  const { isCatalogLoading, catalogError, products } = useStore();
  return isCatalogLoading || Boolean(catalogError) || products.length === 0;
}

export const CatalogStatus: React.FC = () => {
  const { isCatalogLoading, catalogError, settings } = useStore();
  const chat = whatsappLink(settings.whatsappNumber, `Assalam o Alaikum ${settings.brandName}, I would like to see your collection.`);

  if (isCatalogLoading) {
    return (
      <div className="py-24 flex flex-col items-center gap-3 text-[#8C7662]">
        <Loader2 className="w-7 h-7 animate-spin text-[#C9A25D]" />
        <span className="text-xs font-sans">Loading collection…</span>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-[#EAE3D8] p-8 max-w-md mx-auto space-y-3">
        <WifiOff className="w-8 h-8 text-stone-400 mx-auto" />
        <p className="text-sm font-sans text-stone-600">{catalogError}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-full bg-[#1C1815] text-white text-xs font-semibold cursor-pointer">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="py-20 text-center bg-white rounded-3xl border border-[#EAE3D8] p-8 max-w-md mx-auto space-y-3">
      <Sparkles className="w-8 h-8 text-[#C9A25D] mx-auto" />
      <h3 className="font-serif text-xl text-[#1C1815]">New collection coming soon</h3>
      <p className="text-xs font-sans text-[#8C7662]">We are adding our latest pieces. Please check back shortly.</p>
      {chat && (
        <a href={chat} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold">
          Ask us on WhatsApp
        </a>
      )}
    </div>
  );
};
