/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { AuthModal } from './components/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { TrackOrderView } from './views/TrackOrderView';
import { WishlistView } from './views/WishlistView';
import { AccountView } from './views/AccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AboutView, ContactView, FAQView } from './views/SupportViews';

const AppContent: React.FC = () => {
  const { currentView, isAdminLoggedIn, setIsAuthModalOpen, setAuthModalMode } = useShop();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // If in admin view and authorized, render dedicated Black & Gold Admin Dashboard
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      // Prompt login if not logged in
      return (
        <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4 bg-[#0D0D0D] border border-[#C5A059]/40 p-8 rounded-xs shadow-2xl">
            <span className="text-3xl font-serif-luxury font-bold text-gold-gradient">MS.</span>
            <p className="text-sm text-stone-300">Administrative authorization required.</p>
            <button
              onClick={() => {
                setAuthModalMode('admin');
                setIsAuthModalOpen(true);
              }}
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-widest rounded-xs hover:bg-[#F3E5AB] transition-colors cursor-pointer"
            >
              Sign In to Admin
            </button>
          </div>
          <AuthModal />
        </div>
      );
    }
    return <AdminDashboardView />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Sticky Header with AURA announcement */}
      <Header onOpenSearch={() => setSearchModalOpen(true)} />

      {/* Main Dynamic View Area */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'product-detail' && <ProductDetailView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-confirmation' && <OrderConfirmationView />}
        {currentView === 'track-order' && <TrackOrderView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'account' && <AccountView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'contact' && <ContactView />}
        {currentView === 'faq' && <FAQView />}
        {currentView === 'size-guide' && <FAQView />}
      </main>

      {/* Privilege Roster & Luxury Footer */}
      <Footer />

      {/* Floating WhatsApp Button (Icon Only - User Requirement) */}
      <WhatsAppButton />

      {/* Modals & Drawers */}
      <CartDrawer />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <QuickViewModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
