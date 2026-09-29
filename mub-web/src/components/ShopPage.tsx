import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
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
import { formatPKR } from '../utils/format';
import { priceSliderBounds } from '../utils/pricing';
import { CatalogStatus, useCatalogBlocked } from './CatalogStatus';

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
  const { products, categories, compareList, openCompareModal, settings } = useStore();
  const priceBounds = useMemo(() => priceSliderBounds(products), [products]);
  const catalogBlocked = useCatalogBlocked();

  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [selectedMetal, setSelectedMetal] = useState<string>('all');
  const [selectedStone, setSelectedStone] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
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
  // Filter choices come from the products actually in the shop.
  const uniqueValues = (values: (string | undefined)[]) =>
    ['all', ...Array.from(new Set(values.map(v => (v || '').trim()).filter(Boolean))).sort()];
  const metals = useMemo(() => uniqueValues(products.map(p => p.details.metal)), [products]);
  const stones = useMemo(() => uniqueValues(products.map(p => p.details.stone)), [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list: Product[] = [...products];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'new-arrivals') {
        list = list.filter(p => p.isNewArrival);
      } else if (selectedCategory === 'sale') {
        list = list.filter(p => p.discountPercentage > 0);
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
      list = list.filter(p => p.details.metal.toLowerCase().includes(selectedMetal.toLowerCase()));
    }

    // Filter by Stone
    if (selectedStone !== 'all') {
      list = list.filter(p => p.details.stone && p.details.stone.toLowerCase().includes(selectedStone.toLowerCase()));
    }

    // Filter by Price
    if (maxPrice !== null) list = list.filter(p => p.price <= maxPrice);

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
    maxPrice !== null || 
    onlyInStock || 
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    onSelectCategory('all');
    setSelectedMetal('all');
    setSelectedStone('all');
    setMaxPrice(null);
    setOnlyInStock(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Editorial Page Header */}
      <div className="relative bg-[#1A1513] text-[#FAF8F5] py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#C9A25D]/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C9A25D_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-4 tracking-wider uppercase">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#C9A25D] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[#C9A25D] font-medium">Boutique Shop</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                <span className="capitalize text-stone-300">{selectedCategory.replace('-', ' ')}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#C9A25D] text-xs font-sans uppercase tracking-[0.25em] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{settings.tagline}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
                Shop {settings.brandName}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-2xl font-sans leading-relaxed">
                {settings.aboutText}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 px-5 backdrop-blur-xs text-xs font-sans">
              <div>
                <span className="block font-serif text-lg text-[#C9A25D] font-semibold">{products.length}</span>
                <span className="text-stone-400 text-[10px] tracking-widest uppercase">Designs</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="block font-serif text-lg text-white font-semibold">COD</span>
                <span className="text-stone-400 text-[10px] tracking-widest uppercase">Pay on delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-[#EAE3D8]">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1C1815] text-[#FAF8F5] shadow-md'
                : 'bg-white text-[#4A3E38] border border-[#EAE3D8] hover:border-[#C9A25D]'
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
                  ? 'bg-[#1C1815] text-[#FAF8F5] shadow-md'
                  : 'bg-white text-[#4A3E38] border border-[#EAE3D8] hover:border-[#C9A25D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => onSelectCategory('new-arrivals')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'new-arrivals'
                ? 'bg-[#1C1815] text-[#FAF8F5] shadow-md'
                : 'bg-white text-[#4A3E38] border border-[#EAE3D8] hover:border-[#C9A25D]'
            }`}
          >
            ✨ New Arrivals
          </button>
          <button
            onClick={() => onSelectCategory('sale')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'sale'
                ? 'bg-rose-900 text-white shadow-md'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:border-rose-400'
            }`}
          >
            Special Offers %
          </button>
          <button
            onClick={() => onSelectCategory('exclusives')}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'exclusives'
                ? 'bg-gradient-to-r from-[#1C1815] to-[#2B231C] text-[#E6D4AF] shadow-md border border-[#C9A25D]/50'
                : 'bg-white text-[#8C7662] border border-[#C9A25D]/40 hover:border-[#C9A25D]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#C9A25D]" />
            <span>Exclusives</span>
          </button>
        </div>

        {/* Toolbar: Search, Filters toggle, Sorting, Count */}
        <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE3D8]">
          {/* Search within shop */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by jewellery name, metal, or gemstone..."
              className="w-full bg-white border border-[#EAE3D8] rounded-full py-2.5 pl-10 pr-8 text-xs font-sans text-[#1C1815] placeholder-stone-400 focus:outline-none focus:border-[#C9A25D] shadow-2xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
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
                  ? 'bg-[#1C1815] text-[#FAF8F5] border-[#1C1815]'
                  : 'bg-white text-[#2C2420] border-[#EAE3D8] hover:border-[#C9A25D]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A25D]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#C9A25D]" />
              )}
            </button>

            {/* Compare Button */}
            <button
              onClick={openCompareModal}
              className={`px-4 py-2.5 rounded-full border text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                compareList.length > 0
                  ? 'bg-[#1C1815] text-[#FAF8F5] border-[#C9A25D]'
                  : 'bg-white text-[#2C2420] border-[#EAE3D8] hover:border-[#C9A25D]'
              }`}
              title="Compare selected fine jewellery pieces side by side"
            >
              <Scale className="w-3.5 h-3.5 text-[#C9A25D]" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C9A25D] text-[#1C1815] text-[10px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-white border border-[#EAE3D8] rounded-full px-3 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-sans font-medium text-[#2C2420] focus:outline-none cursor-pointer py-1 pr-2"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Additions</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Largest Privilege %</option>
              </select>
            </div>

            <span className="text-xs font-sans text-stone-500 hidden sm:inline">
              Showing <strong className="text-[#1C1815]">{filteredProducts.length}</strong> items
            </span>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="p-6 my-6 bg-white rounded-3xl border border-[#EAE3D8] shadow-sm animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3EFEA]">
              <h3 className="font-serif text-lg font-medium text-[#1C1815] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C9A25D]" />
                Filter
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-sans text-[#C9A25D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              {/* Metal Selection */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-[#8C7662] font-semibold mb-2">
                  Metal / Material
                </label>
                <select
                  value={selectedMetal}
                  onChange={(e) => setSelectedMetal(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl p-2.5 text-xs font-sans text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                >
                  <option value="all">All</option>
                  {metals.filter(m => m !== 'all').map(metal => (
                    <option key={metal} value={metal}>{metal}</option>
                  ))}
                </select>
              </div>

              {/* Gemstone Selection */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-[#8C7662] font-semibold mb-2">
                  Stones
                </label>
                <select
                  value={selectedStone}
                  onChange={(e) => setSelectedStone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl p-2.5 text-xs font-sans text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                >
                  <option value="all">All</option>
                  {stones.filter(s => s !== 'all').map(stone => (
                    <option key={stone} value={stone}>{stone}</option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-sans uppercase tracking-widest text-[#8C7662] font-semibold mb-2">
                  <span>Price Range</span>
                  <span className="text-[#1C1815] font-serif font-bold">{maxPrice === null ? 'Any' : formatPKR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={priceBounds.max}
                  step={priceBounds.step}
                  value={maxPrice ?? priceBounds.max}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxPrice(v >= priceBounds.max ? null : v);
                  }}
                  className="w-full accent-[#C9A25D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-sans mt-1">
                  <span>{formatPKR(0)}</span>
                  <span>{formatPKR(priceBounds.max)}+</span>
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE3D8] hover:border-[#C9A25D] transition-colors">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded accent-[#C9A25D] w-4 h-4"
                  />
                  <span className="text-xs font-sans text-[#1C1815] font-medium">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans text-stone-700 capitalize">
                Category: {selectedCategory}
                <button onClick={() => onSelectCategory('all')} className="hover:text-stone-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMetal !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans text-stone-700">
                Metal: {selectedMetal}
                <button onClick={() => setSelectedMetal('all')} className="hover:text-stone-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStone !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans text-stone-700">
                Stone: {selectedStone}
                <button onClick={() => setSelectedStone('all')} className="hover:text-stone-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans text-stone-700">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-stone-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-sans text-[#C9A25D] hover:underline ml-2 cursor-pointer font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Product Grid */}
        {catalogBlocked ? (
          <CatalogStatus />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3D8] p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FAF6ED] border border-[#C9A25D]/40 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#C9A25D]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1C1815]">No jewellery creations match</h3>
            <p className="mt-2 text-xs font-sans text-stone-500 leading-relaxed">
              We couldn't find any creations matching your selected filter criteria. Try adjusting your filters or price limit.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Trust points (editable in Admin > Settings) */}
        {settings.highlights.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#EAE3D8] grid grid-cols-1 sm:grid-cols-3 gap-6">
            {settings.highlights.map((text, i) => {
              const Icon = [Truck, ShieldCheck, Award][i % 3];
              return (
                <div key={text} className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-[#EAE3D8]">
                  <div className="w-10 h-10 rounded-full bg-[#FAF6ED] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#C9A25D]" />
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[#1C1815]">{text}</h4>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
