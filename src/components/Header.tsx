import React, { useState, useEffect } from 'react';
import { useShop, AppView } from '../context/ShopContext';
import { Search, Heart, ShoppingBag, Menu, X, User } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const {
    settings,
    cart,
    wishlist,
    setIsCartOpen,
    currentView,
    navigateTo,
    currentUser,
    isAdminLoggedIn,
    setIsAuthModalOpen,
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNav = (view: AppView) => {
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (isAdminLoggedIn) {
      navigateTo('admin');
    } else if (currentUser) {
      navigateTo('account');
    } else {
      setIsAuthModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.isAnnouncementActive && (
        <div className="w-full bg-gradient-to-r from-[#805F19] via-[#D4AF37] to-[#805F19] text-[#0A0A0A] py-1.5 px-4 text-center text-xs md:text-sm font-semibold tracking-widest uppercase transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{settings.announcementText}</span>
            <span className="hidden md:inline text-black/50">•</span>
            <span className="hidden md:inline font-normal text-xs text-black/85">
              Complimentary White-Glove Delivery Across Pakistan on Orders Above PKR {settings.freeShippingThreshold.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#050505]/95 backdrop-blur-md border-b border-[#C5A059]/30 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
            : 'bg-[#050505] border-b border-[#C5A059]/20 py-4 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#C5A059] p-2 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo - MS. with custom logo image on left */}
            <div className="flex items-center">
              <button
                onClick={() => handleNav('home')}
                className="text-left group flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-[1.02]"
              >
                {/* Left Logo Emblem / User Custom Logo */}
                {settings.logoUrl ? (
                  <div className="relative">
                    <img
                      src={settings.logoUrl}
                      alt={settings.brandName || 'Logo'}
                      className="w-9 h-9 md:w-11 md:h-11 object-contain rounded-xs border border-[#D4AF37]/60 p-0.5 bg-black/80 shadow-[0_0_15px_rgba(212,175,55,0.35)] group-hover:border-[#F3E5AB] transition-all"
                    />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border border-black" />
                  </div>
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xs bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#805F19] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
                    <div className="w-full h-full bg-[#0A0A0A] rounded-xs flex items-center justify-center">
                      <span className="text-xs md:text-sm font-serif-luxury font-black text-gold-gradient tracking-tighter">
                        MS
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury font-bold tracking-tight text-gold-gradient group-hover:opacity-95 transition-opacity">
                      {settings.brandName || 'MS.'}
                    </span>
                    <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.25em] text-[#C5A059]/80 font-medium ml-1">
                      Haute Couture
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Clean Desktop Navigation Links (Admin Panel removed from public view as requested!) */}
            <nav className="hidden md:flex items-center justify-center space-x-1 lg:space-x-3 bg-[#111111]/80 backdrop-blur-sm border border-[#C5A059]/30 rounded-full px-6 py-2 shadow-inner">
              <button
                onClick={() => handleNav('home')}
                className={`px-5 py-1.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 rounded-full ${
                  currentView === 'home'
                    ? 'text-black bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'text-[#E5E5E5] hover:text-[#D4AF37]'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => handleNav('shop')}
                className={`px-5 py-1.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 rounded-full ${
                  currentView === 'shop'
                    ? 'text-black bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'text-[#E5E5E5] hover:text-[#D4AF37]'
                }`}
              >
                Shop All
              </button>

              <button
                onClick={() => handleNav('track-order')}
                className={`px-5 py-1.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 rounded-full ${
                  currentView === 'track-order'
                    ? 'text-black bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'text-[#E5E5E5] hover:text-[#D4AF37]'
                }`}
              >
                Track Order
              </button>
            </nav>

            {/* Right Action Icons: Search, Wishlist, Account (Portal), Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onOpenSearch}
                className="text-[#C5A059] hover:text-white p-2 transition-colors relative"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleNav('wishlist')}
                className="text-[#C5A059] hover:text-white p-2 transition-colors relative"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-[#D4AF37] text-black text-[10px] font-bold rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Account Portal Icon (Unified Access for Customers and Admin) */}
              <button
                onClick={handleAccountClick}
                className={`p-2 transition-colors relative rounded-full ${
                  isAdminLoggedIn
                    ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                    : currentUser
                    ? 'text-emerald-400'
                    : 'text-[#C5A059] hover:text-white'
                }`}
                aria-label="Account Portal"
                title={isAdminLoggedIn ? "Administrator Panel" : currentUser ? `Account (${currentUser.name})` : "Client Sign In"}
              >
                <User className="w-5 h-5" />
                {(currentUser || isAdminLoggedIn) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C5A059]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white bg-[#141414]/90 transition-all duration-200"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <span className="hidden sm:inline text-xs font-medium tracking-wider uppercase text-white/90">
                  Bag
                </span>
                {totalCartCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-black text-xs font-bold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0A] border-b border-[#C5A059]/30 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleNav('home')}
                className={`text-left text-sm uppercase tracking-widest py-2 border-b border-stone-800 ${
                  currentView === 'home' ? 'text-[#D4AF37] font-bold' : 'text-stone-300'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => handleNav('shop')}
                className={`text-left text-sm uppercase tracking-widest py-2 border-b border-stone-800 ${
                  currentView === 'shop' ? 'text-[#D4AF37] font-bold' : 'text-stone-300'
                }`}
              >
                Shop All Collections
              </button>

              <button
                onClick={() => handleNav('track-order')}
                className={`text-left text-sm uppercase tracking-widest py-2 border-b border-stone-800 ${
                  currentView === 'track-order' ? 'text-[#D4AF37] font-bold' : 'text-stone-300'
                }`}
              >
                Track Order
              </button>

              <button
                onClick={() => handleNav('wishlist')}
                className={`text-left text-sm uppercase tracking-widest py-2 border-b border-stone-800 ${
                  currentView === 'wishlist' ? 'text-[#D4AF37] font-bold' : 'text-stone-300'
                }`}
              >
                Wishlist ({wishlist.length})
              </button>

              <button
                onClick={handleAccountClick}
                className="text-left text-sm uppercase tracking-widest py-2 text-[#D4AF37] font-semibold flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{isAdminLoggedIn ? 'Admin Operations' : currentUser ? `My Account (${currentUser.name})` : 'Client Sign In'}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
