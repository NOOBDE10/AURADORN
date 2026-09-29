import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { Product } from '../types';
import { LoyaltyBadge, getProductLoyaltyTier } from './LoyaltyBadge';
import { 
  X, 
  ArrowLeftRight, 
  Sparkles, 
  ShoppingBag, 
  Zap, 
  Trash2, 
  Check, 
  Star, 
  ShieldCheck, 
  Award, 
  Plus, 
  Search, 
  Eye, 
  HelpCircle,
  Gem,
  Scale
} from 'lucide-react';

export const ProductComparisonModal: React.FC = () => {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    isCompareModalOpen, 
    closeCompareModal,
    addToCart,
    openCheckout,
    openProductDetails,
    products,
    addToCompare,
    showToast
  } = useStore();

  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  if (!isCompareModalOpen) return null;

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedItemIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    closeCompareModal();
    openCheckout();
  };

  // Helper to determine if an attribute value differs across the compared pieces
  const hasDifference = (extractor: (p: Product) => string | number | undefined) => {
    if (compareList.length <= 1) return false;
    const firstVal = extractor(compareList[0]);
    return compareList.some(p => extractor(p) !== firstVal);
  };

  // Available products for adding to comparison that aren't already included
  const availableToAdd = products.filter(
    p => !compareList.some(cp => cp.id === p.id) &&
    (pickerSearch.trim() === '' || 
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (p.details.stone && p.details.stone.toLowerCase().includes(pickerSearch.toLowerCase()))
    )
  );

  return (
    <div 
      data-lenis-prevent
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={closeCompareModal}
    >
      <div 
        className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-7xl my-auto rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#0A0908] text-[#FAF7F2] p-4 sm:p-6 border-b border-[#241F1A] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A25D]/20 border border-[#C9A25D]/40 flex items-center justify-center text-[#E5C378]">
              <Scale className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-sans font-bold tracking-[0.25em] text-[#E5C378]">
                  Side-by-Side Analysis
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-sans">
                  {compareList.length} of 4 Pieces
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-2xl text-[#FAF7F2] font-medium">
                Compare Items
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {compareList.length > 1 && (
              <button
                type="button"
                onClick={() => setHighlightDiffs(!highlightDiffs)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer flex items-center gap-1.5 border ${
                  highlightDiffs 
                    ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] border-[#E5C378] font-bold shadow-xs' 
                    : 'bg-white/10 text-stone-300 hover:text-white border-white/20'
                }`}
                title="Highlight rows with differing values"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Highlight Differences</span>
              </button>
            )}

            {compareList.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-lg text-xs font-sans bg-white/5 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Clear comparison list"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              onClick={closeCompareModal}
              className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Close Comparison Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div data-lenis-prevent className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {compareList.length === 0 ? (
            /* Empty Comparison State */
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#181613] border border-[#C9A25D]/40 flex items-center justify-center mx-auto text-[#E5C378]">
                <ArrowLeftRight className="w-7 h-7 text-[#E5C378]" />
              </div>
              <h3 className="font-serif text-2xl text-[#FAF7F2]">No Pieces Selected for Comparison</h3>
              <p className="text-xs sm:text-sm font-sans text-[#A89F91] leading-relaxed">
                Tap the compare icon on any item to compare it side by side.
</p>
              <div className="pt-2">
                <button
                  onClick={closeCompareModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Return to Boutique Shop
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Single item hint notice */}
              {compareList.length === 1 && (
                <div className="p-3 bg-[#1C1814] border border-[#C9A25D]/40 rounded-2xl flex items-center justify-between gap-3 text-xs font-sans text-[#E5C378]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E5C378] shrink-0" />
                    <span>You have selected 1 piece. Add another creation to view specifications side-by-side.</span>
                  </div>
                  <button
                    onClick={() => setIsAddPickerOpen(true)}
                    className="font-medium text-[#E5C378] underline hover:brightness-125 cursor-pointer shrink-0"
                  >
                    + Add Second Piece
                  </button>
                </div>
              )}

              {/* Side-by-side Table with responsive horizontal scroll */}
              <div className="overflow-x-auto pb-4">
                <div 
                  className="grid gap-4 min-w-[720px]"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(compareList.length + (compareList.length < 4 ? 1 : 0), 2)}, minmax(260px, 1fr))`
                  }}
                >
                  {/* Compared Product Columns */}
                  {compareList.map((product) => {
                    const isAdded = addedItemIds.includes(product.id);
                    const tier = getProductLoyaltyTier(product);

                    return (
                      <div 
                        key={product.id}
                        className="bg-[#14120F] rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/50 shadow-xs flex flex-col overflow-hidden transition-all"
                      >
                        {/* Column Header: Image & Quick Remove */}
                        <div className="relative aspect-4/3 bg-[#181613] overflow-hidden group">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/75 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-md z-10"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Loyalty Badge Overlay */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <LoyaltyBadge product={product} variant="card" showTooltip={false} />
                          </div>

                          {/* Quick details view link */}
                          <button
                            onClick={() => {
                              closeCompareModal();
                              openProductDetails(product);
                            }}
                            className="absolute bottom-2.5 inset-x-3 py-1.5 px-3 bg-[#0B0A08]/90 hover:bg-[#1C1814] text-[#FAF7F2] border border-[#C9A25D]/40 text-[11px] font-sans font-medium rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E5C378]" />
                            <span>View Full Dossier</span>
                          </button>
                        </div>

                        {/* Product Title & Category */}
                        <div className="p-4 border-b border-[#241F1A] space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-[#E5C378]">
                            <span>{product.category}</span>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-[#FAF7F2] text-[11px]">{product.rating}</span>
                              <span className="text-stone-400">({product.reviewCount})</span>
                            </div>
                          </div>
                          <h4 
                            onClick={() => {
                              closeCompareModal();
                              openProductDetails(product);
                            }}
                            className="font-serif text-base text-[#FAF7F2] font-semibold line-clamp-1 hover:text-[#E5C378] transition-colors cursor-pointer"
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Specification Rows */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-xs font-sans">
                          {/* Investment Price */}
                          <div className={`p-2.5 rounded-xl border ${
                            highlightDiffs && hasDifference(p => p.price)
                              ? 'bg-[#221B10] border-[#E5C378]'
                              : 'bg-[#181613] border-[#26211B]'
                          }`}>
                            <span className="text-[10px] font-sans uppercase tracking-wider text-stone-400 block mb-0.5">
                              Price & Privilege
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="font-serif text-lg font-bold text-[#E5C378]">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-xs text-stone-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                              {product.discountPercentage > 0 && (
                                <span className="ml-auto text-[10px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-500/30 px-1.5 py-0.5 rounded">
                                  Save {product.discountPercentage}%
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Cash on Delivery all over Pakistan
                            </span>
                          </div>

                          {/* Precious Metal */}
                          <div className={`space-y-1 pb-3 border-b border-[#241F1A] ${
                            highlightDiffs && hasDifference(p => p.details.metal) ? 'bg-[#221B10] p-2 rounded-lg' : ''
                          }`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                              Material & Finish
                            </span>
                            <p className="font-medium text-[#FAF7F2]">
                              {product.details.metal}
                            </p>
                            {product.details.weight && (
                              <p className="text-[11px] text-stone-400">
                                Weight: {product.details.weight}
                              </p>
                            )}
                          </div>

                          {/* Stones */}
                          <div className={`space-y-1 pb-3 border-b border-[#241F1A] ${
                            highlightDiffs && hasDifference(p => p.details.stone) ? 'bg-[#221B10] p-2 rounded-lg' : ''
                          }`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                              Stones
                            </span>
                            <p className="font-medium text-[#FAF7F2]">
                              {product.details.stone || '—'}
                            </p>
                          </div>

                          {/* Edition & Scarcity */}
                          <div className="space-y-1 pb-3 border-b border-[#241F1A]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                              Availability & Scarcity
                            </span>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-300">Stock:</span>
                              <span className={`font-semibold ${
                                product.stock <= 2 ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {product.stock > 0 ? `${product.stock} units available` : 'Made to Order'}
                              </span>
                            </div>
                            {tier && (
                              <p className="text-[11px] text-[#E5C378] font-medium">
                                {tier.fullTitle} ({tier.editionText || ''})
                              </p>
                            )}
                          </div>

                          {/* Sizing & Dimensions */}
                          {product.details.dimensions && (
                            <div className="space-y-1 pb-3 border-b border-[#241F1A]">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                                Dimensions / Fit
                              </span>
                              <p className="text-stone-300 text-xs">
                                {product.details.dimensions}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons: Add to Bag & Buy Now */}
                          <div className="pt-2 space-y-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className={`w-full py-2.5 px-3 rounded-xl font-sans text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                                isAdded 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] border border-[#2E2822] hover:border-[#C9A25D]'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-4 h-4 text-white" />
                                  <span>Added to Bag!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                                  <span>Add to Bag</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBuyNow(product)}
                              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-bold rounded-xl font-sans text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Zap className="w-3.5 h-3.5 text-[#0B0A08]" />
                              <span>Instant Buy Now (COD)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot Card to Add Another Product */}
                  {compareList.length < 4 && (
                    <div className="rounded-2xl border-2 border-dashed border-[#2E2822] hover:border-[#C9A25D] bg-[#14120F]/60 hover:bg-[#14120F] transition-all p-6 flex flex-col items-center justify-center text-center min-h-[450px]">
                      <div className="w-14 h-14 rounded-full bg-[#181613] border border-[#26211B] flex items-center justify-center text-[#E5C378] shadow-sm mb-4">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-lg text-[#FAF7F2] font-medium mb-1">
                        Add Piece to Compare
                      </h4>
                      <p className="text-xs font-sans text-stone-400 max-w-xs mb-6">
                        Select another creation from our curated portfolios (up to 4 pieces).
                      </p>

                      <button
                        type="button"
                        onClick={() => setIsAddPickerOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] text-xs font-sans font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-[#0B0A08]" />
                        <span>Browse Catalogue</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Product Picker Drawer / Popover */}
        {isAddPickerOpen && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#14120F] rounded-3xl border border-[#26211B] shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 sm:p-5 bg-[#0A0908] text-white flex items-center justify-between border-b border-[#241F1A]">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E5C378]" />
                  <h3 className="font-serif text-base sm:text-lg text-[#FAF7F2]">Select Piece for Comparison</h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddPickerOpen(false);
                    setPickerSearch('');
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input in picker */}
              <div className="p-4 border-b border-[#241F1A] bg-[#0E0D0B]">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search by gemstone, design, metal, or category..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#181613] border border-[#2E2822] text-[#FAF7F2] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
              </div>

              {/* Products list */}
              <div className="overflow-y-auto p-4 space-y-2 flex-1">
                {availableToAdd.length === 0 ? (
                  <p className="text-center py-8 text-xs text-stone-500 font-sans">
                    No matching pieces found to add.
                  </p>
                ) : (
                  availableToAdd.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        addToCompare(p);
                        setIsAddPickerOpen(false);
                        setPickerSearch('');
                      }}
                      className="p-3 rounded-xl border border-[#26211B] hover:border-[#C9A25D] hover:bg-[#181613] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-stone-900 shrink-0" 
                        />
                        <div className="min-w-0">
                          <h5 className="font-serif text-sm text-[#FAF7F2] group-hover:text-[#E5C378] truncate">
                            {p.name}
                          </h5>
                          <p className="text-[11px] font-sans text-[#A89F91] truncate">
                            {p.details.metal} · {p.details.stone || p.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif text-sm font-semibold text-[#E5C378] block">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-[10px] uppercase font-sans font-bold text-[#E5C378] group-hover:underline">
                          + Add to Compare
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-3 sm:p-4 bg-[#0A0908] border-t border-[#241F1A] flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-stone-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cash on Delivery all over Pakistan.</span>
          </div>
          <button
            onClick={closeCompareModal}
            className="text-[#E5C378] hover:underline font-medium transition-colors cursor-pointer text-xs ml-auto"
          >
            Close Comparison Window
          </button>
        </div>
      </div>
    </div>
  );
};
