import React, { useState } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateTo,
    setQuickViewProduct,
    settings,
  } = useShop();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor] = useState<string>(product.colors[0]?.name || 'Black | Gold Accent');

  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product, selectedSize, selectedColor, 1);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const primaryImage = product.images[0] || '/src/assets/images/fashion_gold_blazer_1790533633560.jpg';
  const secondaryImage = product.images[1] || primaryImage;

  return (
    <div
      onClick={() => navigateTo('product-detail', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#0D0D0D] border border-[#C5A059]/40 hover:border-[#D4AF37] rounded-sm p-3.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.18)] cursor-pointer"
    >
      {/* TOP CENTER LOGO (As seen in Reference Images 2 & 3) */}
      <div className="flex items-center justify-center pt-1 pb-2 border-b border-[#C5A059]/20 mb-3">
        <span className="text-sm tracking-[0.25em] font-serif-luxury font-bold text-gold-gradient select-none">
          {settings.brandName || 'MS.'}
        </span>
      </div>

      {/* Product Image Showcase with Smooth Hover Zoom */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141414] rounded-xs mb-3">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#D4AF37] text-black rounded-xs shadow-md">
              NEW
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-black/80 text-[#D4AF37] border border-[#D4AF37]/50 rounded-xs backdrop-blur-xs">
              BEST SELLER
            </span>
          )}
          {product.isSale && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-red-900/90 text-amber-200 border border-red-700/50 rounded-xs">
              SALE -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Action Overlay Buttons (Wishlist & Quick View) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              inWishlist
                ? 'bg-[#D4AF37] text-black shadow-lg'
                : 'bg-black/70 text-white hover:text-[#D4AF37] hover:bg-black'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-black' : ''}`} />
          </button>

          <button
            onClick={handleQuickView}
            aria-label="Quick preview product"
            className="p-2 rounded-full bg-black/70 text-white hover:text-[#D4AF37] hover:bg-black backdrop-blur-md transition-colors duration-200"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow justify-between text-center space-y-1.5">
        <h3 className="text-xs md:text-sm font-semibold tracking-wider uppercase text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
          {product.name}
        </h3>

        <p className="text-[11px] text-stone-400 font-light tracking-wide">
          {product.colors[0]?.name || 'Black | Gold Accent'}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-sm md:text-base font-semibold text-[#D4AF37] font-mono tabular-nums">
            PKR {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-stone-500 line-through font-mono tabular-nums">
              PKR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Button: ADD TO CART */}
        <div className="pt-2">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2 px-3 text-[11px] uppercase tracking-widest font-semibold border transition-all duration-200 flex items-center justify-center gap-1.5 rounded-xs ${
              justAdded
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : product.stock <= 0
                ? 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
                : 'bg-black/40 text-[#D4AF37] border-[#C5A059]/60 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                ADDED TO BAG
              </>
            ) : product.stock <= 0 ? (
              'SOLD OUT'
            ) : (
              'ADD TO CART'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
