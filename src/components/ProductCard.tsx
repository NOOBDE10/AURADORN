import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { Product } from '../types';
import { Heart, Eye, ShoppingBag, Star, Zap, Check, ArrowLeftRight, Sparkles } from 'lucide-react';
import { LoyaltyBadge } from './LoyaltyBadge';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ 
        duration: 0.6, 
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={{ y: -6 }}
      onClick={() => openProductDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#14120F] rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/80 hover:shadow-[0_22px_45px_-10px_rgba(0,0,0,0.85),0_0_25px_rgba(201,162,93,0.18)] flex flex-col overflow-hidden transition-all duration-300 cursor-pointer select-none"
    >
      {/* Product Image Area with smooth zoom */}
      <div className="relative aspect-square w-full bg-[#181613] overflow-hidden">
        <motion.img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-center"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <LoyaltyBadge product={product} variant="card" />

          {product.discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-rose-950/90 text-rose-200 border border-rose-500/30 font-sans text-[11px] font-semibold tracking-wider uppercase rounded-md shadow-xs pointer-events-none w-fit">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isBestSeller && !product.loyaltyBadge && (
            <span className="px-2.5 py-1 bg-[#090807]/90 text-[#E6D4AF] font-sans text-[10px] font-semibold tracking-wider uppercase rounded-md shadow-xs border border-[#C9A25D]/50 pointer-events-none w-fit">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && !product.loyaltyBadge && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-sans text-[10px] font-bold tracking-wider uppercase rounded-md shadow-xs pointer-events-none w-fit">
              New
            </span>
          )}
        </div>

        {/* Luxury Brand Logo Crest at Top Center */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B0A08] border-2 border-[#C9A25D] p-0.5 shadow-[0_2px_15px_rgba(201,162,93,0.4),0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center group-hover:border-[#E5C378] group-hover:scale-110 transition-all duration-300">
            <img loading="lazy" decoding="async" 
              src="/logo-256.jpg" 
              alt="Aura Adorn logo" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon.svg';
              }}
              className="w-full h-full object-cover rounded-full" 
            />
            <Sparkles className="w-3 h-3 text-[#E5C378] absolute pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Wishlist Button with smooth spring micro-interaction */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors duration-200 z-10 cursor-pointer shadow-xs border ${
            isWishlisted 
              ? 'bg-rose-950/80 text-rose-400 border-rose-500/40' 
              : 'bg-[#0B0A08]/75 text-stone-300 hover:bg-[#181613] hover:text-[#E5C378] border-[#2A241E]'
          }`}
        >
          <Heart className={`w-4 h-4 transition-all duration-200 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </motion.button>

        {/* Compare Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={handleToggleCompare}
          aria-label={isCompared ? 'Remove from side-by-side comparison' : 'Compare specifications side-by-side'}
          title={isCompared ? 'Remove from comparison' : 'Compare specifications side-by-side'}
          className={`absolute top-12 right-3 p-2 rounded-full backdrop-blur-md transition-colors duration-200 z-10 cursor-pointer shadow-xs border ${
            isCompared 
              ? 'bg-[#E5C378] text-[#0B0A08] border-[#E5C378] shadow-sm' 
              : 'bg-[#0B0A08]/75 text-stone-300 hover:bg-[#181613] hover:text-[#E5C378] border-[#2A241E]'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </motion.button>

        {/* Quick View & Compare Floating Actions with slide-up fade */}
        <div 
          className={`absolute inset-x-3 bottom-3 hidden sm:flex gap-2 transition-all duration-300 ease-out z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickView}
            className="flex-1 py-2 px-2.5 bg-[#14120F]/95 hover:bg-[#1E1B16] text-[#FAF7F2] text-xs font-sans font-medium rounded-lg shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer border border-[#C9A25D]/40 hover:text-[#E5C378]"
          >
            <Eye className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>Quick View</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleCompare}
            className={`py-2 px-3 text-xs font-sans font-medium rounded-lg shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer border ${
              isCompared
                ? 'bg-[#E5C378] text-[#0B0A08] border-[#E5C378]'
                : 'bg-[#14120F]/95 hover:bg-[#1E1B16] text-[#FAF7F2] border-[#2A241E] hover:text-[#E5C378]'
            }`}
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${isCompared ? 'text-[#0B0A08]' : 'text-[#E5C378]'}`} />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </motion.button>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#A89F91] mb-1">
            <span className="uppercase tracking-widest font-sans font-medium text-[10px] text-[#E5C378]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-sans font-medium text-[#FAF7F2] text-xs">{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg text-[#FAF7F2] font-medium line-clamp-1 group-hover:text-[#E5C378] transition-colors duration-300">
            {product.name}
          </h3>

          {/* Metal/Stone Specs preview */}
          <p className="text-xs text-[#8C8275] font-sans truncate mt-0.5">
            {product.details.metal} {product.details.stone ? `· ${product.details.stone}` : ''}
          </p>
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-2 border-t border-[#241F1A]">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-lg sm:text-xl font-semibold text-[#E5C378]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="font-sans text-xs text-stone-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.stock <= 3 && product.stock > 0 && (
              <span className="ml-auto text-[10px] text-amber-300 font-sans font-medium bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Dual Action Buttons: Add to Bag & Buy Now (COD) with micro-interactions */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`py-2.5 px-3 font-sans text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                justAdded 
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-xs' 
                  : 'bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] border border-[#2E2822] hover:border-[#C9A25D]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Add to Bag</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="py-2.5 px-3 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_12px_rgba(201,162,93,0.25)] disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-[#0B0A08]" />
              <span>Buy Now</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
