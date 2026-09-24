import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryList } from './components/CategoryList';
import { ProductGrid } from './components/ProductGrid';
import { ShopPage } from './components/ShopPage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppConcierge } from './components/WhatsAppConcierge';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { ToastContainer } from './components/ToastContainer';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ProductCompareBar } from './components/ProductCompareBar';
import { Footer } from './components/Footer';
import { RevealOnScroll } from './hooks/useScrollReveal';
import { Order } from './types';

export function MainStore() {
  const [currentView, setCurrentView] = useState<'home' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const navigateToShop = (categorySlug: string = 'all') => {
    setSelectedCategory(categorySlug);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1815] flex flex-col font-sans selection:bg-[#C9A25D] selection:text-white">
      {/* Header with Navigation and Real-Time Search */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home') navigateToHome();
          else navigateToShop('all');
        }}
        onSelectCategory={handleCategorySelect}
        activeCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Luxury Experience: Home vs Dedicated Boutique Shop */}
      <main className="flex-1 transition-opacity duration-300">
        {currentView === 'home' ? (
          <div className="animate-in fade-in duration-300">
            {/* Editorial Hero Banner */}
            <HeroSection onShopNow={() => navigateToShop('all')} />

            {/* Categories Showcase with Subtle Scroll Reveal */}
            <RevealOnScroll direction="up">
              <CategoryList
                onSelectCategory={handleCategorySelect}
                activeCategory={selectedCategory}
              />
            </RevealOnScroll>

            {/* Curated Highlights with Direct Link to Shop */}
            <RevealOnScroll direction="up" delay={100}>
              <div className="py-14 bg-white border-y border-[#EAE3D8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#C9A25D] font-semibold font-sans">
                    The Curated Portfolio
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1815]">
                    Featured Creations from the Vault
                  </h2>
                  <p className="text-xs sm:text-sm font-sans text-[#8C7662] max-w-xl mx-auto">
                    Handcrafted solitaires and certified gold jewellery, hallmarked with lifetime authenticity.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigateToShop('all')}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer active:scale-95"
                    >
                      <span>Explore Complete Boutique Shop</span>
                      <span className="text-lg leading-none">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Product Grid on Home with real-time search support */}
            <RevealOnScroll direction="up" delay={150}>
              <ProductGrid
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            </RevealOnScroll>
          </div>
        ) : (
          /* Dedicated Separate Shop Page with fast, smooth transition */
          <div className="animate-in fade-in duration-300">
            <ShopPage
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onNavigateHome={navigateToHome}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleCategorySelect} />

      {/* Modals & Drawers */}
      <ProductDetailsModal />
      <QuickViewModal />
      <ProductComparisonModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal onOrderSuccess={(order) => setCompletedOrder(order)} />
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
      <OrderTrackingModal />
      <CustomerAccountModal />
      <AdminDashboard />

      {/* Floating Concierge, Comparison Bar & Notifications */}
      <ProductCompareBar />
      <WhatsAppConcierge />
      <PWAInstallBanner />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainStore />
    </StoreProvider>
  );
}
