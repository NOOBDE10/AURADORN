import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { SmoothScrollProvider, useSmoothScroll } from './providers/SmoothScrollProvider';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryList } from './components/CategoryList';
import { ProductGrid } from './components/ProductGrid';
import { VaultDealsSection } from './components/VaultDealsSection';
import { ShopPage } from './components/ShopPage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppConcierge } from './components/WhatsAppConcierge';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { ToastContainer } from './components/ToastContainer';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ProductCompareBar } from './components/ProductCompareBar';
import { Footer } from './components/Footer';
import { RevealOnScroll } from './hooks/useScrollReveal';
import { Order } from './types';
import { motion, AnimatePresence } from 'motion/react';

export function MainStore() {
  const [currentView, setCurrentView] = useState<'home' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const { scrollTo } = useSmoothScroll();

  const navigateToShop = (categorySlug: string = 'all') => {
    setSelectedCategory(categorySlug);
    setCurrentView('shop');
    scrollTo(0, { duration: 1.2 });
  };

  const navigateToHome = () => {
    setCurrentView('home');
    scrollTo(0, { duration: 1.2 });
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentView('shop');
    scrollTo(0, { duration: 1.2 });
  };

  return (
    <div className="min-h-screen bg-[#0B0A08] text-[#FAF7F2] flex flex-col font-sans selection:bg-[#C9A25D] selection:text-[#0B0A08]">
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

      {/* Main Luxury Experience: Animated Cross-fade between Home and Dedicated Boutique Shop */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Editorial Hero Banner */}
              <HeroSection onShopNow={() => navigateToShop('all')} />

              {/* Categories Showcase with Subtle Scroll Reveal */}
              <RevealOnScroll direction="up">
                <CategoryList
                  onSelectCategory={handleCategorySelect}
                  activeCategory={selectedCategory}
                />
              </RevealOnScroll>

              {/* Deals */}
              <RevealOnScroll direction="up" delay={60}>
                <VaultDealsSection onNavigateToShop={navigateToShop} />
              </RevealOnScroll>

              {/* Curated Highlights with Direct Link to Shop */}
              <RevealOnScroll direction="up" delay={80}>
                <div className="py-16 bg-[#12100E] border-y border-[#C9A25D]/25 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A25D]/10 via-transparent to-transparent pointer-events-none" />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#E5C378] font-semibold font-sans">
                      Our Collection
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">
                      Featured Jewellery
                    </h2>
                    <p className="text-xs sm:text-sm font-sans text-[#A89F91] max-w-xl mx-auto">
                      Beautiful artificial jewellery for every occasion, with Cash on Delivery all over Pakistan.
                    </p>
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigateToShop('all')}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_4px_20px_rgba(201,162,93,0.3)] hover:brightness-110 transition-all duration-300 cursor-pointer"
                      >
                        <span>Shop All Jewellery</span>
                        <span className="text-lg leading-none">→</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Product Grid on Home with real-time search support */}
              <RevealOnScroll direction="up" delay={120}>
                <ProductGrid
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />
              </RevealOnScroll>
            </motion.div>
          ) : (
            /* Dedicated Separate Shop Page with fluid smooth motion */
            <motion.div
              key="shop-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <ShopPage
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onNavigateHome={navigateToHome}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
      <SmoothScrollProvider>
        <MainStore />
      </SmoothScrollProvider>
    </StoreProvider>
  );
}
