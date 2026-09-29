import React, { useState, useRef, useEffect } from 'react';
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
  Phone, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  onSelectCategory?: (categorySlug: string) => void;
  activeCategory?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSelectCategory, activeCategory }) => {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter products for search preview
  const searchResults: Product[] = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.details.stone && p.details.stone.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    setIsMobileMenuOpen(false);
    // Smooth scroll to products section
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE3D8] transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#1C1815] text-[#E6D4AF] py-2 px-4 text-xs font-sans tracking-widest text-center flex items-center justify-between border-b border-[#C9A25D]/20">
        <div className="hidden md:flex items-center gap-2 text-stone-300">
          <Phone className="w-3.5 h-3.5 text-[#C9A25D]" />
          <span>Boutique Concierge: {settings.phone}</span>
        </div>
        <div className="mx-auto flex items-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A25D] animate-pulse" />
          <span>{settings.announcementText}</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-stone-300">
          <button 
            onClick={() => openTracking()} 
            className="hover:text-[#C9A25D] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-[#C9A25D]" />
            <span>Track Order</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-[#2C2420] hover:text-[#C9A25D] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <a href="#" className="inline-block group text-center">
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#1C1815] group-hover:text-[#C9A25D] transition-colors block">
                {settings.brandName.toUpperCase()}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8C7662] block -mt-1 font-sans">
                {settings.tagline}
              </span>
            </a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solitaires, emeralds, 18K gold..."
                className="w-full bg-[#F3EFEA] border border-[#E2DAD0] rounded-full py-2 pl-10 pr-4 text-sm text-[#2C2420] placeholder-[#8C7662] focus:outline-none focus:border-[#C9A25D] focus:bg-white transition-all font-sans"
              />
              <Search className="w-4 h-4 text-[#8C7662] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-[#EAE3D8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-[#F3EFEA] bg-[#FAF8F5] text-xs font-medium text-[#8C7662]">
                  Matching Fine Jewellery ({searchResults.length})
                </div>
                <div className="divide-y divide-[#F3EFEA]">
                  {searchResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        openProductDetails(prod);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-[#FDFBF7] flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 object-cover rounded-md border border-[#EAE3D8]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif font-medium text-[#1C1815] truncate">{prod.name}</p>
                        <p className="text-xs text-[#8C7662] capitalize">{prod.category} • {prod.details.metal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#1C1815]">${prod.price.toLocaleString()}</p>
                        {prod.originalPrice > prod.price && (
                          <p className="text-xs line-through text-stone-400">${prod.originalPrice.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#2C2420] hover:text-[#C9A25D] md:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={openAdmin}
              className={`relative p-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-sans font-medium ${
                isAdmin 
                  ? 'bg-[#1C1815] text-[#E6D4AF] hover:bg-[#C9A25D] hover:text-[#1C1815] px-3' 
                  : 'text-[#8C7662] hover:text-[#1C1815]'
              }`}
              title="Store Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
              <span className="hidden sm:inline">Admin</span>
              {adminNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {adminNotifications.length}
                </span>
              )}
            </button>

            {/* Customer Account / Profile */}
            <button
              onClick={openAccount}
              className="p-2 text-[#2C2420] hover:text-[#C9A25D] transition-colors relative"
              aria-label="Account"
              title="Customer Account & Orders"
            >
              <UserIcon className="w-5 h-5" />
              {user && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="p-2 text-[#2C2420] hover:text-[#C9A25D] transition-colors relative"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A25D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon */}
            <button
              onClick={openCart}
              className="p-2.5 bg-[#1C1815] text-[#FAF8F5] hover:bg-[#C9A25D] hover:text-[#1C1815] rounded-full transition-all duration-300 relative shadow-md flex items-center justify-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartSummary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A25D] text-[#1C1815] border-2 border-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartSummary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expandable */}
        {isSearchOpen && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fine jewellery..."
                className="w-full bg-[#F3EFEA] border border-[#E2DAD0] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#2C2420] focus:outline-none focus:border-[#C9A25D]"
              />
              <Search className="w-4 h-4 text-[#8C7662] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg shadow-xl border border-[#EAE3D8] divide-y divide-[#F3EFEA]">
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      openProductDetails(prod);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-3 flex items-center gap-3 cursor-pointer"
                  >
                    <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-xs font-serif font-medium truncate">{prod.name}</p>
                      <p className="text-xs text-[#C9A25D] font-medium">${prod.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Categories Row (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 py-3 border-t border-[#EAE3D8]/60 text-xs font-sans font-medium tracking-widest uppercase">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`transition-colors py-1 cursor-pointer border-b-2 ${
              activeCategory === 'all' || !activeCategory
                ? 'text-[#C9A25D] border-[#C9A25D] font-semibold'
                : 'text-[#4A3E38] border-transparent hover:text-[#C9A25D]'
            }`}
          >
            All Collections
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`transition-colors py-1 cursor-pointer border-b-2 ${
                activeCategory === cat.slug
                  ? 'text-[#C9A25D] border-[#C9A25D] font-semibold'
                  : 'text-[#4A3E38] border-transparent hover:text-[#C9A25D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => handleCategoryClick('new-arrivals')}
            className={`transition-colors py-1 cursor-pointer border-b-2 ${
              activeCategory === 'new-arrivals'
                ? 'text-[#C9A25D] border-[#C9A25D] font-semibold'
                : 'text-[#4A3E38] border-transparent hover:text-[#C9A25D]'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => handleCategoryClick('sale')}
            className={`transition-colors py-1 cursor-pointer border-b-2 ${
              activeCategory === 'sale'
                ? 'text-rose-700 border-rose-700 font-semibold'
                : 'text-rose-800 border-transparent hover:text-rose-600'
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
            <div className="text-xs uppercase tracking-widest text-[#8C7662] font-semibold pb-2 border-b border-[#EAE3D8]">
              Browse Categories
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCategoryClick('all')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#1C1815]"
              >
                All Collections
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#1C1815]"
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => handleCategoryClick('new-arrivals')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-[#C9A25D]"
              >
                New Arrivals
              </button>
              <button
                onClick={() => handleCategoryClick('sale')}
                className="text-left px-3 py-2.5 rounded-lg bg-[#F3EFEA] hover:bg-[#EAE3D8] text-sm font-serif font-medium text-rose-700"
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
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#2C2420] hover:bg-[#F3EFEA] rounded-lg"
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
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#2C2420] hover:bg-[#F3EFEA] rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#C9A25D]" />
                  My Customer Account
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  openAdmin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#1C1815] bg-[#EAE3D8]/50 hover:bg-[#EAE3D8] rounded-lg"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
                  Store Admin Panel
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
