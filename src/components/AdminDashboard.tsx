import React, { useState } from 'react';
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
  Save
} from 'lucide-react';
import { Product, Order, StoreSettings } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminOpen, 
    closeAdmin, 
    isAdmin, 
    adminUser, 
    adminLogin, 
    adminLogout,
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

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reviews' | 'settings'>('overview');
  const [adminEmailInput, setAdminEmailInput] = useState('nirbanmubashirzubair@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Orders Filter & Search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-6xl my-auto rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-[#1C1815] text-[#FAF8F5] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A25D]/20 border border-[#C9A25D]/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#C9A25D]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-white flex items-center gap-2">
                Aura & Carat • Vault Control Room
                <span className="text-[10px] uppercase font-sans tracking-widest bg-[#C9A25D] text-[#1C1815] font-bold px-2 py-0.5 rounded">
                  Admin
                </span>
              </h2>
              <p className="text-[11px] font-sans text-stone-400">
                Owner: nirbanmubashirzubair@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={adminLogout}
                className="text-xs font-sans text-stone-300 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 cursor-pointer"
              >
                Sign Out Admin
              </button>
            )}
            <button
              onClick={closeAdmin}
              className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {!isAdmin ? (
            /* Admin Login Screen */
            <div className="max-w-md mx-auto py-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#FAF6ED] border border-[#C9A25D]/40 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-[#C9A25D]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1C1815]">Store Administrator Access</h3>
                <p className="text-xs font-sans text-[#8C7662]">
                  Authorized access reserved for the boutique owner (<span className="text-[#1C1815] font-medium">nirbanmubashirzubair@gmail.com</span>) to manage commissions and vault products.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-4 bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-sm">
                <div>
                  <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                    Owner Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl p-3 text-xs font-sans text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                    Admin Password (default: admin123 or any test key)
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl p-3 text-xs font-sans text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
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
                <div className="p-4 bg-[#1C1815] text-[#FAF8F5] rounded-2xl border border-[#C9A25D] shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#C9A25D] animate-bounce" />
                    <div>
                      <p className="text-sm font-serif font-medium text-white">
                        {adminNotifications.length} New Commission Order(s) Received!
                      </p>
                      <p className="text-xs text-stone-300 font-sans">
                        Notifications automatically logged for nirbanmubashirzubair@gmail.com.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearAdminNotifications}
                    className="text-xs font-sans bg-[#C9A25D] text-[#1C1815] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#D8BD86] cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#EAE3D8] space-x-6 text-xs font-sans uppercase tracking-widest font-medium overflow-x-auto pb-px">
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
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-[#C9A25D]" />
                      </div>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1815]">
                        ${totalRevenue.toLocaleString()}
                      </p>
                      <span className="text-[11px] text-emerald-700 font-sans mt-1 block">
                        Across {orders.length} commissions
                      </span>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Pending COD</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">
                        {pendingOrdersCount} Orders
                      </p>
                      <span className="text-[11px] text-stone-400 font-sans mt-1 block">
                        Require call verification & dispatch
                      </span>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Vault Jewels</span>
                        <Package className="w-4 h-4 text-[#C9A25D]" />
                      </div>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1815]">
                        {products.length} Designs
                      </p>
                      <span className="text-[11px] text-stone-400 font-sans mt-1 block">
                        Across 6 haute categories
                      </span>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 mb-2">
                        <span className="text-xs font-sans uppercase tracking-wider font-semibold">Low Stock Alert</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-rose-700">
                        {lowStockProducts.length} Items
                      </p>
                      <span className="text-[11px] text-rose-600 font-sans mt-1 block">
                        Less than 3 units remaining
                      </span>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="bg-white rounded-2xl border border-[#EAE3D8] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg text-[#1C1815]">Latest Client Commissions</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-sans text-[#C9A25D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-[#F3EFEA] overflow-x-auto">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans">
                          <div>
                            <span className="font-mono font-bold text-[#1C1815]">{order.id}</span>
                            <p className="text-stone-500">{order.customerName} • {order.city}</p>
                          </div>
                          <div className="text-stone-600">
                            {order.items.length} item(s) • ${order.totalAmount.toLocaleString()}
                          </div>
                          <div>
                            <span className="px-2.5 py-1 rounded-full uppercase text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              {order.status || order.orderStatus}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="text-stone-500 hover:text-stone-900 cursor-pointer flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
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
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE3D8]">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Order ID, customer name or phone..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl py-2 pl-9 pr-3 text-xs font-sans focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans text-stone-500">Status:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl py-2 px-3 text-xs font-sans cursor-pointer focus:outline-none focus:border-[#C9A25D]"
                      >
                        <option value="all">All Statuses ({orders.length})</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-[#EAE3D8] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#FAF8F5] border-b border-[#EAE3D8] text-[#8C7662] uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-4">Order ID & Date</th>
                            <th className="p-4">Customer & Address</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total Amount (COD)</th>
                            <th className="p-4">Status & Dispatch</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3EFEA]">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                                No orders matching the criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map(order => (
                              <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                                <td className="p-4">
                                  <p className="font-mono font-bold text-[#1C1815]">{order.id}</p>
                                  <p className="text-[10px] text-stone-400">
                                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </td>
                                <td className="p-4">
                                  <p className="font-medium text-[#1C1815]">{order.customerName}</p>
                                  <p className="text-[11px] text-stone-500">{order.phone}</p>
                                  <p className="text-[10px] text-stone-400 truncate max-w-xs">{order.address}, {order.city}</p>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1 max-w-xs">
                                    {order.items.map((item, i) => (
                                      <p key={i} className="text-[11px] text-stone-700 truncate">
                                        • {item.quantity}x {item.productName} ({item.metal || '18K'})
                                      </p>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="font-serif text-sm font-bold text-[#1C1815]">
                                    ${order.totalAmount.toLocaleString()}
                                  </p>
                                  <span className="text-[10px] text-stone-400">Cash on Delivery</span>
                                </td>
                                  <td className="p-4">
                                    <select
                                      value={order.status || order.orderStatus}
                                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                      className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border ${
                                        (order.status || order.orderStatus) === 'delivered'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : (order.status || order.orderStatus) === 'shipped'
                                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                                          : (order.status || order.orderStatus) === 'confirmed'
                                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                                          : (order.status || order.orderStatus) === 'cancelled'
                                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                                          : 'bg-amber-50 text-amber-800 border-amber-300'
                                      }`}
                                    >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => setSelectedOrderForInvoice(order)}
                                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE3D8] text-[#1C1815] rounded-lg border border-[#EAE3D8] font-medium flex items-center gap-1.5 ml-auto cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#C9A25D]" />
                                    <span>Invoice</span>
                                  </button>
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
                      <h3 className="font-serif text-lg text-[#1C1815]">Haute Jewellery Vault Inventory</h3>
                      <p className="text-xs font-sans text-stone-500">
                        Create, modify prices, update stock, and curate featured solitaires.
                      </p>
                    </div>
                    <button
                      onClick={handleStartAddProduct}
                      className="px-4 py-2.5 bg-[#C9A25D] hover:bg-[#B88E3E] text-[#181412] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Jewel</span>
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(prod => (
                      <div key={prod.id} className="p-4 bg-white rounded-2xl border border-[#EAE3D8] flex gap-4">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-24 h-24 object-cover rounded-xl border border-[#EAE3D8] shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-sans tracking-widest text-[#8C7662]">
                                {prod.category}
                              </span>
                              <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded ${
                                prod.stock <= 3 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                Stock: {prod.stock}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm font-medium text-[#1C1815] truncate">{prod.name}</h4>
                            <p className="font-serif text-sm font-semibold text-[#1C1815] mt-0.5">
                              ${prod.price.toLocaleString()}
                              {prod.originalPrice > prod.price && (
                                <span className="font-sans text-xs text-stone-400 line-through ml-2">
                                  ${prod.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#F3EFEA]">
                            <button
                              onClick={() => handleStartEditProduct(prod)}
                              className="flex-1 py-1.5 text-xs font-sans font-medium text-[#1C1815] bg-[#FAF8F5] hover:bg-[#EAE3D8] rounded-lg border border-[#EAE3D8] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#C9A25D]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
                <form onSubmit={handleSaveSettingsSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-[#EAE3D8] animate-in fade-in">
                  <div className="border-b border-[#F3EFEA] pb-4">
                    <h3 className="font-serif text-lg text-[#1C1815]">Boutique Identity & Contact</h3>
                    <p className="text-xs font-sans text-stone-500">
                      Configure store identity, phone numbers, and notification recipients.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={settingsForm.brandName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Owner Email (Notifications)</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">WhatsApp Number (Orders)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Boutique Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Free Delivery Threshold ($)</label>
                      <input
                        type="number"
                        value={settingsForm.freeDeliveryThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                        className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#F3EFEA]">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Boutique Settings</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Invoice Modal Overlay */}
        {selectedOrderForInvoice && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-wider">{settings.brandName.toUpperCase()}</h2>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">{settings.tagline}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-stone-800">{selectedOrderForInvoice.id}</span>
                  <p className="text-[10px] text-stone-400">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p><span className="font-semibold">Patron:</span> {selectedOrderForInvoice.customerName}</p>
                <p><span className="font-semibold">Contact:</span> {selectedOrderForInvoice.phone} • {selectedOrderForInvoice.email}</p>
                <p><span className="font-semibold">Shipping Destination:</span> {selectedOrderForInvoice.address}, {selectedOrderForInvoice.city}</p>
                <p><span className="font-semibold">Payment Method:</span> {selectedOrderForInvoice.paymentMethod}</p>
              </div>

              <div className="border-t border-b py-3 space-y-2">
                {selectedOrderForInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{item.quantity}x {item.productName} ({item.metal || '18K'})</span>
                    <span className="font-medium">${item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs space-y-1 text-right">
                <p>Subtotal: ${selectedOrderForInvoice.subtotal.toLocaleString()}</p>
                {selectedOrderForInvoice.discount > 0 && <p className="text-rose-600">Discount: -${selectedOrderForInvoice.discount.toLocaleString()}</p>}
                <p>Delivery: ${selectedOrderForInvoice.deliveryCharge.toLocaleString()}</p>
                <p className="text-base font-serif font-bold text-stone-900">
                  Total Due: ${selectedOrderForInvoice.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-[#1C1815] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#C9A25D]" />
                  <span>Print Receipt / Invoice</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Edit / Add Modal */}
        {isEditingProduct && editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsEditingProduct(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl text-[#1C1815]">
                {editingProduct.id ? 'Edit Haute Jewel Creation' : 'Cast New Jewellery Piece'}
              </h3>

              <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Creation Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Royal Solitaire Diamond Ring"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Category</label>
                    <select
                      value={editingProduct.category || 'rings'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    >
                      <option value="rings">Rings</option>
                      <option value="necklaces">Necklaces</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelets">Bracelets</option>
                      <option value="bangles">Bangles</option>
                      <option value="sets">Sets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={editingProduct.subCategory || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                      placeholder="e.g. Solitaire Rings"
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Sale Price ($) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Vault Stock Qty</label>
                    <input
                      type="number"
                      value={editingProduct.stock || 1}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => {
                      const newImages = [...(editingProduct.images || [])];
                      newImages[0] = e.target.value;
                      setEditingProduct({ ...editingProduct, images: newImages });
                    }}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFeatured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>Featured Piece</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isBestSeller)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>Best Seller Tag</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isNewArrival)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                      className="accent-[#C9A25D]"
                    />
                    <span>New Arrival Tag</span>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-5 py-2.5 border rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1C1815] text-white hover:bg-[#C9A25D] hover:text-[#1C1815] rounded-xl font-semibold cursor-pointer shadow-md"
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
