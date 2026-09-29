import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryList } from './components/CategoryList';
import { ProductGrid } from './components/ProductGrid';
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
import { Footer } from './components/Footer';
import { Order } from './types';

export function MainStore() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleShopNow = () => {
    setSelectedCategory('all');
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1815] flex flex-col font-sans selection:bg-[#C9A25D] selection:text-white">
      {/* Header with Navigation and Search */}
      <Header
        onSelectCategory={handleCategorySelect}
        activeCategory={selectedCategory}
      />

      {/* Main Luxury Experience */}
      <main className="flex-1">
        {/* Editorial Hero Banner */}
        <HeroSection onShopNow={handleShopNow} />

        {/* Categories Showcase */}
        <CategoryList
          onSelectCategory={handleCategorySelect}
          activeCategory={selectedCategory}
        />

        {/* Product Grid with Filters & Sort */}
        <ProductGrid
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleCategorySelect} />

      {/* Modals & Drawers */}
      <ProductDetailsModal />
      <QuickViewModal />
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

      {/* Floating Concierge & Notifications */}
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
