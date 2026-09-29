import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { Product } from '../types';
import { 
  Sparkles, 
  Clock, 
  Flame, 
  ShoppingBag, 
  Eye, 
  Heart, 
  ShieldCheck, 
  Check, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface VaultDealsSectionProps {
  onNavigateToShop?: (category?: string) => void;
}

export const VaultDealsSection: React.FC<VaultDealsSectionProps> = ({ onNavigateToShop }) => {
  const { 
    products, 
    addToCart, 
    openQuickView, 
    toggleWishlist, 
    isInWishlist, 
    openCheckout,
    showToast 
  } = useStore();

  // Deal items curated from store products with discounts, plus fallback high-discount items
  const dealProducts: Product[] = products
    .filter(p => p.price < p.originalPrice && p.stock > 0)
    .slice(0, 6);

  // If fewer than 4 products have discounts, take top products and compute deal prices
  const activeDeals = dealProducts;


  const [claimedDealId, setClaimedDealId] = useState<string | null>(null);

  const handleClaimDeal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setClaimedDealId(product.id);
    
    setTimeout(() => setClaimedDealId(null), 1800);
  };

  const handleFastBuy = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    openCheckout();
  };

  if (activeDeals.length === 0) return null;

  return (
    <section className="py-20 bg-[#0E0D0B] text-[#FAF7F2] relative overflow-hidden border-b border-[#26211B]">
      {/* Ambient Gold Radial Glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#C9A25D]/10 rounded-full blur-[140px] pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#241F1A] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181613] border border-[#C9A25D]/40">
              <Flame className="w-3.5 h-3.5 text-[#E5C378] animate-pulse" />
              <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-[#E5C378]">
                Special Offers
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAF7F2]">
              On Sale Now
            </h2>
            <p className="text-xs sm:text-sm font-sans text-[#A89F91] leading-relaxed">
              Our best prices on selected pieces, while stock lasts.
            </p>
          </div>

        </div>

        {/* Deal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeDeals.map((product, idx) => {
            const isWishlisted = isInWishlist(product.id);
            const discountPercent = product.discountPercentage > 0 
              ? product.discountPercentage 
              : Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) || 25;
            const savings = Math.max(0, product.originalPrice - product.price);
            const isClaimed = claimedDealId === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-[#14120F] rounded-3xl border border-[#26211B] hover:border-[#C9A25D]/70 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(201,162,93,0.18)] overflow-hidden flex flex-col justify-between"
              >
                {/* TOP HEADER OF CARD: Top Center AA JEWELLERS Logo Medallion */}
                <div className="relative pt-4 pb-2 px-4 flex items-center justify-between z-20">
                  {/* Left: Deal Percentage Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-sans text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm">
                    <Zap className="w-3 h-3 fill-[#0B0A08]" />
                    {discountPercent}% OFF
                  </span>

                  {/* Top-Center Brand Medallion Logo (User's Exact Logo) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-3">
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#0B0A08] border-2 border-[#C9A25D] p-0.5 shadow-[0_2px_15px_rgba(201,162,93,0.5),0_0_12px_rgba(0,0,0,0.9)] group-hover:scale-110 group-hover:border-[#E5C378] transition-transform duration-300">
                      <img 
                        src="/logo.png" 
                        alt="Aura Adorn logo" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                      <Sparkles className="w-3 h-3 text-[#E5C378] absolute top-0.5 right-0.5 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Right: Wishlist Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors duration-200 cursor-pointer border ${
                      isWishlisted 
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/40' 
                        : 'bg-[#0E0D0B]/80 text-stone-300 hover:text-[#E5C378] border-[#2A241E]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Product Image Area with Quick View Overlay */}
                <div 
                  onClick={() => openQuickView(product)}
                  className="relative aspect-4/3 overflow-hidden bg-[#181613] mx-3 mt-1 rounded-2xl cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14120F] via-transparent to-transparent opacity-60" />

                  {/* Quick View Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
                    <span className="px-4 py-2 bg-[#0E0D0B]/90 text-[#E5C378] border border-[#C9A25D]/60 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-[#C9A25D]" />
                      <span>Inspect Jewel</span>
                    </span>
                  </div>

                  {/* Metal Purity Tag */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 bg-[#0B0A08]/85 text-[#E5C378] border border-[#C9A25D]/30 rounded-md text-[9px] font-sans font-medium uppercase tracking-wider backdrop-blur-xs">
                      {product.details?.metal || ''}
                    </span>
                  </div>
                </div>

                {/* Card Body & Pricing Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-sans text-stone-400">
                      <span className="uppercase tracking-widest text-[#C9A25D] font-semibold text-[10px]">
                        {product.category}
                      </span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Cash on Delivery
                      </span>
                    </div>

                    <h3 
                      onClick={() => openQuickView(product)}
                      className="font-serif text-lg font-medium text-[#FAF7F2] group-hover:text-[#E5C378] transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    {/* Stock Urgency Indicator */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-sans">
                        <span className="text-[#A89F91]">Vault Allocation:</span>
                        <span className="text-[#E5C378] font-bold">Only {product.stock || 2} pieces left</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#241F1A] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] rounded-full" 
                          style={{ width: `${Math.min(90, Math.max(25, (10 - (product.stock || 2)) * 10))}%` }} 
                        />
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="pt-2 flex items-baseline gap-2.5">
                      <span className="font-serif text-2xl font-bold text-[#E5C378]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs font-sans text-stone-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      {savings > 0 && (
                        <span className="text-[10px] font-sans font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Save {formatPrice(savings)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Add to Cart & Buy COD */}
                  <div className="space-y-2 pt-2 border-t border-[#241F1A]">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleClaimDeal(product, e)}
                        className={`flex-1 py-3 px-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-md ${
                          isClaimed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] hover:brightness-110'
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Bag!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Bag</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleFastBuy(product, e)}
                        title="Instant Cash On Delivery Order"
                        className="py-3 px-3.5 bg-[#181613] hover:bg-[#221E19] text-[#E5C378] hover:text-[#FAF7F2] border border-[#2E2822] hover:border-[#C9A25D] rounded-xl font-sans text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      >
                        <span>Buy COD</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Deals Footer Link */}
        {onNavigateToShop && (
          <div className="text-center pt-4">
            <button
              onClick={() => onNavigateToShop('all')}
              className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] font-semibold text-[#E5C378] hover:text-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <span>Explore All Creations in Boutique Catalogue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
