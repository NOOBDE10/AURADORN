import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { 
    isWishlistOpen, 
    closeWishlist, 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart,
    openProductDetails 
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0B0A08] h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col border-l border-[#26211B] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#241F1A] bg-[#0E0D0B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0B0A08] shrink-0 p-0.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="Aura Adorn logo" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#FAF7F2] leading-tight">Private Wishlist</h2>
              <span className="text-[10px] text-[#A89F91] font-sans block">{wishlist.length} Cherished Creation{wishlist.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <button
            onClick={closeWishlist}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#14120F] border border-[#26211B] flex items-center justify-center">
                <Heart className="w-8 h-8 text-[#E5C378]" />
              </div>
              <h3 className="font-serif text-xl text-[#FAF7F2]">Your wishlist is empty</h3>
              <p className="text-xs font-sans text-[#A89F91] max-w-xs">
                Tap the heart on any item to save it here for later.
              </p>
              <button
                onClick={closeWishlist}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            wishlistedProducts.map(product => (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm hover:border-[#C9A25D]/40 transition-colors group"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onClick={() => {
                    closeWishlist();
                    openProductDetails(product);
                  }}
                  className="w-20 h-20 object-cover rounded-xl border border-[#2E2822] bg-[#181613] shrink-0 cursor-pointer"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => {
                          closeWishlist();
                          openProductDetails(product);
                        }}
                        className="font-serif text-sm font-medium text-[#FAF7F2] line-clamp-1 cursor-pointer hover:text-[#E5C378]"
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-stone-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#A89F91] font-sans truncate">{product.details.metal}</p>
                    <p className="font-serif text-base font-semibold text-[#E5C378] mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full py-2 px-3 bg-[#1C1814] hover:bg-[#25201A] text-[#FAF7F2] hover:text-[#E5C378] border border-[#C9A25D]/50 font-sans text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
