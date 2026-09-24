import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X, 
  Truck, 
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  currentView?: 'home' | 'shop';
  onNavigate?: (view: 'home' | 'shop') => void;
  onSelectCategory?: (categorySlug: string) => void;
  activeCategory?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView = 'home', 
  onNavigate, 
  onSelectCategory, 
  activeCategory,
  searchQuery: externalSearchQuery,
  onSearchChange
}) => {
  const { 
    settings, 
    cartSummary, 
    wishlist, 
    user, 
    isAdmin, 
    adminNotifications,
    products, 
    categories,
    openCart, 
    openWishlist, 
    openAccount, 
    openAdmin, 
    openTracking,
    openProductDetails
  } = useStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(externalSearchQuery || '');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);

  // Sync external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setLocalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Smooth scroll tracking for sticky header transformation
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 25);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile input on open
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      const timer = setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Real-time filtering by Name or Category
  const { searchResults, matchedCategories, totalMatches } = useMemo(() => {
    const query = localSearchQuery.trim().toLowerCase();
    const catFilter = selectedSearchCategory.toLowerCase();

    if (!query && catFilter === 'all') {
      return { searchResults: [], matchedCategories: [], totalMatches: 0 };
    }

    // Filter products in real-time
    const filtered = products.filter(p => {
      // Category match
      const matchesCategory = 
        catFilter === 'all' || 
        p.category.toLowerCase() === catFilter ||
        (catFilter === 'new-arrivals' && p.isNewArrival) ||
        (catFilter === 'sale' && p.discountPercentage > 0) ||
        (catFilter === 'best-sellers' && p.isBestSeller);

      if (!matchesCategory) return false;

      // Query match (checks name, category, stone, metal, subcategory)
      if (!query) return true;

      return (
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(query)) ||
        (p.details.stone && p.details.stone.toLowerCase().includes(query)) ||
        (p.details.metal && p.details.metal.toLowerCase().includes(query))
      );
    });

    // Find matched categories based on query
    const matchedCats = query ? categories.filter(c => 
      c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
    ) : [];

    return {
      searchResults: filtered.slice(0, 6),
      matchedCategories: matchedCats,
      totalMatches: filtered.length
    };
  }, [localSearchQuery, selectedSearchCategory, products, categories]);

  const handleSearchChange = (val: string) => {
    setLocalSearchQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleExecuteFullSearch = (query: string = localSearchQuery, category: string = selectedSearchCategory) => {
    if (onSelectCategory && category !== 'all') {
      onSelectCategory(category);
    }
    if (onSearchChange) {
      onSearchChange(query);
    }
    if (onNavigate) {
      onNavigate('shop');
    }
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: 'home' | 'shop', categorySlug?: string) => {
    if (categorySlug && onSelectCategory) {
      onSelectCategory(categorySlug);
    }
    if (onNavigate) {
      onNavigate(view);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSelectedSearchCategory('all');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FAF8F5]/98 backdrop-blur-md shadow-md border-b border-[#EAE3D8]' 
          : 'bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#EAE3D8]'
      }`}
    >
      {/* Top Announcement Bar - Haute Joaillerie & Code AURA */}
      <div className="bg-[#1C1815] text-[#E6D4AF] py-2 px-4 text-xs font-sans tracking-widest text-center flex items-center justify-between border-b border-[#C9A25D]/20 transition-colors">
        <div className="hidden md:flex items-center gap-2 text-stone-300">
          <span className="text-[#C9A25D] text-[10px] tracking-widest uppercase font-semibold">Haute Joaillerie</span>
          <span className="text-stone-600">·</span>
          <span className="text-[11px] text-stone-400">Pure 18K & 22K Solid Gold</span>
        </div>
        <div className="mx-auto flex items-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A25D] animate-pulse" />
          <span>{settings.announcementText || '✨ Complimentary Insured White-Glove COD | Code: AURA for 10% OFF'}</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-stone-300">
          <button 
            onClick={() => openTracking()} 
            className="hover:text-[#C9A25D] transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-medium"
          >
            <Truck className="w-3.5 h-3.5 text-[#C9A25D]" />
            <span>Track Order</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#2C2420] hover:text-[#C9A25D] hover:bg-[#F3EFEA] focus:outline-none transition-colors active:scale-95 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo - Navigates to Home */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button 
              onClick={() => handleNavClick('home')} 
              className="inline-block group text-center lg:text-left cursor-pointer transition-transform duration-300 active:scale-[0.98]"
            >
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#1C1815] group-hover:text-[#C9A25D] transition-colors block">
                {settings.brandName.toUpperCase()}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8C7662] block -mt-1 font-sans">
                {settings.tagline}
              </span>
            </button>
          </div>

          {/* Desktop Real-Time Search Bar with Category Filter */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8 relative">
            <div className={`relative w-full flex items-center bg-[#F3EFEA] border rounded-full transition-all duration-300 shadow-xs ${
              isSearchFocused ? 'border-[#C9A25D] bg-white ring-2 ring-[#C9A25D]/20 shadow-md' : 'border-[#E2DAD0] hover:border-[#D8BD86]'
            }`}>
              {/* Category Filter Selector Inside Search Bar */}
              <div className="relative pl-3.5 pr-2 py-1.5 border-r border-[#E2DAD0] flex items-center">
                <select
                  value={selectedSearchCategory}
                  onChange={(e) => setSelectedSearchCategory(e.target.value)}
                  className="bg-transparent text-xs font-sans font-medium text-[#4A3E38] hover:text-[#1C1815] focus:outline-none cursor-pointer pr-4 appearance-none"
                  aria-label="Filter by Category"
                >
                  <option value="all">All Items</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="sale">Special Sale</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#8C7662] absolute right-1 pointer-events-none" />
              </div>

              {/* Real-time Text Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-[#8C7662] absolute left-3 pointer-events-none" />
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleExecuteFullSearch();
                    } else if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder="Filter pieces by name or category in real-time..."
                  className="w-full bg-transparent py-2.5 pl-9 pr-8 text-xs sm:text-sm text-[#2C2420] placeholder-[#8C7662] focus:outline-none font-sans"
                />

                {/* Clear Button */}
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#EAE3D8] transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Real-Time Search Results Dropdown */}
            {isSearchFocused && (localSearchQuery.trim() !== '' || selectedSearchCategory !== 'all') && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#EAE3D8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header summary */}
                <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#F0EAE1] flex items-center justify-between text-xs text-[#8C7662] font-sans">
                  <span>
                    {totalMatches === 0 ? 'No matching pieces found' : `Filtered ${searchResults.length} of ${totalMatches} creations`}
                  </span>
                  {selectedSearchCategory !== 'all' && (
                    <span className="text-[11px] font-medium text-[#C9A25D] capitalize">
                      Category: {selectedSearchCategory}
                    </span>
                  )}
                </div>

                {/* Quick Category Jump Matches */}
                {matchedCategories.length > 0 && (
                  <div className="p-3 bg-[#FCFAF7] border-b border-[#F0EAE1] flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C7662] font-semibold font-sans">
                      Categories:
                    </span>
                    {matchedCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleExecuteFullSearch('', cat.slug)}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#EAE3D8] hover:border-[#C9A25D] hover:bg-[#FDFBF7] text-xs font-serif text-[#1C1815] transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        {cat.name} →
                      </button>
                    ))}
                  </div>
                )}

                {/* Matching Products List */}
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F3EFEA]">
                    {searchResults.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          openProductDetails(prod);
                          setIsSearchFocused(false);
                        }}
                        className="p-3 hover:bg-[#FAF6F0] flex items-center gap-3 cursor-pointer transition-colors duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5EFEB] border border-[#EAE3D8] shrink-0">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-serif font-medium text-[#1C1815] truncate group-hover:text-[#C9A25D] transition-colors">
                            {prod.name}
                          </p>
                          <p className="text-xs text-[#8C7662] capitalize font-sans">
                            {prod.category} · {prod.details.metal} {prod.details.stone ? `· ${prod.details.stone}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-serif font-medium text-[#1C1815]">
                            ${prod.price.toLocaleString()}
                          </p>
                          {prod.originalPrice > prod.price && (
                            <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-sans font-medium">
                              -{prod.discountPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs font-sans text-[#8C7662]">
                    No fine jewellery pieces found matching "{localSearchQuery}". Try searching for solitaires, rings, gold, or diamond.
                  </div>
                )}

                {/* Footer: Explore All Button */}
                {totalMatches > 0 && (
                  <div className="p-3 bg-[#FAF8F5] border-t border-[#F0EAE1]">
                    <button
                      onClick={() => handleExecuteFullSearch()}
                      className="w-full py-2.5 px-4 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] rounded-xl text-xs font-sans font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.98]"
                    >
                      <span>Explore all {totalMatches} pieces in Shop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2.5 text-[#2C2420] hover:text-[#C9A25D] hover:bg-[#F3EFEA] rounded-full transition-colors active:scale-95 md:hidden cursor-pointer"
              aria-label="Toggle Mobile Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Vault Portal Button */}
            {isAdmin && (
              <button
                onClick={openAdmin}
                className="relative p-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-sans font-medium bg-[#1C1815] text-[#E6D4AF] hover:bg-[#C9A25D] hover:text-[#1C1815] px-3 shadow-xs cursor-pointer active:scale-95"
                title="Store Admin Vault Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
                <span className="hidden sm:inline">Vault Admin</span>
                {adminNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                    {adminNotifications.length}
                  </span>
                )}
              </button>
            )}

            {/* Customer Account / Profile */}
            <button
              onClick={openAccount}
              className="p-2.5 text-[#2C2420] hover:text-[#C9A25D] hover:bg-[#F3EFEA] rounded-full transition-all duration-200 relative active:scale-95 cursor-pointer"
              aria-label="Account"
              title="Customer Account & Orders"
            >
              <UserIcon className="w-5 h-5" />
              {user && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="p-2.5 text-[#2C2420] hover:text-[#C9A25D] hover:bg-[#F3EFEA] rounded-full transition-all duration-200 relative active:scale-95 cursor-pointer"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C9A25D] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs animate-in zoom-in duration-200">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon */}
            <button
              onClick={openCart}
              className="p-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-[#C9A25D] hover:text-[#1C1815] rounded-full transition-all duration-300 relative shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartSummary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A25D] text-[#1C1815] border-2 border-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                  {cartSummary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expandable Drawer with Category Selector */}
        {isMobileSearchOpen && (
          <div className="pb-4 pt-1 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <div className="relative flex items-center bg-[#F3EFEA] border border-[#E2DAD0] rounded-full px-3 py-1">
                <Search className="w-4 h-4 text-[#8C7662] mr-2 shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteFullSearch();
                  }}
                  placeholder="Filter pieces by name or category..."
                  className="w-full bg-transparent py-2 text-sm text-[#2C2420] focus:outline-none font-sans"
                />
                {localSearchQuery && (
                  <button 
                    onClick={clearSearch} 
                    className="p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Quick Chips on Mobile */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <button
                  onClick={() => setSelectedSearchCategory('all')}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-sans font-medium transition-all ${
                    selectedSearchCategory === 'all' 
                      ? 'bg-[#1C1815] text-white' 
                      : 'bg-white border border-[#EAE3D8] text-[#4A3E38]'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedSearchCategory(c.slug)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-sans font-medium transition-all ${
                      selectedSearchCategory === c.slug 
                        ? 'bg-[#1C1815] text-white' 
                        : 'bg-white border border-[#EAE3D8] text-[#4A3E38]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Mobile Real-time Results */}
              {(localSearchQuery.trim() !== '' || selectedSearchCategory !== 'all') && (
                <div className="mt-2 bg-white rounded-xl shadow-xl border border-[#EAE3D8] divide-y divide-[#F3EFEA] max-h-72 overflow-y-auto">
                  <div className="p-2.5 bg-[#FAF8F5] text-xs font-sans text-[#8C7662] flex justify-between items-center">
                    <span>Matches: {totalMatches} pieces</span>
                    <button
                      onClick={() => handleExecuteFullSearch()}
                      className="text-[#C9A25D] font-semibold"
                    >
                      View All in Shop →
                    </button>
                  </div>
                  {searchResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        openProductDetails(prod);
                        setIsMobileSearchOpen(false);
                      }}
                      className="p-2.5 flex items-center gap-3 hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-md border border-[#EAE3D8]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-medium text-[#1C1815] truncate">{prod.name}</p>
                        <p className="text-[10px] text-[#8C7662] capitalize">{prod.category} · {prod.details.metal}</p>
                      </div>
                      <span className="text-xs font-medium text-[#1C1815]">${prod.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Categories Row (Desktop) with Smooth Luxury Underline */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 py-3 border-t border-[#EAE3D8]/60 text-xs font-sans font-medium tracking-widest uppercase">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors py-1 cursor-pointer luxury-underline relative ${
              currentView === 'home'
                ? 'text-[#C9A25D] font-semibold after:w-full'
                : 'text-[#4A3E38] hover:text-[#C9A25D]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('shop', 'all')}
            className={`transition-colors py-1 cursor-pointer luxury-underline relative ${
              currentView === 'shop' && (activeCategory === 'all' || !activeCategory)
                ? 'text-[#C9A25D] font-semibold after:w-full'
                : 'text-[#4A3E38] hover:text-[#C9A25D]'
            }`}
          >
            Shop All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleNavClick('shop', cat.slug)}
              className={`transition-colors py-1 cursor-pointer luxury-underline relative ${
                currentView === 'shop' && activeCategory === cat.slug
                  ? 'text-[#C9A25D] font-semibold after:w-full'
                  : 'text-[#4A3E38] hover:text-[#C9A25D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('shop', 'new-arrivals')}
            className={`transition-colors py-1 cursor-pointer luxury-underline relative ${
              currentView === 'shop' && activeCategory === 'new-arrivals'
                ? 'text-[#C9A25D] font-semibold after:w-full'
                : 'text-[#4A3E38] hover:text-[#C9A25D]'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => handleNavClick('shop', 'sale')}
            className={`transition-colors py-1 cursor-pointer luxury-underline relative ${
              currentView === 'shop' && activeCategory === 'sale'
                ? 'text-rose-700 font-semibold after:w-full after:bg-rose-700'
                : 'text-rose-800 hover:text-rose-600'
            }`}
          >
            Special Offers %
          </button>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-[#FAF8F5] border-b border-[#EAE3D8] shadow-2xl z-50 animate-in slide-in-from-top duration-300">
          <div className="px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-sans font-semibold uppercase tracking-wider text-center transition-all cursor-pointer active:scale-95 ${
                  currentView === 'home' ? 'bg-[#1C1815] text-white shadow-xs' : 'bg-white border border-[#EAE3D8] text-[#1C1815]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('shop', 'all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-sans font-semibold uppercase tracking-wider text-center transition-all cursor-pointer active:scale-95 ${
                  currentView === 'shop' ? 'bg-[#1C1815] text-white shadow-xs' : 'bg-white border border-[#EAE3D8] text-[#1C1815]'
                }`}
              >
                Shop Catalog
              </button>
            </div>

            <div className="text-xs uppercase tracking-widest text-[#8C7662] font-semibold pb-2 border-b border-[#EAE3D8]">
              Browse Categories
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('shop', 'all')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#1C1815] cursor-pointer transition-colors active:scale-98"
              >
                All Collections
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick('shop', cat.slug)}
                  className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#1C1815] cursor-pointer transition-colors active:scale-98"
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('shop', 'new-arrivals')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#C9A25D] cursor-pointer transition-colors active:scale-98"
              >
                New Arrivals
              </button>
              <button
                onClick={() => handleNavClick('shop', 'sale')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-rose-700 cursor-pointer transition-colors active:scale-98"
              >
                Sale & Privileges
              </button>
            </div>

            <div className="pt-4 border-t border-[#EAE3D8] space-y-2">
              <button
                onClick={() => {
                  openTracking();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#2C2420] hover:bg-[#F3EFEA] rounded-lg cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C9A25D]" />
                  Track Existing Order
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  openAccount();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#2C2420] hover:bg-[#F3EFEA] rounded-lg cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#C9A25D]" />
                  Sign In / Patron Lounge
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    openAdmin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#1C1815] bg-[#EAE3D8]/50 hover:bg-[#EAE3D8] rounded-lg cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
                    Vault Admin Panel
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
