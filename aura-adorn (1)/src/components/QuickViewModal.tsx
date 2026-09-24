import React from 'react';
import { useStore } from '../context/StoreContext';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 transition-colors z-10 cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square bg-[#F3EFEA]">
            <img
              src={quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <LoyaltyBadge product={quickViewProduct} variant="card" />
              {quickViewProduct.discountPercentage > 0 && (
                <span className="px-2.5 py-1 bg-rose-700 text-white font-sans text-xs font-semibold uppercase rounded-md shadow-xs pointer-events-none w-fit">
                  -{quickViewProduct.discountPercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Details & CTA */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8C7662]">
                <span className="uppercase tracking-widest font-sans font-medium">{quickViewProduct.category}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold text-stone-800">{quickViewProduct.rating}</span>
                </div>
              </div>

              <h3 className="font-serif text-xl text-[#1C1815] font-medium leading-snug">
                {quickViewProduct.name}
              </h3>

              <div className="flex items-baseline gap-2 py-1">
                <span className="font-serif text-2xl font-semibold text-[#1C1815]">
                  ${quickViewProduct.price.toLocaleString()}
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="font-sans text-xs text-stone-400 line-through">
                    ${quickViewProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs font-sans text-[#4A3E38] line-clamp-3 leading-relaxed">
                {quickViewProduct.description}
              </p>

              <div className="pt-2 text-xs text-stone-600 font-sans space-y-1 bg-white p-3 rounded-xl border border-[#EAE3D8]">
                <p><span className="font-medium text-[#1C1815]">Metal:</span> {quickViewProduct.details.metal}</p>
                <p><span className="font-medium text-[#1C1815]">Stone:</span> {quickViewProduct.details.stone || 'Natural Diamond'}</p>
                <p><span className="font-medium text-[#1C1815]">Cert:</span> {quickViewProduct.details.certification || 'Certified Authenticity'}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToCart(quickViewProduct, 1)}
                  className="py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#1C1815] border border-[#C9A25D] font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C9A25D]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-2.5 px-3 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-[#E6D4AF]" />
                  <span>Buy Now (COD)</span>
                </button>
              </div>

              <button
                onClick={handleOpenFull}
                className="w-full py-2 text-xs font-sans font-medium text-[#8C7662] hover:text-[#1C1815] flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
