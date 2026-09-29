import React, { useState } from 'react';
import { FolderTree, LogOut, Mail, Package, Settings as SettingsIcon, ShieldCheck, ShoppingBag, Star, Tag, TrendingUp, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AdminLogin } from './admin/AdminLogin';
import { AdminTab, OverviewTab } from './admin/OverviewTab';
import { OrdersTab } from './admin/OrdersTab';
import { ProductsTab } from './admin/ProductsTab';
import { CategoriesTab } from './admin/CategoriesTab';
import { CouponsTab } from './admin/CouponsTab';
import { ReviewsTab } from './admin/ReviewsTab';
import { SettingsTab } from './admin/SettingsTab';
import { SubscribersTab } from './admin/SubscribersTab';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen, closeAdmin, isAdmin, user, logout, settings,
    orders, allProducts, categories, coupons, adminReviews, subscribers, pendingOrderCount,
  } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orderFilter, setOrderFilter] = useState('all');

  if (!isAdminOpen) return null;

  const goTo = (tab: AdminTab, filter = 'all') => {
    setOrderFilter(filter);
    setActiveTab(tab);
  };

  const pendingReviews = adminReviews.filter(r => r.status === 'pending').length;
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrderCount },
    { id: 'products', label: `Products (${allProducts.length})`, icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: `Categories (${categories.length})`, icon: <FolderTree className="w-4 h-4" /> },
    { id: 'coupons', label: `Discount codes (${coupons.length})`, icon: <Tag className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" />, badge: pendingReviews },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-7xl sm:rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[96vh]">
        {/* Top bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#1C1815] text-[#FAF8F5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#C9A25D]/20 border border-[#C9A25D]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-base sm:text-lg text-white truncate">{settings.brandName} · Admin</h2>
              {isAdmin && user?.email && <p className="text-[11px] text-stone-400 truncate">{user.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={logout} className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 cursor-pointer flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sign out</span>
              </button>
            )}
            <button onClick={closeAdmin} className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer" aria-label="Close admin">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <nav className="flex border-b border-[#EAE3D8] bg-white px-2 sm:px-4 gap-1 text-xs font-sans font-medium overflow-x-auto shrink-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className={`relative py-3 px-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === t.id ? 'border-[#C9A25D] text-[#1C1815] font-semibold' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.icon}
                {t.label}
                {Boolean(t.badge) && (
                  <span className="bg-rose-600 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">{t.badge}</span>
                )}
              </button>
            ))}
          </nav>
        )}

        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {!isAdmin ? (
            <AdminLogin />
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab goTo={goTo} />}
              {activeTab === 'orders' && <OrdersTab key={orderFilter} initialFilter={orderFilter} />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'coupons' && <CouponsTab />}
              {activeTab === 'reviews' && <ReviewsTab />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'subscribers' && <SubscribersTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
