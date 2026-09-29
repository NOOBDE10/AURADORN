import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings as SettingsIcon, 
  Star, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  DollarSign,
  Mail,
  Phone,
  Save,
  Copy,
  Download,
  Eye,
  Send,
  FileText,
  Check,
  MapPin,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Product, Order, StoreSettings, NewsletterSubscriber } from '../types';
import { fetchSubscribers, deleteSubscriber } from '../services/storeService';
import { LoyaltyBadge } from './LoyaltyBadge';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminOpen, 
    closeAdmin, 
    isAdmin, 
    adminUser, 
    adminLogin, 
    adminLogout,
    user,
    signInGoogle,
    products, 
    orders, 
    reviews, 
    settings, 
    updateOrderStatus,
    handleSaveProduct,
    handleDeleteProduct,
    handleUpdateSettings,
    adminNotifications,
    clearAdminNotifications,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reviews' | 'settings' | 'subscribers'>('overview');
  const [adminEmailInput, setAdminEmailInput] = useState('auraadornjewellers@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  useEffect(() => {
    if (isAdminOpen) {
      fetchSubscribers(isAdmin).then(data => setSubscribers(data));
    }
  }, [isAdminOpen, activeTab, isAdmin]);

  // Orders Filter & Search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [courierNameInput, setCourierNameInput] = useState<string>('TCS Express');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<boolean>(false);

  // Product Edit / Add State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);

  if (!isAdminOpen) return null;

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await adminLogin(adminEmailInput, adminPasswordInput);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials.');
    }
  };

  // Metrics calculation
  const totalRevenue = orders
    .filter(o => (o.status || o.orderStatus) !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => (o.status || o.orderStatus) === 'pending').length;
  const deliveredOrdersCount = orders.filter(o => (o.status || o.orderStatus) === 'delivered').length;
  const lowStockProducts = products.filter(p => p.stock <= 3);

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.phone.includes(orderSearchQuery);

    const currentStatus = o.status || o.orderStatus;
    const matchesStatus = orderStatusFilter === 'all' || currentStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStartAddProduct = () => {
    setEditingProduct({
      name: '',
      category: 'rings',
      subCategory: 'Solitaire Rings',
      price: 1500,
      originalPrice: 1800,
      discountPercentage: 16,
      stock: 5,
      rating: 5,
      reviewCount: 1,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85'
      ],
      description: 'Handcrafted in pure hallmarked 18K gold featuring brilliant cut center stones.',
      details: {
        metal: '18K Solid Warm Yellow Gold',
        karat: '18 Karat Hallmarked',
        weight: '4.20 grams',
        stone: 'VVS1 Brilliant Cut Diamond',
        gemstoneWeight: '1.25 Carats',
        certification: 'GIA Certified (Report No. GIA-2026-9081)',
        dimensions: 'Band width: 2.1mm'
      }
    });
    setIsEditingProduct(true);
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsEditingProduct(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      showToast('Product name and price are mandatory.', 'info');
      return;
    }
    await handleSaveProduct(editingProduct);
    setIsEditingProduct(false);
    setEditingProduct(null);
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateSettings(settingsForm);
  };

  const handleSaveOrderTracking = async () => {
    if (!selectedOrderForDetails) return;
    setIsUpdatingOrder(true);
    try {
      const currentStatus = selectedOrderForDetails.status || selectedOrderForDetails.orderStatus || 'confirmed';
      await updateOrderStatus(selectedOrderForDetails.id, currentStatus, trackingNumberInput, courierNameInput);
      setSelectedOrderForDetails(prev => prev ? { ...prev, trackingNumber: trackingNumberInput, courierName: courierNameInput } : null);
      showToast(`Tracking saved for #${selectedOrderForDetails.id}`, 'gold');
    } catch {
      showToast('Failed to update tracking', 'info');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleUpdateDetailStatus = async (newStatus: any) => {
    if (!selectedOrderForDetails) return;
    await updateOrderStatus(selectedOrderForDetails.id, newStatus, selectedOrderForDetails.trackingNumber, selectedOrderForDetails.courierName);
    setSelectedOrderForDetails(prev => prev ? { ...prev, status: newStatus, orderStatus: newStatus } : null);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-6xl my-auto rounded-3xl border border-[#26211B] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#26211B] bg-[#080706] text-[#FAF7F2] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0B0A08] p-0.5 shadow-[0_0_15px_rgba(201,162,93,0.4)] shrink-0">
              <img 
                src="/logo.png" 
                alt="AA JEWELLERS Logo" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }}
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-white flex items-center gap-2">
                AA JEWELLERS • Vault Control Room
                <span className="text-[10px] uppercase font-sans tracking-widest bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-bold px-2 py-0.5 rounded">
                  Admin
                </span>
              </h2>
              <p className="text-[11px] font-sans text-stone-400">
                Owner: auraadornjewellers@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (user?.email === 'auraadornjewellers@gmail.com' || user?.email === 'nirbanmubashirzubair@gmail.com') && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync Active
              </span>
            )}
            {isAdmin && !(user?.email === 'auraadornjewellers@gmail.com' || user?.email === 'nirbanmubashirzubair@gmail.com') && (
              <button
                onClick={signInGoogle}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9A25D]/20 text-[#C9A25D] hover:bg-[#C9A25D]/30 border border-[#C9A25D]/40 rounded-full text-[11px] font-sans transition-colors cursor-pointer"
                title="Connect with Google (auraadornjewellers@gmail.com) for real-time Firestore database sync"
              >
                <span>⚡ Connect Google Cloud</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={adminLogout}
                className="text-xs font-sans text-stone-300 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:border-[#C9A25D] transition-colors cursor-pointer"
              >
                Sign Out Admin
              </button>
            )}
            <button
              onClick={closeAdmin}
              className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-[#E5C378] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Content Area */}
        <div data-lenis-prevent className="overflow-y-auto flex-1 p-6">
          {!isAdmin ? (
            /* Admin Login Screen */
            <div className="max-w-md mx-auto py-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#181613] border border-[#C9A25D]/40 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-[#C9A25D]" />
                </div>
                <h3 className="font-serif text-2xl text-[#FAF7F2]">Store Administrator Access</h3>
                <p className="text-xs font-sans text-[#A89F91]">
                  Authorized access reserved for the boutique owner (<span className="text-[#E5C378] font-medium">auraadornjewellers@gmail.com</span>) to manage commissions and vault products.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl">
                  {authError}
                </div>
              )}

              {/* Direct Google Sign-In for Owner */}
              <button
                type="button"
                onClick={async () => {
                  setAuthError('');
                  try {
                    await signInGoogle();
                  } catch (e: any) {
                    setAuthError(e.message || 'Google sign-in error');
                  }
                }}
                className="w-full py-3.5 bg-[#14120F] hover:bg-[#1E1A16] text-[#FAF7F2] border border-[#C9A25D]/60 hover:border-[#C9A25D] font-sans text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google (Owner Account)</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#26211B]" />
                <span className="text-[11px] font-sans text-stone-500 uppercase tracking-widest">Or enter Admin credentials</span>
                <div className="h-px flex-1 bg-[#26211B]" />
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-4 bg-[#14120F] p-6 rounded-2xl border border-[#26211B] shadow-sm">
                <div>
                  <label className="block text-xs font-sans font-medium text-[#D8CDC0] mb-1">
                    Owner Admin ID or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="admin or auraadornjewellers@gmail.com"
                    className="w-full bg-[#0E0D0B] border border-[#2E2822] rounded-xl p-3 text-xs font-sans text-[#FAF7F2] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-[#D8CDC0] mb-1">
                    Admin Password (default: admin123)
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0E0D0B] border border-[#2E2822] rounded-xl p-3 text-xs font-sans text-[#FAF7F2] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  Unlock Vault Panel
                </button>
              </form>
            </div>
          ) : (
            /* Admin Authenticated Dashboard */
            <div className="space-y-8">
              {/* Notification Banner if there are new orders */}
              {adminNotifications.length > 0 && (
                <div className="p-4 bg-[#14120F] text-[#FAF7F2] rounded-2xl border border-[#C9A25D] shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#C9A25D] animate-bounce" />
                    <div>
                      <p className="text-sm font-serif font-medium text-white">
                        {adminNotifications.length} New Commission Order(s) Received!
                      </p>
                      <p className="text-xs text-stone-300 font-sans">
                        Notifications automatically logged for auraadornjewellers@gmail.com.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearAdminNotifications}
                    className="text-xs font-sans bg-[#C9A25D] text-[#0B0A08] font-bold px-3 py-1.5 rounded-lg hover:bg-[#E5C378] cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#26211B] space-x-6 text-xs font-sans uppercase tracking-widest font-medium overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'overview' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Metrics Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'orders' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders & COD Dispatch ({orders.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'products' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Vault Inventory ({products.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'settings' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Boutique Settings & Policies</span>
                </button>
                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`py-3 border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'subscribers' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Launch Subscribers ({subscribers.length})</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm">
                      <div className="flex items-center justify-between text-[#A89F91] mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-[#C9A25D]" />
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#E5C378]">
                        ${totalRevenue.toLocaleString()}
                      </p>
                      <span className="text-[11px] text-emerald-400 font-sans mt-1 block">
                        Across {orders.length} commissions
                      </span>
                    </div>

                    <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm">
                      <div className="flex items-center justify-between text-[#A89F91] mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Pending COD</span>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="font-serif text-2xl font-bold text-amber-400">
                        {pendingOrdersCount} Orders
                      </p>
                      <span className="text-[11px] text-stone-400 font-sans mt-1 block">
                        Require call verification & dispatch
                      </span>
                    </div>

                    <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm">
                      <div className="flex items-center justify-between text-[#A89F91] mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Vault Jewels</span>
                        <Package className="w-4 h-4 text-[#C9A25D]" />
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#FAF7F2]">
                        {products.length} Designs
                      </p>
                      <span className="text-[11px] text-stone-400 font-sans mt-1 block">
                        Across 6 haute categories
                      </span>
                    </div>

                    <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm">
                      <div className="flex items-center justify-between text-[#A89F91] mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Low Stock</span>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      </div>
                      <p className="font-serif text-2xl font-bold text-rose-400">
                        {lowStockProducts.length} Items
                      </p>
                      <span className="text-[11px] text-rose-400/80 font-sans mt-1 block">
                        Less than 3 units remaining
                      </span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('subscribers')}
                      className="p-5 bg-[#14120F] rounded-2xl border border-[#C9A25D]/40 shadow-sm cursor-pointer hover:border-[#E5C378] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[#A89F91] mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold text-[#E5C378]">Subscribers</span>
                        <Mail className="w-4 h-4 text-[#C9A25D]" />
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#E5C378]">
                        {subscribers.length} Patrons
                      </p>
                      <span className="text-[11px] text-[#E5C378]/80 font-sans mt-1 block font-medium">
                        Launch list roster →
                      </span>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="bg-[#14120F] rounded-2xl border border-[#26211B] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg text-[#FAF7F2]">Latest Client Commissions</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-sans text-[#E5C378] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-[#241F1A] overflow-x-auto">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans">
                          <div>
                            <span className="font-mono font-bold text-[#E5C378]">{order.id}</span>
                            <p className="text-[#A89F91]">{order.customerName} • {order.city}</p>
                          </div>
                          <div className="text-[#D8CDC0]">
                            {order.items.length} item(s) • <strong className="text-[#E5C378]">${order.totalAmount.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-semibold border ${
                              (order.status || order.orderStatus) === 'delivered'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                                : (order.status || order.orderStatus) === 'shipped'
                                ? 'bg-sky-950/80 text-sky-300 border-sky-500/30'
                                : (order.status || order.orderStatus) === 'confirmed'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                                : (order.status || order.orderStatus) === 'cancelled'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                            }`}>
                              {order.status || order.orderStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrderForDetails(order);
                                setTrackingNumberInput(order.trackingNumber || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-[#2E2822] hover:border-[#C9A25D] text-xs font-medium text-[#FAF7F2] hover:text-[#E5C378] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#E5C378]" />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#181613] hover:bg-[#221E19] border border-[#2E2822] hover:border-[#C9A25D] text-xs font-medium text-[#FAF7F2] hover:text-[#E5C378] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#C9A25D]" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Filters and search */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14120F] p-4 rounded-2xl border border-[#26211B]">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Order ID, customer name or phone..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-[#0E0D0B] border border-[#2E2822] rounded-xl py-2.5 pl-9 pr-3 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans text-[#A89F91]">Status:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="bg-[#0E0D0B] border border-[#2E2822] text-[#FAF7F2] rounded-xl py-2 px-3 text-xs font-sans cursor-pointer focus:outline-none focus:border-[#C9A25D]"
                      >
                        <option value="all" className="bg-[#0E0D0B] text-[#FAF7F2]">All Statuses ({orders.length})</option>
                        <option value="pending" className="bg-[#0E0D0B] text-[#FAF7F2]">Pending</option>
                        <option value="confirmed" className="bg-[#0E0D0B] text-[#FAF7F2]">Confirmed</option>
                        <option value="processing" className="bg-[#0E0D0B] text-[#FAF7F2]">Processing</option>
                        <option value="shipped" className="bg-[#0E0D0B] text-[#FAF7F2]">Shipped</option>
                        <option value="delivered" className="bg-[#0E0D0B] text-[#FAF7F2]">Delivered</option>
                        <option value="cancelled" className="bg-[#0E0D0B] text-[#FAF7F2]">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-[#14120F] rounded-2xl border border-[#26211B] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#1A1714] border-b border-[#26211B] text-[#E5C378] uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-4">Order ID & Date</th>
                            <th className="p-4">Customer & Address</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total Amount (COD)</th>
                            <th className="p-4">Status & Dispatch</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#241F1A]">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                                No commissions matching the criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map(order => (
                              <tr key={order.id} className="hover:bg-[#1A1714]/60 transition-colors">
                                <td className="p-4">
                                  <p className="font-mono font-bold text-[#E5C378]">{order.id}</p>
                                  <p className="text-[10px] text-stone-400">
                                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </td>
                                <td className="p-4">
                                  <p className="font-semibold text-[#FAF7F2]">{order.customerName}</p>
                                  <p className="text-[11px] text-[#A89F91]">{order.phone}</p>
                                  <p className="text-[10px] text-stone-400 truncate max-w-xs">{order.address}, {order.city}</p>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1 max-w-xs">
                                    {order.items.map((item, i) => (
                                      <p key={i} className="text-[11px] text-[#D8CDC0] truncate">
                                        • {item.quantity}x {item.productName} ({item.metal || '18K'})
                                      </p>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="font-serif text-sm font-bold text-[#E5C378]">
                                    ${order.totalAmount.toLocaleString()}
                                  </p>
                                  <span className="text-[10px] text-stone-400 block">Cash on Delivery</span>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={order.status || order.orderStatus}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border ${
                                      (order.status || order.orderStatus) === 'delivered'
                                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                                        : (order.status || order.orderStatus) === 'shipped'
                                        ? 'bg-sky-950/80 text-sky-300 border-sky-500/30'
                                        : (order.status || order.orderStatus) === 'confirmed'
                                        ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                                        : (order.status || order.orderStatus) === 'cancelled'
                                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                                        : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                    }`}
                                  >
                                    <option value="pending" className="bg-[#0E0D0B] text-amber-300">Pending</option>
                                    <option value="confirmed" className="bg-[#0E0D0B] text-purple-300">Confirmed</option>
                                    <option value="processing" className="bg-[#0E0D0B] text-blue-300">Processing</option>
                                    <option value="shipped" className="bg-[#0E0D0B] text-sky-300">Shipped</option>
                                    <option value="delivered" className="bg-[#0E0D0B] text-emerald-300">Delivered</option>
                                    <option value="cancelled" className="bg-[#0E0D0B] text-rose-300">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedOrderForDetails(order);
                                        setTrackingNumberInput(order.trackingNumber || '');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-[#2E2822] hover:border-[#C9A25D] text-xs font-medium text-[#FAF7F2] hover:text-[#E5C378] transition-colors flex items-center gap-1 cursor-pointer"
                                      title="View comprehensive order details"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#E5C378]" />
                                      <span>Details</span>
                                    </button>
                                    <button
                                      onClick={() => setSelectedOrderForInvoice(order)}
                                      className="px-2.5 py-1.5 bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] hover:text-[#E5C378] rounded-lg border border-[#2E2822] hover:border-[#C9A25D] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Print receipt / invoice"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-[#C9A25D]" />
                                      <span>Invoice</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS INVENTORY */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[#FAF7F2]">Haute Jewellery Vault Inventory</h3>
                      <p className="text-xs font-sans text-[#A89F91]">
                        Create, modify prices, update stock, and curate featured solitaires.
                      </p>
                    </div>
                    <button
                      onClick={handleStartAddProduct}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Jewel</span>
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(prod => (
                      <div key={prod.id} className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] hover:border-[#C9A25D]/60 transition-colors flex gap-4">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-24 h-24 object-cover rounded-xl border border-[#2E2822] bg-[#1A1714] shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-sans tracking-widest text-[#E5C378] font-medium">
                                {prod.category}
                              </span>
                              <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded border ${
                                prod.stock <= 3 
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/30' 
                                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/30'
                              }`}>
                                Stock: {prod.stock}
                              </span>
                            </div>
                            <div className="my-1">
                              <LoyaltyBadge product={prod} variant="compact" />
                            </div>
                            <h4 className="font-serif text-sm font-medium text-[#FAF7F2] truncate">{prod.name}</h4>
                            <p className="font-serif text-sm font-bold text-[#E5C378] mt-0.5">
                              ${prod.price.toLocaleString()}
                              {prod.originalPrice > prod.price && (
                                <span className="font-sans text-xs text-stone-500 line-through ml-2">
                                  ${prod.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#241F1A]">
                            <button
                              onClick={() => handleStartEditProduct(prod)}
                              className="flex-1 py-1.5 text-xs font-sans font-medium text-[#FAF7F2] hover:text-[#E5C378] bg-[#181613] hover:bg-[#221E19] rounded-lg border border-[#2E2822] hover:border-[#C9A25D] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#C9A25D]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete design"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettingsSubmit} className="space-y-6 bg-[#14120F] p-6 rounded-2xl border border-[#26211B] animate-in fade-in">
                  <div className="border-b border-[#241F1A] pb-4">
                    <h3 className="font-serif text-lg text-[#FAF7F2]">Boutique Identity & Contact</h3>
                    <p className="text-xs font-sans text-[#A89F91]">
                      Configure store identity, phone numbers, and notification recipients.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={settingsForm.brandName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Owner Email (Notifications)</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">WhatsApp Number (Orders)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Boutique Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Free Delivery Threshold ($)</label>
                      <input
                        type="number"
                        value={settingsForm.freeDeliveryThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                        className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#241F1A]">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:brightness-110 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Boutique Settings</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: LAUNCH SUBSCRIBERS */}
              {activeTab === 'subscribers' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14120F] p-6 rounded-2xl border border-[#26211B]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#C9A25D]" />
                        <h3 className="font-serif text-xl text-[#FAF7F2]">Private Launch & Vernissage Subscribers</h3>
                      </div>
                      <p className="text-xs font-sans text-[#A89F91] mt-1">
                        High-intent patrons registered for upcoming high-jewellery releases and private salon events.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const emails = subscribers.map(s => s.email).join(', ');
                          navigator.clipboard.writeText(emails);
                          showToast(`Copied ${subscribers.length} subscriber emails to clipboard.`, 'gold');
                        }}
                        disabled={subscribers.length === 0}
                        className="px-4 py-2.5 bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] hover:text-[#E5C378] border border-[#2E2822] hover:border-[#C9A25D] rounded-xl text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#C9A25D]" />
                        <span>Copy All Emails</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const csvContent = "data:text/csv;charset=utf-8," 
                            + "Email,SubscribedAt,Source,Active\n"
                            + subscribers.map(s => `"${s.email}","${s.subscribedAt}","${s.source}",${s.active}`).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `aajewelers_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showToast('Subscribers roster CSV downloaded.', 'gold');
                        }}
                        disabled={subscribers.length === 0}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] hover:brightness-110 rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0B0A08]" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search */}
                  <div className="bg-[#14120F] p-4 rounded-2xl border border-[#26211B] flex items-center gap-3">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      placeholder="Search subscriber by email address..."
                      className="w-full text-xs font-sans bg-transparent focus:outline-none text-[#FAF7F2] placeholder:text-stone-500"
                    />
                    {subscriberSearch && (
                      <button onClick={() => setSubscriberSearch('')} className="text-xs text-stone-400 hover:text-[#FAF7F2] cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Subscribers Table */}
                  <div className="bg-[#14120F] rounded-2xl border border-[#26211B] overflow-hidden shadow-2xs">
                    {subscribers.length === 0 ? (
                      <div className="py-16 text-center text-xs font-sans text-stone-400 italic">
                        No subscribers registered yet. Submissions via the footer newsletter component will automatically register here.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead className="bg-[#1A1714] border-b border-[#26211B] text-[10px] uppercase font-bold tracking-wider text-[#E5C378]">
                            <tr>
                              <th className="p-4">Subscriber Email</th>
                              <th className="p-4">Subscribed Date</th>
                              <th className="p-4">Acquisition Channel</th>
                              <th className="p-4">Roster Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#241F1A]">
                            {subscribers
                              .filter(s => s.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                              .map(s => (
                                <tr key={s.id} className="hover:bg-[#1A1714]/60 transition-colors">
                                  <td className="p-4 font-medium text-[#FAF7F2] flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-[#C9A25D]" />
                                    <span>{s.email}</span>
                                  </td>
                                  <td className="p-4 text-stone-300">
                                    {new Date(s.subscribedAt).toLocaleDateString(undefined, { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </td>
                                  <td className="p-4 text-stone-400 font-mono text-[11px]">
                                    {s.source || 'footer_newsletter'}
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Active Patron
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm(`Remove ${s.email} from launch subscribers?`)) {
                                          await deleteSubscriber(s.id);
                                          setSubscribers(prev => prev.filter(item => item.id !== s.id));
                                          showToast('Subscriber removed.', 'info');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Remove from roster"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ORDER DETAILS MODAL (High-contrast Obsidian Black & Champagne Gold Theme) */}
        {selectedOrderForDetails && (
          <div data-lenis-prevent className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-4xl rounded-3xl border border-[#C9A25D]/50 shadow-[0_0_80px_rgba(0,0,0,0.95)] p-5 sm:p-8 space-y-6 relative my-auto max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#26211B] pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0E0D0B] shrink-0 p-0.5 shadow-sm">
                      <img 
                        src="/logo.png" 
                        alt="AA JEWELLERS" 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#C9A25D]/20 text-[#E5C378] border border-[#C9A25D]/40 font-bold">
                      Order Dossier
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#FAF7F2]">
                      #{selectedOrderForDetails.id}
                    </h2>
                  </div>
                  <p className="text-xs font-sans text-[#A89F91]">
                    Placed on {new Date(selectedOrderForDetails.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(selectedOrderForDetails.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-xl uppercase text-xs font-bold tracking-wider border shadow-xs ${
                    (selectedOrderForDetails.status || selectedOrderForDetails.orderStatus) === 'delivered'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : (selectedOrderForDetails.status || selectedOrderForDetails.orderStatus) === 'shipped'
                      ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                      : (selectedOrderForDetails.status || selectedOrderForDetails.orderStatus) === 'confirmed'
                      ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                      : (selectedOrderForDetails.status || selectedOrderForDetails.orderStatus) === 'cancelled'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border-amber-500/40'
                  }`}>
                    {selectedOrderForDetails.status || selectedOrderForDetails.orderStatus}
                  </span>
                  <button
                    onClick={() => setSelectedOrderForDetails(null)}
                    className="p-2 text-stone-400 hover:text-[#FAF7F2] rounded-xl hover:bg-[#1A1714] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Patron Details & Courier Dispatch */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Patron Details Card */}
                  <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#241F1A] pb-3">
                      <h4 className="font-serif text-sm font-semibold text-[#E5C378] uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#C9A25D]" />
                        <span>Patron Identity & Delivery</span>
                      </h4>
                      <span className="text-[10px] font-sans text-stone-400">COD Commission</span>
                    </div>

                    <div className="space-y-3 text-xs font-sans">
                      <div>
                        <span className="text-[#A89F91] block text-[11px]">Full Name</span>
                        <p className="font-semibold text-sm text-[#FAF7F2] mt-0.5">{selectedOrderForDetails.customerName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[#A89F91] block text-[11px]">Phone / Mobile</span>
                          <a href={`tel:${selectedOrderForDetails.phone}`} className="font-mono text-[#E5C378] hover:underline flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#C9A25D]" />
                            {selectedOrderForDetails.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-[#A89F91] block text-[11px]">Email Address</span>
                          <p className="text-[#FAF7F2] truncate mt-0.5" title={selectedOrderForDetails.email}>
                            {selectedOrderForDetails.email}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#A89F91] block text-[11px]">Shipping Destination</span>
                        <p className="text-[#FAF7F2] leading-relaxed mt-0.5 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-[#C9A25D] shrink-0 mt-0.5" />
                          <span>{selectedOrderForDetails.address}, {selectedOrderForDetails.city} {selectedOrderForDetails.area ? `(${selectedOrderForDetails.area})` : ''}</span>
                        </p>
                      </div>

                      {selectedOrderForDetails.notes && (
                        <div className="p-3 bg-[#0E0D0B] rounded-xl border border-[#2E2822]">
                          <span className="text-[11px] text-[#E5C378] font-semibold block">Client Special Instructions / Engraving:</span>
                          <p className="text-[#D8CDC0] text-xs mt-1 italic">"{selectedOrderForDetails.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Patron Communication Buttons */}
                    <div className="pt-3 border-t border-[#241F1A] flex gap-2">
                      <a
                        href={`https://wa.me/${selectedOrderForDetails.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${selectedOrderForDetails.customerName}, this is AA JEWELERS regarding your Haute Jewellery Order #${selectedOrderForDetails.id} of $${selectedOrderForDetails.totalAmount.toLocaleString()}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${selectedOrderForDetails.phone}`}
                        className="py-2 px-4 bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] hover:text-[#E5C378] border border-[#2E2822] hover:border-[#C9A25D] rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#C9A25D]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Dispatch & Tracking Control */}
                  <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-[#E5C378] uppercase tracking-wider flex items-center gap-2 border-b border-[#241F1A] pb-3">
                      <Truck className="w-4 h-4 text-[#C9A25D]" />
                      <span>Courier Dispatch & Tracking Management</span>
                    </h4>

                    <div className="space-y-3 text-xs font-sans">
                      <div>
                        <label className="block text-[#A89F91] mb-1 font-medium">Order Status</label>
                        <select
                          value={selectedOrderForDetails.status || selectedOrderForDetails.orderStatus}
                          onChange={(e) => handleUpdateDetailStatus(e.target.value)}
                          className="w-full bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] focus:border-[#C9A25D] rounded-xl p-2.5 font-sans uppercase tracking-wider font-semibold cursor-pointer"
                        >
                          <option value="pending" className="bg-[#0E0D0B] text-amber-300">Pending Verification</option>
                          <option value="confirmed" className="bg-[#0E0D0B] text-purple-300">Confirmed</option>
                          <option value="processing" className="bg-[#0E0D0B] text-blue-300">Processing & Atelier Boxing</option>
                          <option value="shipped" className="bg-[#0E0D0B] text-sky-300">Dispatched / Shipped</option>
                          <option value="delivered" className="bg-[#0E0D0B] text-emerald-300">Delivered & Paid</option>
                          <option value="cancelled" className="bg-[#0E0D0B] text-rose-300">Cancelled</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#A89F91] mb-1 font-medium">Courier Service</label>
                          <input
                            type="text"
                            value={courierNameInput}
                            onChange={(e) => setCourierNameInput(e.target.value)}
                            placeholder="e.g. TCS Express / DHL"
                            className="w-full bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] focus:border-[#C9A25D] rounded-xl p-2.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[#A89F91] mb-1 font-medium">Tracking Number / AWB</label>
                          <input
                            type="text"
                            value={trackingNumberInput}
                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                            placeholder="e.g. TCS-9982410"
                            className="w-full bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] focus:border-[#C9A25D] rounded-xl p-2.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveOrderTracking}
                        disabled={isUpdatingOrder}
                        className="w-full py-2.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isUpdatingOrder ? 'Saving...' : 'Save Tracking & Notify Client'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ordered Items & Financial Summary */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Ordered Items List */}
                  <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#241F1A] pb-3">
                      <h4 className="font-serif text-sm font-semibold text-[#E5C378] uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#C9A25D]" />
                        <span>Commissioned Jewels ({selectedOrderForDetails.items.length})</span>
                      </h4>
                      <span className="text-[10px] text-stone-400 font-sans">100% Certified Authentic</span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-[#241F1A]">
                      {selectedOrderForDetails.items.map((item, idx) => (
                        <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs font-sans">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#1A1714] border border-[#2E2822] flex items-center justify-center overflow-hidden shrink-0">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-[#C9A25D]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[#FAF7F2]">{item.productName}</p>
                              <p className="text-[11px] text-[#A89F91]">
                                {item.metal || '18K Yellow Gold'} • Qty: <strong className="text-[#E5C378]">{item.quantity}</strong>
                              </p>
                              <p className="text-[10px] text-stone-400">Unit: ${item.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-serif text-sm font-bold text-[#E5C378]">${item.total.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Audit Card */}
                  <div className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-3 text-xs font-sans">
                    <h4 className="font-serif text-sm font-semibold text-[#E5C378] uppercase tracking-wider border-b border-[#241F1A] pb-3 flex items-center justify-between">
                      <span>Commission Financial Summary</span>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#C9A25D]/20 text-[#E5C378] border border-[#C9A25D]/30">
                        Cash on Delivery
                      </span>
                    </h4>

                    <div className="space-y-2 text-[#D8CDC0]">
                      <div className="flex justify-between">
                        <span className="text-[#A89F91]">Subtotal:</span>
                        <span>${selectedOrderForDetails.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedOrderForDetails.discount > 0 && (
                        <div className="flex justify-between text-rose-400">
                          <span>VIP Privilege Discount:</span>
                          <span>-${selectedOrderForDetails.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#A89F91]">Armoured Delivery & Insurance:</span>
                        <span>{selectedOrderForDetails.deliveryCharge === 0 ? 'Complimentary ($0)' : `$${selectedOrderForDetails.deliveryCharge.toLocaleString()}`}</span>
                      </div>
                      <div className="border-t border-[#241F1A] pt-3 flex justify-between items-center text-sm">
                        <span className="font-serif font-bold text-[#FAF7F2]">Total Payable at Door:</span>
                        <span className="font-serif text-2xl font-bold text-[#E5C378]">
                          ${selectedOrderForDetails.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedOrderForInvoice(selectedOrderForDetails);
                      }}
                      className="flex-1 py-3 bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] hover:text-[#E5C378] border border-[#2E2822] hover:border-[#C9A25D] rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4 text-[#C9A25D]" />
                      <span>Print Luxury Invoice</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrderForDetails(null)}
                      className="px-6 py-3 bg-[#26211B] hover:bg-[#342D25] text-[#FAF7F2] rounded-xl text-xs font-sans font-semibold cursor-pointer transition-colors"
                    >
                      Close Dossier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVOICE MODAL OVERLAY (High-Contrast Obsidian & Champagne Gold Theme) */}
        {selectedOrderForInvoice && (
          <div data-lenis-prevent className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-xl rounded-3xl border border-[#C9A25D]/60 p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.95)] relative my-auto">
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-[#FAF7F2] cursor-pointer p-2 rounded-xl hover:bg-[#1A1714] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between border-b border-[#26211B] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C9A25D] bg-[#0E0D0B] shrink-0 p-0.5 shadow-md">
                    <img 
                      src="/logo.png" 
                      alt="AA JEWELLERS" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-wider text-[#E5C378]">
                      AA JEWELLERS
                    </h2>
                    <p className="text-[10px] text-[#A89F91] uppercase tracking-widest">Timeless Beauty • Refined Elegance</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#E5C378]">INVOICE #{selectedOrderForInvoice.id}</span>
                  <p className="text-[10px] text-stone-400">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] text-xs font-sans space-y-1.5 text-[#D8CDC0]">
                <p><span className="text-[#A89F91] font-semibold">Patron:</span> <strong className="text-[#FAF7F2]">{selectedOrderForInvoice.customerName}</strong></p>
                <p><span className="text-[#A89F91] font-semibold">Contact:</span> {selectedOrderForInvoice.phone} • {selectedOrderForInvoice.email}</p>
                <p><span className="text-[#A89F91] font-semibold">Destination:</span> {selectedOrderForInvoice.address}, {selectedOrderForInvoice.city}</p>
                <p><span className="text-[#A89F91] font-semibold">Payment Terms:</span> <span className="text-[#E5C378] font-medium">{selectedOrderForInvoice.paymentMethod}</span></p>
              </div>

              <div className="border-t border-b border-[#26211B] py-3 space-y-2">
                {selectedOrderForInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs font-sans text-[#FAF7F2]">
                    <span>{item.quantity}x {item.productName} ({item.metal || '18K'})</span>
                    <span className="font-serif font-medium text-[#E5C378]">${item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs font-sans space-y-1 text-right text-[#D8CDC0]">
                <p>Subtotal: ${selectedOrderForInvoice.subtotal.toLocaleString()}</p>
                {selectedOrderForInvoice.discount > 0 && <p className="text-rose-400">Privilege Discount: -${selectedOrderForInvoice.discount.toLocaleString()}</p>}
                <p>Insured Delivery: ${selectedOrderForInvoice.deliveryCharge.toLocaleString()}</p>
                <p className="text-lg font-serif font-bold text-[#E5C378] pt-2 border-t border-[#26211B]">
                  Total Due: ${selectedOrderForInvoice.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 transition-all"
                >
                  <Printer className="w-4 h-4 text-[#0B0A08]" />
                  <span>Print Receipt / Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="px-5 py-3 bg-[#181613] hover:bg-[#221E19] text-[#FAF7F2] border border-[#2E2822] rounded-xl text-xs font-sans font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Edit / Add Modal (Luxury Black & Gold Theme) */}
        {isEditingProduct && editingProduct && (
          <div data-lenis-prevent className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#C9A25D]/50 p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.95)] relative my-auto max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsEditingProduct(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-[#FAF7F2] cursor-pointer p-2 rounded-xl hover:bg-[#1A1714]"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl text-[#FAF7F2] border-b border-[#241F1A] pb-3">
                {editingProduct.id ? 'Edit Haute Jewel Creation' : 'Cast New Jewellery Piece'}
              </h3>

              <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-medium text-stone-300 mb-1">Creation Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Royal Solitaire Diamond Ring"
                    className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-300 mb-1">Category</label>
                    <select
                      value={editingProduct.category || 'rings'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D] cursor-pointer"
                    >
                      <option value="rings" className="bg-[#0E0D0B] text-[#FAF7F2]">Rings</option>
                      <option value="necklaces" className="bg-[#0E0D0B] text-[#FAF7F2]">Necklaces</option>
                      <option value="earrings" className="bg-[#0E0D0B] text-[#FAF7F2]">Earrings</option>
                      <option value="bracelets" className="bg-[#0E0D0B] text-[#FAF7F2]">Bracelets</option>
                      <option value="bangles" className="bg-[#0E0D0B] text-[#FAF7F2]">Bangles</option>
                      <option value="sets" className="bg-[#0E0D0B] text-[#FAF7F2]">Sets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-300 mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={editingProduct.subCategory || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                      placeholder="e.g. Solitaire Rings"
                      className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-stone-300 mb-1">Sale Price ($) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-300 mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-300 mb-1">Vault Stock Qty</label>
                    <input
                      type="number"
                      value={editingProduct.stock || 1}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-300 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => {
                      const newImages = [...(editingProduct.images || [])];
                      newImages[0] = e.target.value;
                      setEditingProduct({ ...editingProduct, images: newImages });
                    }}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-300 mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full p-2.5 bg-[#14120F] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFeatured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>Featured Piece</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isBestSeller)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>Best Seller Tag</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isNewArrival)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>New Arrival Tag</span>
                  </label>
                </div>

                {/* Prestige Loyalty Badge Configuration */}
                <div className="p-4 bg-[#14120F] rounded-2xl border border-[#C9A25D]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-medium text-[#FAF7F2] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C9A25D]" />
                      <span>Loyalty Badge & Prestige Tier</span>
                    </label>
                    <span className="text-[10px] uppercase font-sans tracking-wider text-[#E5C378]">
                      Exclusive & Limited Edition Highlights
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 mb-1">Prestige Tier</label>
                      <select
                        value={editingProduct.loyaltyBadge?.type || 'none'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'none') {
                            setEditingProduct({
                              ...editingProduct,
                              loyaltyBadge: undefined,
                              isLimitedEdition: false,
                            });
                          } else {
                            setEditingProduct({
                              ...editingProduct,
                              isLimitedEdition: val === 'limited_edition',
                              loyaltyBadge: {
                                type: val as any,
                                label: val === 'vault_exclusive' ? 'Vault Exclusive' : val === 'limited_edition' ? 'Limited Edition' : val === 'patron_reserve' ? 'Patron Reserve' : 'Atelier Private',
                                editionNumber: editingProduct.loyaltyBadge?.editionNumber || (val === 'limited_edition' ? 'Limited to 25 Pieces' : 'Bespoke Master Cast'),
                                pointsMultiplier: val === 'vault_exclusive' ? 3 : 2,
                                perkNote: editingProduct.loyaltyBadge?.perkNote || 'Complimentary Insured Courier & Velvet Box',
                              }
                            });
                          }
                        }}
                        className="w-full p-2 bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D] cursor-pointer"
                      >
                        <option value="none" className="bg-[#0E0D0B] text-[#FAF7F2]">Standard Catalogue (No Loyalty Badge)</option>
                        <option value="vault_exclusive" className="bg-[#0E0D0B] text-[#FAF7F2]">Vault Exclusive (High Jewellery Secret)</option>
                        <option value="limited_edition" className="bg-[#0E0D0B] text-[#FAF7F2]">Limited Edition (Numbered Artisan Release)</option>
                        <option value="patron_reserve" className="bg-[#0E0D0B] text-[#FAF7F2]">Patron Reserve (VIP Member Allocation)</option>
                        <option value="atelier_private" className="bg-[#0E0D0B] text-[#FAF7F2]">Atelier Private (Hand-Crafted Lahore Workshop)</option>
                        <option value="connoisseur" className="bg-[#0E0D0B] text-[#FAF7F2]">Heritage Piece (Certified Heirloom Quality)</option>
                      </select>
                    </div>

                    {editingProduct.loyaltyBadge && (
                      <div>
                        <label className="block text-stone-400 mb-1">Edition / Serial Note</label>
                        <input
                          type="text"
                          value={editingProduct.loyaltyBadge.editionNumber || ''}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            loyaltyBadge: {
                              ...editingProduct.loyaltyBadge!,
                              editionNumber: e.target.value
                            }
                          })}
                          placeholder="e.g. 1 of 5 Worldwide or Batch No. 04"
                          className="w-full p-2 bg-[#0E0D0B] text-[#FAF7F2] border border-[#2E2822] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#241F1A] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-5 py-2.5 border border-[#2E2822] hover:border-stone-600 rounded-xl font-medium cursor-pointer text-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] text-[#0B0A08] hover:brightness-110 rounded-xl font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all"
                  >
                    Save to Vault
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
