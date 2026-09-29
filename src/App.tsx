import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams, Navigate, Location } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { SmoothScrollProvider, useSmoothScroll } from './providers/SmoothScrollProvider';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryList } from './components/CategoryList';
import { ProductGrid } from './components/ProductGrid';
import { VaultDealsSection } from './components/VaultDealsSection';
import { ShopPage } from './components/ShopPage';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { WhatsAppConcierge } from './components/WhatsAppConcierge';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { ToastContainer } from './components/ToastContainer';
import { ProductCompareBar } from './components/ProductCompareBar';
import { Footer } from './components/Footer';
import { RouteSync } from './components/RouteSync';
import { RevealOnScroll } from './hooks/useScrollReveal';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { categoryPath } from './lib/urls';
import { Order } from './types';
import { motion } from 'motion/react';

// Loaded on demand: shoppers only download these when they open them.
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CheckoutModal = lazy(() => import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const OrderSuccessModal = lazy(() => import('./components/OrderSuccessModal').then(m => ({ default: m.OrderSuccessModal })));
const OrderTrackingModal = lazy(() => import('./components/OrderTrackingModal').then(m => ({ default: m.OrderTrackingModal })));
const QuickViewModal = lazy(() => import('./components/QuickViewModal').then(m => ({ default: m.QuickViewModal })));
const ProductComparisonModal = lazy(() => import('./components/ProductComparisonModal').then(m => ({ default: m.ProductComparisonModal })));
const PoliciesPage = lazy(() => import('./components/PoliciesPage').then(m => ({ default: m.PoliciesPage })));

const HomePage: React.FC<{ searchQuery: string; onClearSearch: () => void; goToShop: (slug?: string) => void }> = ({
  searchQuery,
  onClearSearch,
  goToShop,
}) => {
  const { settings } = useStore();
  useDocumentMeta({
    title: `${settings.brandName} | Artificial & Bridal Jewellery in Pakistan`,
    description: 'Shop elegant artificial jewellery: necklace sets, jhumkas, bangles, rings and bridal sets. Cash on Delivery all over Pakistan.',
  });
  return (
    <>
      <HeroSection onShopNow={() => goToShop('all')} />
      <RevealOnScroll direction="up">
        <CategoryList onSelectCategory={goToShop} activeCategory="all" />
      </RevealOnScroll>
      <RevealOnScroll direction="up" delay={60}>
        <VaultDealsSection onNavigateToShop={goToShop} />
      </RevealOnScroll>
      <RevealOnScroll direction="up" delay={80}>
        <div className="py-16 bg-[#12100E] border-y border-[#C9A25D]/25 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A25D]/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E5C378] font-semibold font-sans">Our Collection</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">Featured Jewellery</h2>
            <p className="text-xs sm:text-sm font-sans text-[#A89F91] max-w-xl mx-auto">
              Beautiful artificial jewellery for every occasion, with Cash on Delivery all over Pakistan.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => goToShop('all')}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_4px_20px_rgba(201,162,93,0.3)] hover:brightness-110 transition-all duration-300 cursor-pointer"
              >
                <span>Shop All Jewellery</span>
                <span className="text-lg leading-none">→</span>
              </motion.button>
            </div>
          </div>
        </div>
      </RevealOnScroll>
      <RevealOnScroll direction="up" delay={120}>
        <ProductGrid selectedCategory="all" onSelectCategory={goToShop} searchQuery={searchQuery} onClearSearch={onClearSearch} />
      </RevealOnScroll>
    </>
  );
};

const ShopRoute: React.FC<{ searchQuery: string; onSearchChange: (q: string) => void; goToShop: (slug?: string) => void; goHome: () => void }> = ({
  searchQuery,
  onSearchChange,
  goToShop,
  goHome,
}) => {
  const { category } = useParams();
  const { categories, settings } = useStore();
  const slug = category || 'all';
  const cat = categories.find(c => c.slug === slug);
  useDocumentMeta({
    title: cat ? `${cat.name} | ${settings.brandName}` : `Shop All Jewellery | ${settings.brandName}`,
    description: cat?.description
      ? `${cat.description} Cash on Delivery all over Pakistan.`
      : 'Browse all artificial jewellery: necklace sets, earrings, bangles, rings and bridal sets. Cash on Delivery all over Pakistan.',
  });
  return (
    <ShopPage
      selectedCategory={slug}
      onSelectCategory={goToShop}
      onNavigateHome={goHome}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
    />
  );
};

export function MainStore() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const { scrollTo } = useSmoothScroll();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAdminOpen,
    isCheckoutOpen,
    isTrackingOpen,
    quickViewProduct,
    isCompareModalOpen,
  } = useStore();

  const goToShop = (slug: string = 'all') => navigate(categoryPath(slug));
  const goHome = () => navigate('/');

  // While a product is open over another page, keep rendering that page underneath.
  const background = (location.state as { background?: Location } | null)?.background;
  const pageLocation = location.pathname.startsWith('/product/') && background ? background : location;

  // Scroll to top only when the underlying page changes (not when a product opens or closes).
  useEffect(() => {
    if (!location.pathname.startsWith('/product/')) scrollTo(0, { duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLocation.pathname]);

  const shopMatch = pageLocation.pathname.match(/^\/shop(?:\/([^/]+))?/);
  const currentView: 'home' | 'shop' = pageLocation.pathname === '/' ? 'home' : 'shop';

  return (
    <div className="min-h-screen bg-[#0B0A08] text-[#FAF7F2] flex flex-col font-sans selection:bg-[#C9A25D] selection:text-[#0B0A08]">
      <RouteSync />
      <Header
        currentView={currentView}
        onNavigate={view => (view === 'home' ? goHome() : goToShop('all'))}
        onSelectCategory={goToShop}
        activeCategory={shopMatch?.[1] || 'all'}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 relative overflow-hidden">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <Routes location={pageLocation}>
            <Route path="/" element={<HomePage searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} goToShop={goToShop} />} />
            <Route path="/shop" element={<ShopRoute searchQuery={searchQuery} onSearchChange={setSearchQuery} goToShop={goToShop} goHome={goHome} />} />
            <Route path="/shop/:category" element={<ShopRoute searchQuery={searchQuery} onSearchChange={setSearchQuery} goToShop={goToShop} goHome={goHome} />} />
            {/* Product pages render the shop behind the product view */}
            <Route path="/product/*" element={<ShopRoute searchQuery={searchQuery} onSearchChange={setSearchQuery} goToShop={goToShop} goHome={goHome} />} />
            <Route path="/policies" element={<Navigate to="/policies/shipping" replace />} />
            <Route path="/policies/:page" element={<PoliciesPage />} />
            <Route path="/admin" element={<HomePage searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} goToShop={goToShop} />} />
            <Route path="/track" element={<HomePage searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} goToShop={goToShop} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer onSelectCategory={goToShop} />

      <ProductDetailsModal />
      <CartDrawer />
      <WishlistDrawer />

      <Suspense fallback={null}>
        {quickViewProduct && <QuickViewModal />}
        {isCompareModalOpen && <ProductComparisonModal />}
        {isCheckoutOpen && <CheckoutModal onOrderSuccess={order => setCompletedOrder(order)} />}
        {completedOrder && <OrderSuccessModal order={completedOrder} onClose={() => setCompletedOrder(null)} />}
        {isTrackingOpen && <OrderTrackingModal />}
        {isAdminOpen && <AdminDashboard />}
      </Suspense>

      <ProductCompareBar />
      <WhatsAppConcierge />
      <PWAInstallBanner />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <SmoothScrollProvider>
          <MainStore />
        </SmoothScrollProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
