import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './SkeletonLoader';
import { 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Search, 
  ShieldCheck, 
  Truck, 
  Award, 
  RotateCcw,
  Check,
  ChevronRight,
  Crown,
  Scale,
  ArrowLeftRight
} from 'lucide-react';
import { Product } from '../types';
import { getProductLoyaltyTier } from './LoyaltyBadge';

interface ShopPageProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigateHome: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  selectedCategory,
  onSelectCategory,
  onNavigateHome,
  searchQuery: externalSearchQuery,
  onSearchChange
}) => {
  const { products, categories, compareList, openCompareModal, isLoading } = useStore();

  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [selectedMetal, setSelectedMetal] = useState<string>('all');
  const [selectedStone, setSelectedStone] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = no price limit
  const priceCeiling = useMemo(
    () => Math.max(1000, Math.ceil(Math.max(0, ...products.map(p => p.price)) / 500) * 500),
    [products]
  );
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest' | 'rating' | 'discount'>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // Available metals and stones for filtering
  // Filter choices come from the products the admin has entered.
  const uniqueValues = (values: (string | undefined)[]) =>
    ['all', ...Array.from(new Set(values.map(v => (v || '').trim()).filter(Boolean))).sort()];
  const metals = useMemo(() => uniqueValues(products.map(p => p.details?.metal)), [products]);
  const stones = useMemo(() => uniqueValues(products.map(p => p.details?.stone)), [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list: Product[] = [...products];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'new-arrivals') {
        list = list.filter(p => p.isNewArrival);
      } else if (selectedCategory === 'sale' || selectedCategory === 'deals') {
        list = list.filter(p => p.discountPercentage > 0 || p.price < p.originalPrice);
      } else if (selectedCategory === 'best-sellers') {
        list = list.filter(p => p.isBestSeller);
      } else if (selectedCategory === 'exclusives') {
        list = list.filter(p => Boolean(getProductLoyaltyTier(p)));
      } else {
        list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.details.stone && p.details.stone.toLowerCase().includes(q)) ||
        (p.details.metal && p.details.metal.toLowerCase().includes(q))
      );
    }

    // Filter by Metal
    if (selectedMetal !== 'all') {
      list = list.filter(p => (p.details?.metal || '') === selectedMetal);
    }

    // Filter by Stone
    if (selectedStone !== 'all') {
      list = list.filter(p => (p.details?.stone || '') === selectedStone);
    }

    // Filter by Price
    if (maxPrice > 0) list = list.filter(p => p.price <= maxPrice);

    // Filter by Stock
    if (onlyInStock) {
      list = list.filter(p => p.stock > 0 && p.status === 'active');
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        list.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [products, selectedCategory, searchQuery, selectedMetal, selectedStone, maxPrice, onlyInStock, sortBy]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedMetal !== 'all' || 
    selectedStone !== 'all' || 
    maxPrice > 0 || 
    onlyInStock || 
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    onSelectCategory('all');
    setSelectedMetal('all');
    setSelectedStone('all');
    setMaxPrice(0);
    setOnlyInStock(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-[#0B0A08] min-h-screen text-[#FAF7F2]">
      {/* Editorial Page Header */}
      <div className="relative bg-[#12100E] text-[#FAF7F2] py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#C9A25D]/25">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C9A25D_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-4 tracking-wider uppercase">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#E5C378] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[#E5C378] font-medium">Boutique Shop</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                <span className="capitalize text-stone-300">{selectedCategory.replace('-', ' ')}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#E5C378] text-xs font-sans uppercase tracking-[0.25em] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Artificial Jewellery</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#FAF7F2]">
                Shop All
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#A89F91] max-w-2xl font-sans leading-relaxed">
                Necklace sets, earrings, bangles, rings and bridal jewellery, all with Cash on Delivery all over Pakistan.
</p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-[#C9A25D]/30 rounded-2xl p-3 px-5 backdrop-blur-md text-xs font-sans">
              <div>
                <span className="block font-serif text-lg text-[#E5C378] font-semibold">{products.length}</span>
                <span className="text-[#A89F91] text-[10px] tracking-widest uppercase">Masterpieces</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="block font-serif text-lg text-[#FAF7F2] font-semibold">100%</span>
                <span className="text-[#A89F91] text-[10px] tracking-widest uppercase">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-[#241F1A]">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold shadow-md'
                : 'bg-[#14120F] text-[#D8CDC0] border border-[#2A241E] hover:border-[#C9A25D]'
            }`}
          >
            All Portfolios ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold shadow-md'
                  : 'bg-[#14120F] text-[#D8CDC0] border border-[#2A241E] hover:border-[#C9A25D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => onSelectCategory('new-arrivals')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'new-arrivals'
                ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold shadow-md'
                : 'bg-[#14120F] text-[#D8CDC0] border border-[#2A241E] hover:border-[#C9A25D]'
            }`}
          >
            ✨ New Arrivals
          </button>
          <button
            onClick={() => onSelectCategory('deals')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'deals' || selectedCategory === 'sale'
                ? 'bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-bold shadow-md'
                : 'bg-[#14120F] text-[#E5C378] border border-[#C9A25D]/40 hover:border-[#C9A25D]'
            }`}
          >
            <span>Sale</span>
          </button>
        </div>

        {/* Toolbar: Search, Filters toggle, Sorting, Count */}
        <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#241F1A]">
          {/* Search within shop */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by jewellery name, metal, or gemstone..."
              className="w-full bg-[#14120F] border border-[#2A241E] rounded-full py-2.5 pl-10 pr-8 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D] shadow-2xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-[#E5C378] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Filter Drawer Toggle, Compare button & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2.5 rounded-full border text-xs font-sans font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                isFilterOpen || hasActiveFilters
                  ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold border-[#E5C378]'
                  : 'bg-[#14120F] text-[#FAF7F2] border-[#2A241E] hover:border-[#C9A25D]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#E5C378]" />
              )}
            </button>

            {/* Compare Button */}
            <button
              onClick={openCompareModal}
              className={`px-4 py-2.5 rounded-full border text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                compareList.length > 0
                  ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold border-[#E5C378]'
                  : 'bg-[#14120F] text-[#FAF7F2] border-[#2A241E] hover:border-[#C9A25D]'
              }`}
              title="Compare selected fine jewellery pieces side by side"
            >
              <Scale className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FAF7F2] text-[#0B0A08] text-[10px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-[#14120F] border border-[#2A241E] rounded-full px-3 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-sans font-medium text-[#FAF7F2] focus:outline-none cursor-pointer py-1 pr-2"
              >
                <option value="featured" className="bg-[#14120F] text-[#FAF7F2]">Featured Curations</option>
                <option value="price-low" className="bg-[#14120F] text-[#FAF7F2]">Price: Low to High</option>
                <option value="price-high" className="bg-[#14120F] text-[#FAF7F2]">Price: High to Low</option>
                <option value="newest" className="bg-[#14120F] text-[#FAF7F2]">Newest Additions</option>
                <option value="rating" className="bg-[#14120F] text-[#FAF7F2]">Highest Rated</option>
                <option value="discount" className="bg-[#14120F] text-[#FAF7F2]">Largest Privilege %</option>
              </select>
            </div>

            <span className="text-xs font-sans text-[#A89F91] hidden sm:inline">
              Showing <strong className="text-[#E5C378]">{filteredProducts.length}</strong> items
            </span>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="p-6 my-6 bg-[#14120F] rounded-3xl border border-[#C9A25D]/30 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#241F1A]">
              <h3 className="font-serif text-lg font-medium text-[#FAF7F2] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E5C378]" />
                Filter Jewellery Portfolio
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-sans text-[#E5C378] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              {/* Metal Selection */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-[#E5C378] font-semibold mb-2">
                  Precious Metal
                </label>
                <select
                  value={selectedMetal}
                  onChange={(e) => setSelectedMetal(e.target.value)}
                  className="w-full bg-[#181613] border border-[#2E2822] rounded-xl p-2.5 text-xs font-sans text-[#FAF7F2] focus:outline-none focus:border-[#C9A25D]"
                >
                  <option value="all" className="bg-[#14120F] text-[#FAF7F2]">All Metals</option>
                  {metals.filter(m => m !== 'all').map(metal => (
                    <option key={metal} value={metal} className="bg-[#14120F] text-[#FAF7F2]">{metal}</option>
                  ))}
                </select>
              </div>

              {/* Gemstone Selection */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-[#E5C378] font-semibold mb-2">
                  Stones
                </label>
                <select
                  value={selectedStone}
                  onChange={(e) => setSelectedStone(e.target.value)}
                  className="w-full bg-[#181613] border border-[#2E2822] rounded-xl p-2.5 text-xs font-sans text-[#FAF7F2] focus:outline-none focus:border-[#C9A25D]"
                >
                  <option value="all" className="bg-[#14120F] text-[#FAF7F2]">All Gemstones</option>
                  {stones.filter(s => s !== 'all').map(stone => (
                    <option key={stone} value={stone} className="bg-[#14120F] text-[#FAF7F2]">{stone}</option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-sans uppercase tracking-widest text-[#E5C378] font-semibold mb-2">
                  <span>Price Range</span>
                  <span className="text-[#E5C378] font-serif font-bold">{maxPrice > 0 ? formatPrice(maxPrice) : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={priceCeiling}
                  step="100"
                  value={maxPrice || priceCeiling}
                  onChange={(e) => { const v = Number(e.target.value); setMaxPrice(v >= priceCeiling ? 0 : v); }}
                  className="w-full accent-[#C9A25D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-sans mt-1">
                  <span>Rs 0</span>
                  <span>{formatPrice(priceCeiling)}</span>
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-[#181613] p-3 rounded-xl border border-[#2E2822] hover:border-[#C9A25D] transition-colors">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded accent-[#C9A25D] w-4 h-4"
                  />
                  <span className="text-xs font-sans text-[#FAF7F2] font-medium">
                    In stock only
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-6 pt-2">
            <span className="text-xs font-sans text-stone-400">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181613] border border-[#2E2822] rounded-full text-xs font-sans text-[#D8CDC0] capitalize">
                Category: {selectedCategory}
                <button onClick={() => onSelectCategory('all')} className="hover:text-[#E5C378] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMetal !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181613] border border-[#2E2822] rounded-full text-xs font-sans text-[#D8CDC0]">
                Metal: {selectedMetal}
                <button onClick={() => setSelectedMetal('all')} className="hover:text-[#E5C378] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStone !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181613] border border-[#2E2822] rounded-full text-xs font-sans text-[#D8CDC0]">
                Stone: {selectedStone}
                <button onClick={() => setSelectedStone('all')} className="hover:text-[#E5C378] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181613] border border-[#2E2822] rounded-full text-xs font-sans text-[#D8CDC0]">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-[#E5C378] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-sans text-[#E5C378] hover:underline ml-2 cursor-pointer font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={`shop-skeleton-${idx}`} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-[#14120F] rounded-3xl border border-[#C9A25D]/30 p-8 max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#181613] border border-[#C9A25D]/40 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#E5C378]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#FAF7F2]">No jewellery creations match</h3>
            <p className="mt-2 text-xs font-sans text-[#A89F91] leading-relaxed">
              We couldn't find any creations matching your selected filter criteria. Try adjusting your filters or price limit.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] rounded-full text-xs font-sans font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Trust Pillars */}
        <div className="mt-20 pt-12 border-t border-[#241F1A] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3 bg-[#14120F] p-5 rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1714] border border-[#C9A25D]/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF7F2]">Quality Finish</h4>
              <p className="text-[11px] font-sans text-[#A89F91] mt-0.5">Every piece is checked before it is packed.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#14120F] p-5 rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1714] border border-[#C9A25D]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF7F2]">Honest Descriptions</h4>
              <p className="text-[11px] font-sans text-[#A89F91] mt-0.5">All our jewellery is artificial (imitation) jewellery.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#14120F] p-5 rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1714] border border-[#C9A25D]/30 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF7F2]">Cash on Delivery</h4>
              <p className="text-[11px] font-sans text-[#A89F91] mt-0.5">Pay the courier when your parcel arrives.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#14120F] p-5 rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1714] border border-[#C9A25D]/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#FAF7F2]">Easy Exchange</h4>
              <p className="text-[11px] font-sans text-[#A89F91] mt-0.5">Damaged or wrong item? We will exchange it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
