import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Heart, Eye, ShoppingBag, Star, Zap, Check, ArrowLeftRight } from 'lucide-react';
import { LoyaltyBadge } from './LoyaltyBadge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    openProductDetails, 
    openQuickView, 
    openCheckout,
    addToCompare,
    removeFromCompare,
    isInCompare
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  // Handle instant Buy Now
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    openCheckout();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const displayImage = isHovered && product.images.length > 1 
    ? product.images[1] 
    : product.images[0];

  return (
    <div
      onClick={() => openProductDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-[#EAE3D8] hover:border-[#C9A25D]/60 luxury-card-hover flex flex-col overflow-hidden shadow-xs cursor-pointer select-none"
    >
      {/* Product Image Area with smooth zoom */}
      <div className="relative aspect-square w-full bg-[#F5EFEB] overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <LoyaltyBadge product={product} variant="card" />

          {product.discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-rose-700 text-white font-sans text-[11px] font-semibold tracking-wider uppercase rounded-md shadow-xs pointer-events-none w-fit">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isBestSeller && !product.loyaltyBadge && (
            <span className="px-2.5 py-1 bg-[#1C1815] text-[#E6D4AF] font-sans text-[10px] font-semibold tracking-wider uppercase rounded-md shadow-xs border border-[#C9A25D]/30 pointer-events-none w-fit">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && !product.loyaltyBadge && (
            <span className="px-2.5 py-1 bg-[#C9A25D] text-[#1C1815] font-sans text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs pointer-events-none w-fit">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button with micro-interaction */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 cursor-pointer shadow-xs active:scale-75 ${
            isWishlisted 
              ? 'bg-rose-50 text-rose-600 scale-105' 
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-rose-600 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Compare Button */}
        <button
          onClick={handleToggleCompare}
          aria-label={isCompared ? 'Remove from side-by-side comparison' : 'Compare specifications side-by-side'}
          title={isCompared ? 'Remove from comparison' : 'Compare specifications side-by-side'}
          className={`absolute top-12 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 cursor-pointer shadow-xs active:scale-75 ${
            isCompared 
              ? 'bg-[#1C1815] text-[#C9A25D] scale-105 border border-[#C9A25D]/70 shadow-sm' 
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-[#C9A25D] hover:scale-110'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>

        {/* Quick View & Compare Floating Actions */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-2.5 bg-white/95 hover:bg-white text-[#1C1815] text-xs font-sans font-medium rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-all active:scale-95 cursor-pointer border border-[#EAE3D8]"
          >
            <Eye className="w-3.5 h-3.5 text-[#8C7662]" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleToggleCompare}
            className={`py-2 px-3 text-xs font-sans font-medium rounded-lg shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-all active:scale-95 cursor-pointer border ${
              isCompared
                ? 'bg-[#1C1815] text-[#E6D4AF] border-[#C9A25D]'
                : 'bg-white/95 hover:bg-white text-[#1C1815] border-[#EAE3D8] hover:text-[#C9A25D]'
            }`}
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${isCompared ? 'text-[#C9A25D]' : 'text-stone-500'}`} />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#8C7662] mb-1">
            <span className="uppercase tracking-widest font-sans font-medium text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-sans font-medium text-stone-700 text-xs">{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg text-[#1C1815] font-medium line-clamp-1 group-hover:text-[#C9A25D] transition-colors duration-300">
            {product.name}
          </h3>

          {/* Metal/Stone Specs preview */}
          <p className="text-xs text-stone-500 font-sans truncate mt-0.5">
            {product.details.metal} {product.details.stone ? `· ${product.details.stone}` : ''}
          </p>
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-2 border-t border-[#F3EFEA]">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-lg sm:text-xl font-semibold text-[#1C1815]">
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="font-sans text-xs text-stone-400 line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.stock <= 3 && product.stock > 0 && (
              <span className="ml-auto text-[10px] text-amber-700 font-sans font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Dual Action Buttons: Add to Bag & Buy Now (COD) with micro-interactions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`py-2.5 px-3 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 ${
                justAdded 
                  ? 'bg-emerald-700 text-white border border-emerald-700 shadow-xs' 
                  : 'bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#1C1815] border border-[#EAE3D8] hover:border-[#C9A25D]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C9A25D]" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="py-2.5 px-3 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-[#E6D4AF]" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
