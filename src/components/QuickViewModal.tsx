import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { X, Heart, ShoppingBag, Zap, Star, ArrowRight } from 'lucide-react';
import { LoyaltyBadge } from './LoyaltyBadge';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    closeQuickView, 
    openProductDetails, 
    addToCart, 
    openCheckout, 
    toggleWishlist, 
    isInWishlist 
  } = useStore();

  if (!quickViewProduct) return null;

  const isWishlisted = isInWishlist(quickViewProduct.id);

  const handleBuyNow = () => {
    addToCart(quickViewProduct, 1);
    closeQuickView();
    openCheckout();
  };

  const handleOpenFull = () => {
    const prod = quickViewProduct;
    closeQuickView();
    openProductDetails(prod);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#181613]/90 hover:bg-[#25201A] text-stone-400 hover:text-[#FAF7F2] transition-colors z-10 cursor-pointer shadow-xs active:scale-90 border border-[#2E2822]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square bg-[#181613]">
            <img
              src={quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover"
            />
            {/* Top-Center Brand Medallion Logo */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#C9A25D] bg-[#0E0D0B] p-0.5 shadow-[0_2px_15px_rgba(201,162,93,0.4)]">
                <img 
                  src="/logo.png" 
                  alt="Aura Adorn logo" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
            </div>
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <LoyaltyBadge product={quickViewProduct} variant="card" />
              {quickViewProduct.discountPercentage > 0 && (
                <span className="px-2.5 py-1 bg-rose-950/90 text-rose-300 border border-rose-500/30 font-sans text-xs font-semibold uppercase rounded-md shadow-xs pointer-events-none w-fit">
                  -{quickViewProduct.discountPercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Details & CTA */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#E5C378]">
                <span className="uppercase tracking-widest font-sans font-medium">{quickViewProduct.category}</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-[#FAF7F2]">{quickViewProduct.rating}</span>
                </div>
              </div>

              <h3 className="font-serif text-xl text-[#FAF7F2] font-medium leading-snug">
                {quickViewProduct.name}
              </h3>

              <div className="flex items-baseline gap-2 py-1">
                <span className="font-serif text-2xl font-semibold text-[#E5C378]">
                  {formatPrice(quickViewProduct.price)}
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="font-sans text-xs text-stone-500 line-through">
                    {formatPrice(quickViewProduct.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs font-sans text-[#A89F91] line-clamp-3 leading-relaxed">
                {quickViewProduct.description}
              </p>

              <div className="pt-2 text-xs text-stone-300 font-sans space-y-1 bg-[#14120F] p-3 rounded-xl border border-[#26211B]">
                {quickViewProduct.details?.metal && <p><span className="font-medium text-[#E5C378]">Material:</span> {quickViewProduct.details.metal}</p>}
                {quickViewProduct.details?.stone && <p><span className="font-medium text-[#E5C378]">Stones:</span> {quickViewProduct.details.stone}</p>}
                <p><span className="font-medium text-[#E5C378]">Type:</span> Artificial jewellery</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToCart(quickViewProduct, 1)}
                  className="py-2.5 px-3 bg-[#14120F] hover:bg-[#1E1B16] text-[#FAF7F2] border border-[#C9A25D]/50 font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform hover:text-[#E5C378]"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-2.5 px-3 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-[#0B0A08]" />
                  <span>Buy Now (COD)</span>
                </button>
              </div>

              <button
                onClick={handleOpenFull}
                className="w-full py-2 text-xs font-sans font-medium text-[#A89F91] hover:text-[#E5C378] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Details & Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
