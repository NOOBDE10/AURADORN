import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './SkeletonLoader';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Crown } from 'lucide-react';
import { Product } from '../types';
import { getProductLoyaltyTier } from './LoyaltyBadge';

interface ProductGridProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  selectedCategory, 
  onSelectCategory,
  searchQuery = '',
  onClearSearch
}) => {
  const { products, categories, isLoading } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest' | 'rating' | 'discount'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = no price limit
  const priceCeiling = useMemo(
    () => Math.max(1000, Math.ceil(Math.max(0, ...products.map(p => p.price)) / 500) * 500),
    [products]
  );
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  // Computed filtered & sorted products in real-time
  const filteredProducts = useMemo(() => {
    let list: Product[] = [...products];

    // Filter by Real-time Search Query
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

    // Filter by Price
    if (maxPrice > 0) list = list.filter(p => p.price <= maxPrice);

    // Filter by Stock
    if (onlyInStock) {
      list = list.filter(p => p.stock > 0 && p.status === 'active');
    }

    // Sorting
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
  }, [products, searchQuery, selectedCategory, maxPrice, onlyInStock, sortBy]);

  return (
    <section id="products-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Section Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#241F1A] gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E5C378] text-xs font-sans uppercase tracking-[0.25em] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Collection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2] font-normal tracking-tight">
            {selectedCategory === 'all' || !selectedCategory
              ? 'All Jewellery'
              : selectedCategory === 'new-arrivals'
              ? 'New Arrival Masterpieces'
              : selectedCategory === 'sale'
              ? 'Exclusive Privileges & Discounts'
              : selectedCategory === 'exclusives'
              ? 'Featured'
              : selectedCategory === 'best-sellers'
              ? 'Signature Best Sellers'
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Portfolio`}
          </h2>
          {searchQuery && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[#A89F91]">
                Filtered in real-time by: <span className="font-semibold text-[#E5C378]">"{searchQuery}"</span> ({filteredProducts.length} pieces)
              </span>
              {onClearSearch && (
                <button 
                  onClick={onClearSearch}
                  className="text-xs text-[#E5C378] hover:underline font-medium cursor-pointer ml-1"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter and Sort controls */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`px-4 py-2 rounded-full border text-xs font-sans font-medium flex items-center gap-2 transition-colors cursor-pointer ${
              filterDrawerOpen 
                ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold border-[#E5C378]' 
                : 'bg-[#14120F] text-[#FAF7F2] border-[#2E2822] hover:border-[#C9A25D]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>Refine ({filteredProducts.length})</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-[#14120F] border border-[#2E2822] rounded-full px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#A89F91] mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-sans font-medium text-[#FAF7F2] bg-transparent focus:outline-none cursor-pointer pr-2"
            >
              <option value="featured" className="bg-[#14120F] text-[#FAF7F2]">Featured & Curated</option>
              <option value="price-low" className="bg-[#14120F] text-[#FAF7F2]">Price: Low to High</option>
              <option value="price-high" className="bg-[#14120F] text-[#FAF7F2]">Price: High to Low</option>
              <option value="newest" className="bg-[#14120F] text-[#FAF7F2]">Newest Additions</option>
              <option value="rating" className="bg-[#14120F] text-[#FAF7F2]">Highest Rated</option>
              <option value="discount" className="bg-[#14120F] text-[#FAF7F2]">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Drawer / Accordion */}
      {filterDrawerOpen && (
        <div className="mb-8 p-6 bg-[#14120F] border border-[#C9A25D]/30 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#241F1A]">
            <h3 className="font-serif text-lg font-medium text-[#FAF7F2]">Filter Collection</h3>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="text-stone-400 hover:text-[#E5C378] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Category Quick Filter */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#E5C378] font-semibold mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onSelectCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans transition-colors cursor-pointer ${
                    selectedCategory === 'all' || !selectedCategory
                      ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold'
                      : 'bg-[#181613] text-[#D8CDC0] hover:bg-[#221E19] border border-[#2E2822]'
                  }`}
                >
                  All
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-colors cursor-pointer ${
                      selectedCategory === c.slug
                        ? 'bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold'
                        : 'bg-[#181613] text-[#D8CDC0] hover:bg-[#221E19] border border-[#2E2822]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-widest text-[#E5C378] font-semibold">
                  Max Budget
                </label>
                <span className="text-sm font-serif font-semibold text-[#E5C378]">
                  {maxPrice > 0 ? formatPrice(maxPrice) : 'Any'}
                </span>
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
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>Rs 0</span>
                <span>{formatPrice(priceCeiling)}</span>
              </div>
            </div>

            {/* In-Stock Only */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#C9A25D] rounded"
                />
                <span className="text-xs font-sans font-medium text-[#FAF7F2]">
                  In stock only
                </span>
              </label>
              <p className="text-[11px] text-[#8C8275] mt-1 pl-7">
                Hide items that are sold out.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={`skeleton-${idx}`} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-[#14120F] rounded-3xl border border-[#C9A25D]/30 p-8 max-w-md mx-auto shadow-2xl">
          <Sparkles className="w-8 h-8 text-[#E5C378] mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#FAF7F2] mb-2">{products.length === 0 ? 'New collection coming soon' : 'No matching items found'}</h3>
          <p className="text-xs font-sans text-[#A89F91] mb-6">
            Try adjusting your price range or explore all categories.
          </p>
          <button
            onClick={() => {
              onSelectCategory('all');
              setMaxPrice(0);
              setOnlyInStock(false);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] text-xs font-sans font-bold rounded-full uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}
    </section>
  );
};
