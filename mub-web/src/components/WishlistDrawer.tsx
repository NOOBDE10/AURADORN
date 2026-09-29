import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { formatPKR } from '../utils/format';
import { Product } from '../types';
import { needsOptionChoice } from '../utils/pricing';

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

  const handleMoveToCart = (product: Product) => {
    if (needsOptionChoice(product)) {
      closeWishlist();
      openProductDetails(product);
      return;
    }
    addToCart(product, 1, product.metalOptions?.[0]);
    toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-[#EAE3D8] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAE3D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">Private Wishlist</h2>
            <span className="text-xs font-sans bg-[#F3EFEA] text-[#8C7662] px-2 py-0.5 rounded-full font-medium">
              {wishlistedProducts.length} saved
            </span>
          </div>
          <button
            onClick={closeWishlist}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F3EFEA] flex items-center justify-center">
                <Heart className="w-8 h-8 text-[#8C7662]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1815]">Your wishlist is empty</h3>
              <p className="text-xs font-sans text-[#8C7662] max-w-xs">
                Save your cherished diamond rings and heritage necklaces to track availability or purchase later.
              </p>
              <button
                onClick={closeWishlist}
                className="px-6 py-2.5 bg-[#C9A25D] hover:bg-[#B88E3E] text-[#181412] font-sans text-xs font-semibold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            wishlistedProducts.map(product => (
              <div
                key={product.id}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs group"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onClick={() => {
                    closeWishlist();
                    openProductDetails(product);
                  }}
                  className="w-20 h-20 object-cover rounded-xl border border-[#EAE3D8] bg-[#F5EFEB] shrink-0 cursor-pointer"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => {
                          closeWishlist();
                          openProductDetails(product);
                        }}
                        className="font-serif text-sm font-medium text-[#1C1815] line-clamp-1 cursor-pointer hover:text-[#C9A25D]"
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 font-sans truncate">{product.details.metal}</p>
                    <p className="font-serif text-base font-semibold text-[#1C1815] mt-1">
                      {formatPKR(product.price)}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full py-2 px-3 bg-[#FAF8F5] hover:bg-[#1C1815] text-[#1C1815] hover:text-[#FAF8F5] border border-[#C9A25D] font-sans text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C9A25D]" />
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
