import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeftRight, X, Sparkles, Scale } from 'lucide-react';

export const ProductCompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, openCompareModal, isCompareModalOpen } = useStore();

  if (compareList.length === 0 || isCompareModalOpen) return null;

  return (
    <div className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1C1815]/95 backdrop-blur-md text-[#FAF8F5] border border-[#C9A25D]/60 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 max-w-xl">
        {/* Left: Indicator & Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#C9A25D]/20 border border-[#C9A25D]/40 flex items-center justify-center text-[#E6D4AF]">
            <Scale className="w-4 h-4 text-[#C9A25D]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C9A25D] block">
              Specifications
            </span>
            <span className="text-xs font-serif font-medium text-white">
              {compareList.length} of 4 Selected
            </span>
          </div>
        </div>

        {/* Center: Product Thumbnails */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
          {compareList.map((product) => (
            <div 
              key={product.id}
              className="relative group shrink-0"
              title={product.name}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-[#C9A25D]/40 bg-stone-900 group-hover:border-[#C9A25D] transition-colors"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCompare(product.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer shadow-xs"
                title={`Remove ${product.name}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Empty slot indicators */}
          {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-dashed border-stone-700/80 bg-stone-900/40 hidden md:flex items-center justify-center text-stone-600 text-[10px] shrink-0"
              title="Select another piece from shop"
            >
              +
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={openCompareModal}
            className="gold-foil-badge px-3 sm:px-4 py-2 rounded-xl text-xs font-serif font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#2B1B04]" />
            <span>Compare Now</span>
          </button>

          <button
            type="button"
            onClick={clearCompare}
            className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
