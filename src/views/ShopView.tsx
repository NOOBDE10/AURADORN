import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, Check, X, RotateCcw } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, navigateTo } = useShop();

  // Filter States
  const [selectedGender, setSelectedGender] = useState<'all' | 'women' | 'men' | 'child'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(75000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bestseller' | 'rating'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available Filter Options
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3-4Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y', '30', '32', '34', '36', '38', '38R', '40R', '42R', '44R'];
  const allColors = [
    { name: 'Black', hex: '#0B0B0B' },
    { name: 'Gold Accent', hex: '#D4AF37' },
    { name: 'Charcoal', hex: '#262626' },
    { name: 'Ivory White', hex: '#F5F5F0' },
  ];
  const allCategories = [
    'all',
    'Blazers & Jackets',
    'Dresses',
    'Tops & Shirts',
    'Suits & Tuxedos',
    'Eastern & Traditional',
    'Kurtis & Eastern',
    'Pants & Denim',
    'T-Shirts & Streetwear',
    'Knitwear',
    'Co-Ord Sets',
    'Skirts',
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender && p.gender !== 'unisex') {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && p.subcategory !== selectedCategory && p.category !== selectedCategory) {
        return false;
      }
      // Price filter
      if (p.price > maxPrice) {
        return false;
      }
      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = p.sizes.some((s) => selectedSizes.includes(s));
        if (!hasSize) return false;
      }
      // Color filter
      if (selectedColors.length > 0) {
        const hasColor = p.colors.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()))
        );
        if (!hasColor) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedGender, selectedCategory, selectedSizes, selectedColors, maxPrice, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedGender('all');
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(75000);
    setSortBy('newest');
  };

  const activeFilterCount =
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (maxPrice < 75000 ? 1 : 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#C5A059]/20 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <button onClick={() => navigateTo('home')} className="hover:text-stone-300">
              Home
            </button>
            <span>/</span>
            <span className="text-[#D4AF37] uppercase tracking-wider font-medium">Shop All</span>
            {selectedGender !== 'all' && (
              <>
                <span>/</span>
                <span className="capitalize">{selectedGender}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
            HAUTE COUTURE CATALOG
          </h1>
        </div>

        {/* Sorting & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-stone-900 border border-[#C5A059]/40 text-xs font-semibold uppercase tracking-wider text-stone-200 rounded-xs"
          >
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          <div className="flex items-center gap-2 bg-[#0D0D0D] border border-stone-800 px-3 py-1.5 rounded-xs">
            <span className="text-xs text-stone-400 uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#111111] text-white">Newest Additions</option>
              <option value="bestseller" className="bg-[#111111] text-white">Best Sellers</option>
              <option value="price-asc" className="bg-[#111111] text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-[#111111] text-white">Price: High to Low</option>
              <option value="rating" className="bg-[#111111] text-white">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Product Grid matching Reference Images 2 & 3) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-8">
        {/* Left Filter Sidebar (Desktop + Mobile) */}
        <div
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 space-y-8 bg-[#0A0A0A] p-5 md:p-0 md:bg-transparent rounded-xs border md:border-none border-[#C5A059]/30`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
            <h3 className="text-sm uppercase tracking-widest font-serif-luxury font-bold text-gold-gradient flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              FILTER
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Gender / Department Filter */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold block">
              Department
            </span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-stone-900/80 rounded-xs border border-stone-800">
              {(['all', 'women', 'men', 'child'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`py-1 text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-colors ${
                    selectedGender === g
                      ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {g === 'child' ? 'Child' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter (Reference Image 2: SIZE with checkboxes) */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold block">
              SIZE
            </span>
            <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {allSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-1.5 px-2 text-xs font-semibold uppercase rounded-xs border transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                        : 'bg-black/60 text-stone-300 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter (Reference Image 2: COLOR with swatches) */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold block">
              COLOR
            </span>
            <div className="space-y-2">
              {allColors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className="w-full flex items-center justify-between text-xs text-stone-300 hover:text-white py-1 px-2 rounded-xs hover:bg-stone-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-xs border border-stone-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider (Reference Image 2: PRICE Slider $250 - $5,000+ -> PKR) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-stone-300 font-semibold">PRICE</span>
              <span className="text-[#D4AF37] font-mono tabular-nums font-semibold">
                Up to PKR {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={75000}
              step={2000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#D4AF37] bg-stone-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>PKR 5,000</span>
              <span>PKR 75,000+</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold block">
              Categories
            </span>
            <div className="space-y-1">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-xs capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Collections' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Area (Matches Reference Images 2 & 3) */}
        <div className="md:col-span-3 lg:col-span-4">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-6">
            <span>
              Showing <strong className="text-white">{filteredProducts.length}</strong> haute couture items
            </span>
            {activeFilterCount > 0 && (
              <span className="text-[#C5A059]">{activeFilterCount} active filters</span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#0D0D0D] border border-stone-800 rounded-xs p-8">
              <p className="text-base text-stone-300 uppercase tracking-widest font-semibold">
                No couture items match your selected filters
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try widening your price range or clearing size and color criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#F3E5AB] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
