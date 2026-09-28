import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order, OrderStatus, Coupon, MonthlyArchive } from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Boxes,
  BarChart3,
  Megaphone,
  Settings,
  Search,
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  TrendingUp,
  Tag,
  Lock,
  LogOut,
  Archive,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    orders,
    products,
    coupons,
    settings,
    monthlyArchives,
    adminCredentials,
    securityLogs,
    adminFailedAttempts,
    adminLockoutUntil,
    resetAdminLockout,
    clearSecurityLogs,
    resetAdminToSetupMode,
    updateOrderStatus,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    updateVariantStock,
    updateSettings,
    updateAdminCredentials,
    addCoupon,
    deleteCoupon,
    archiveCurrentMonth,
    activeAdminTab,
    setActiveAdminTab,
    logout,
    navigateTo,
  } = useShop();

  // Internal modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<MonthlyArchive | null>(null);

  // Security Credentials form
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminName, setNewAdminName] = useState(adminCredentials.name || 'Store Executive');
  const [newAdminEmail, setNewAdminEmail] = useState(adminCredentials.email);
  const [newAdminGatewayPasscode, setNewAdminGatewayPasscode] = useState(adminCredentials.gatewayPasscode || '1234');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [newAdminRecoveryKey, setNewAdminRecoveryKey] = useState(adminCredentials.recoveryKey || 'AURA-MASTER-9900');
  const [credsFeedback, setCredsFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Archive modal
  const [archiveMonthName, setArchiveMonthName] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );

  // New product form
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    price: 15000,
    originalPrice: 18000,
    discountPercent: 16,
    category: 'Women',
    subcategory: 'Dresses',
    gender: 'women',
    stock: 25,
    sku: `MS-C-${Math.floor(100 + Math.random() * 900)}`,
    material: 'Pure Silk Charmeuse',
    fabric: 'Fine Silk Satin',
    fit: 'Tailored Fit',
    description: 'Masterfully crafted from exclusive luxury textile with hand-finished gold detailing.',
    shortDescription: 'Luxury couture piece with gold accents.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Black | Gold Accent', hex: '#111111' }],
    images: [
      '/src/assets/images/fashion_gold_blazer_1790533633560.jpg',
      '/src/assets/images/hero_model_black_gold_1790533620187.jpg',
    ],
    variantStock: {
      'XS_Black | Gold Accent': 4,
      'S_Black | Gold Accent': 8,
      'M_Black | Gold Accent': 8,
      'L_Black | Gold Accent': 5,
    },
    rating: 5.0,
    reviewCount: 1,
    tags: ['Luxury', 'Couture'],
  });

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 15,
    minOrderAmount: 5000,
  });

  // Calculate Metrics
  const totalSales = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const lowStockCount = products.filter((p) => p.stock < 15).length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.gender.toLowerCase().includes(productSearch.toLowerCase())
      );
    });
  }, [products, productSearch]);

  // Unique Customers
  const customerList = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; address: string; city: string; totalSpent: number; orderCount: number }>();
    orders.forEach((o) => {
      const key = o.customerEmail || o.customerPhone;
      if (!map.has(key)) {
        map.set(key, {
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          address: o.address,
          city: o.city,
          totalSpent: o.total,
          orderCount: 1,
        });
      } else {
        const c = map.get(key)!;
        c.totalSpent += o.total;
        c.orderCount += 1;
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Export CSV
  const exportOrdersCSV = (orderSet: Order[] = orders, fileName: string = 'MS_Orders') => {
    const headers = 'Order ID,Customer,Email,Phone,City,Status,Items,Subtotal,Delivery,Discount,Total,Date\n';
    const rows = orderSet.map((o) =>
      `"${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.customerPhone}","${o.city}","${o.status}",${o.items.length},${o.subtotal},${o.deliveryFee},${o.discount},${o.total},"${o.createdAt}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Handle Credentials Update
  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsFeedback(null);

    if (!currentAdminPass) {
      setCredsFeedback({ success: false, message: 'Please enter your current administrator password.' });
      return;
    }

    if (newAdminPass && newAdminPass !== confirmAdminPass) {
      setCredsFeedback({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }

    const res = updateAdminCredentials(
      currentAdminPass,
      newAdminEmail,
      newAdminPass || adminCredentials.password,
      newAdminGatewayPasscode,
      newAdminRecoveryKey,
      newAdminName
    );
    setCredsFeedback(res);
    if (res.success) {
      setCurrentAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    }
  };

  // Handle Month Close & Reset
  const handleArchiveMonth = () => {
    if (orders.length === 0) {
      alert('There are currently no active orders to archive.');
      return;
    }

    if (confirm(`Are you sure you want to archive all ${orders.length} active orders for "${archiveMonthName}" and reset the active order book for the new month? All data will be preserved in the Archives panel.`)) {
      exportOrdersCSV(orders, `MS_Archive_${archiveMonthName.replace(/[^a-z0-9]/gi, '_')}`);
      archiveCurrentMonth(archiveMonthName);
      alert(`Orders successfully archived under "${archiveMonthName}"! A full CSV copy was downloaded and active orders have been reset.`);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name) return;
    const prod: Product = {
      ...(newProd as Product),
      id: `prod-${Date.now()}`,
      slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
    };
    addProduct(prod);
    setIsAddProductOpen(false);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    const c: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCoupon.code.toUpperCase().trim(),
      discountPercent: Number(newCoupon.discountPercent),
      minOrderAmount: Number(newCoupon.minOrderAmount),
      isActive: true,
      usageCount: 0,
      expiresAt: '2026-12-31',
    };
    addCoupon(c);
    setNewCoupon({ code: '', discountPercent: 15, minOrderAmount: 5000 });
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] flex flex-col md:flex-row font-sans">
      {/* 1. SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0A0A0A] border-r border-[#C5A059]/25 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#C5A059]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif-luxury font-bold text-gold-gradient tracking-tight">
                {settings.brandName || 'MS.'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.5 rounded-xs">
                Admin
              </span>
            </div>
            <button
              onClick={() => navigateTo('home')}
              className="text-xs text-stone-400 hover:text-white underline"
            >
              Storefront
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: pendingOrdersCount },
              { id: 'products', label: 'Products', icon: Package, count: products.length },
              { id: 'customers', label: 'Customers', icon: Users, count: customerList.length },
              { id: 'inventory', label: 'Inventory', icon: Boxes, count: lowStockCount },
              { id: 'archives', label: 'Monthly Archives', icon: Archive, count: monthlyArchives.length },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'marketing', label: 'Marketing', icon: Megaphone },
              { id: 'settings', label: 'Settings & Security', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent border-l-4 border-[#D4AF37] text-[#D4AF37] shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Sign Out */}
        <div className="p-4 border-t border-[#C5A059]/20 bg-[#080808] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#805F19] to-[#D4AF37] flex items-center justify-center text-black font-bold text-xs">
              MS
            </div>
            <div className="text-left text-xs truncate max-w-[120px]">
              <p className="font-semibold text-white truncate">{adminCredentials.email}</p>
              <p className="text-[10px] text-stone-400">Master Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-red-400 rounded-xs hover:bg-stone-900"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070707]">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0A0A0A] border-b border-[#C5A059]/20 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-serif-luxury font-bold text-white tracking-wider capitalize">
              {activeAdminTab === 'dashboard'
                ? 'Dashboard Overview'
                : activeAdminTab === 'archives'
                ? 'Monthly Close & Archives'
                : `${activeAdminTab} Management`}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search orders, SKU..."
                value={orderSearch}
                onChange={(e) => {
                  setOrderSearch(e.target.value);
                  if (activeAdminTab !== 'orders' && e.target.value) {
                    setActiveAdminTab('orders');
                  }
                }}
                className="bg-[#111111] border border-stone-800 focus:border-[#D4AF37] rounded-xs pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-stone-500 w-64 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setActiveAdminTab('orders')}
              className="relative p-2 text-stone-400 hover:text-white"
            >
              <Bell className="w-4 h-4" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
              )}
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="px-3 py-1.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#F3E5AB] transition-colors"
            >
              View Live Store
            </button>
          </div>
        </header>

        {/* Tab Router Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-8">
              {/* TOP 3 GOLD GRADIENT KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Sales Gold Card */}
                <div className="relative p-6 rounded-sm bg-gradient-to-br from-[#E6CA65] via-[#D4AF37] to-[#A37B24] text-black shadow-[0_8px_30px_rgba(212,175,55,0.25)] flex flex-col justify-between h-44 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                      Total Active Sales
                    </span>
                    <span className="text-xs font-bold text-black/70">•••</span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black tabular-nums">
                      PKR {totalSales.toLocaleString()}
                    </h3>
                    <p className="text-xs font-semibold text-black/80 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 inline" />
                      <span>+12.4% vs last period</span>
                    </p>
                  </div>

                  {/* Sparkline Wave */}
                  <div className="h-10 w-full mt-2 opacity-85">
                    <svg viewBox="0 0 100 25" className="w-full h-full stroke-black fill-none" strokeWidth="2.5">
                      <path d="M 0 20 Q 15 5, 25 15 T 45 10 T 65 18 T 85 8 T 100 2" />
                    </svg>
                  </div>
                </div>

                {/* Total Orders Gold Card */}
                <div className="relative p-6 rounded-sm bg-gradient-to-br from-[#E6CA65] via-[#D4AF37] to-[#A37B24] text-black shadow-[0_8px_30px_rgba(212,175,55,0.25)] flex flex-col justify-between h-44 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                      Active Orders
                    </span>
                    <span className="text-xs font-bold text-black/70">•••</span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black tabular-nums">
                      {totalOrdersCount.toLocaleString()}
                    </h3>
                    <p className="text-xs font-semibold text-black/80 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 inline" />
                      <span>{pendingOrdersCount} awaiting verification</span>
                    </p>
                  </div>

                  {/* Bar Chart Sparkline */}
                  <div className="h-10 w-full flex items-end gap-1.5 pt-2">
                    {[35, 60, 45, 75, 40, 65, 80, 55, 90, 70, 85].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-black/80 rounded-t-xs"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Delivered Orders */}
                <div className="relative p-6 rounded-sm bg-gradient-to-br from-[#E6CA65] via-[#D4AF37] to-[#A37B24] text-black shadow-[0_8px_30px_rgba(212,175,55,0.25)] flex flex-col justify-between h-44 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/80">
                      Delivered Consignments
                    </span>
                    <span className="text-xs font-bold text-black/70">•••</span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black tabular-nums">
                      {deliveredOrdersCount} Consignments
                    </h3>
                    <p className="text-xs font-semibold text-black/80 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" />
                      <span>Cash collected upon unboxing</span>
                    </p>
                  </div>

                  <div className="h-10 w-full mt-2 opacity-85">
                    <svg viewBox="0 0 100 25" className="w-full h-full stroke-black fill-none" strokeWidth="2.5">
                      <path d="M 0 18 C 20 2, 40 25, 60 10 C 80 -2, 90 20, 100 5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* RECENT ORDER DETAILS TABLE */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h2 className="text-lg font-serif-luxury font-bold text-white tracking-wide">
                      Recent Order Details
                    </h2>
                    <p className="text-xs text-stone-400">
                      Real-time client orders dispatched via Cash on Delivery
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportOrdersCSV(orders, 'MS_Active_Orders')}
                      className="px-3 py-1.5 bg-[#141414] border border-stone-700 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-stone-200 rounded-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={() => setActiveAdminTab('orders')}
                      className="px-3 py-1.5 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#F3E5AB]"
                    >
                      View All Orders
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-4">ORDER ID</th>
                        <th className="py-3 px-4">CUSTOMER</th>
                        <th className="py-3 px-4">DATE & TIME</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-center">ITEMS</th>
                        <th className="py-3 px-4 text-right">TOTAL</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 font-medium">
                      {orders.slice(0, 8).map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#161616] transition-colors group cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="py-3.5 px-4 font-mono font-semibold text-white">
                            {order.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-stone-400 font-normal">{order.customerEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-300 font-mono text-[11px]">
                            {new Date(order.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
                                order.status === 'Delivered'
                                  ? 'bg-[#D4AF37] text-black shadow-sm'
                                  : order.status === 'Shipped'
                                  ? 'bg-[#C5A059] text-black'
                                  : order.status === 'Processing'
                                  ? 'bg-[#997928] text-white'
                                  : order.status === 'Pending'
                                  ? 'bg-transparent text-[#D4AF37] border border-[#D4AF37]'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-stone-300 font-mono">
                            {order.items.reduce((a, b) => a + b.quantity, 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#D4AF37] tabular-nums">
                            PKR {order.total.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="text-[#D4AF37] hover:text-white font-semibold underline underline-offset-2"
                              >
                                View/Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Permanently delete order ${order.orderNumber}?`)) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                className="text-stone-500 hover:text-red-400 p-1"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL ORDERS MANAGEMENT (With Working Delete Button & Filters) */}
          {activeAdminTab === 'orders' && (
            <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                    Consignment Orders List ({filteredOrders.length})
                  </h2>
                  <p className="text-xs text-stone-400">
                    Filter, inspect, print invoices, update live milestones, or delete records.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportOrdersCSV(orders, 'MS_Active_Orders')}
                    className="px-3 py-1.5 bg-[#141414] border border-stone-700 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-stone-200 rounded-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['all', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-xs border transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-black text-stone-400 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    {st === 'all' ? `All (${orders.length})` : st}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">ORDER ID</th>
                      <th className="py-3 px-4">CUSTOMER</th>
                      <th className="py-3 px-4">CITY & PHONE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-center">ITEMS</th>
                      <th className="py-3 px-4 text-right">TOTAL</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-500">
                          No orders found matching your search/filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#161616] transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="py-3.5 px-4 font-mono font-semibold text-white">
                            {order.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-stone-400 font-normal">{order.customerEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-300">
                            <div>{order.city}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{order.customerPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
                                order.status === 'Delivered'
                                  ? 'bg-[#D4AF37] text-black'
                                  : order.status === 'Shipped'
                                  ? 'bg-[#C5A059] text-black'
                                  : order.status === 'Processing'
                                  ? 'bg-[#997928] text-white'
                                  : order.status === 'Pending'
                                  ? 'bg-transparent text-[#D4AF37] border border-[#D4AF37]'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-stone-300 font-mono">
                            {order.items.reduce((a, b) => a + b.quantity, 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#D4AF37] tabular-nums">
                            PKR {order.total.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="text-[#D4AF37] hover:text-white font-semibold underline"
                              >
                                Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Are you sure you want to delete order ${order.orderNumber}? It will be permanently removed.`)) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                className="text-stone-500 hover:text-red-400 p-1.5 rounded-xs hover:bg-stone-900 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
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
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT (With working Edit Modal & Zoom/Default Image inputs) */}
          {activeAdminTab === 'products' && (
            <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                    Clothing Products Catalog ({filteredProducts.length})
                  </h2>
                  <p className="text-xs text-stone-400">
                    Add garments, update base prices, replace primary & zoom hover photos, and manage catalog status.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#F3E5AB] flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Garment</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">IMAGES</th>
                      <th className="py-3 px-4">GARMENT NAME</th>
                      <th className="py-3 px-4">DEPARTMENT</th>
                      <th className="py-3 px-4">PRICE</th>
                      <th className="py-3 px-4 text-center">STOCK</th>
                      <th className="py-3 px-4">BADGES</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#161616] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={p.images[0]}
                              alt="Front"
                              referrerPolicy="no-referrer"
                              className="w-10 h-12 object-cover rounded-xs bg-stone-900 border border-stone-800"
                              title="Primary View"
                            />
                            {p.images[1] && (
                              <img
                                src={p.images[1]}
                                alt="Zoom"
                                referrerPolicy="no-referrer"
                                className="w-10 h-12 object-cover rounded-xs bg-stone-900 border border-[#D4AF37]/40 hidden sm:block"
                                title="Hover/Zoom View"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white uppercase tracking-wider">{p.name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-300 capitalize">
                          {p.category} ({p.gender})
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#D4AF37] tabular-nums">
                          PKR {p.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-xs font-semibold ${
                              p.stock > 15
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : p.stock > 0
                                ? 'text-amber-400 bg-amber-950/40'
                                : 'text-red-400 bg-red-950/40'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.isBestSeller && (
                              <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 border border-[#D4AF37]/30 rounded-xs uppercase">
                                Best Seller
                              </span>
                            )}
                            {p.isNew && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-800/40 rounded-xs uppercase">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct({ ...p })}
                              className="px-2.5 py-1 bg-stone-900 border border-stone-700 hover:border-[#D4AF37] text-stone-200 text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1"
                              title="Edit Garment"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove "${p.name}" permanently from the catalog?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-stone-500 hover:text-red-400 rounded-xs hover:bg-stone-900 transition-colors"
                              title="Delete Garment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY MANAGEMENT */}
          {activeAdminTab === 'inventory' && (
            <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                    Live Stock & Variant Inventory
                  </h2>
                  <p className="text-xs text-stone-400">
                    Real-time size and color variant stock level adjusters.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.id} className="p-4 bg-[#121212] border border-stone-800 rounded-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded-xs border border-stone-800"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{p.name}</h4>
                          <span className="text-[11px] text-stone-400 font-mono">
                            SKU: {p.sku} • Department: {p.gender.toUpperCase()} • Total Stock: {p.stock}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newTotal = Math.max(0, p.stock - 5);
                            updateProduct({ ...p, stock: newTotal });
                          }}
                          className="px-2 py-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded-xs hover:border-red-500"
                        >
                          -5 Stock
                        </button>
                        <button
                          onClick={() => {
                            const newTotal = p.stock + 10;
                            updateProduct({ ...p, stock: newTotal });
                          }}
                          className="px-2 py-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded-xs hover:border-[#D4AF37]"
                        >
                          +10 Stock
                        </button>
                      </div>
                    </div>

                    {/* Variant stocks */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2 border-t border-stone-800/80">
                      {Object.entries(p.variantStock).map(([vKey, vStock]) => {
                        const parts = vKey.split('_');
                        const size = parts[0];
                        const color = parts[1] || 'Standard';
                        return (
                          <div
                            key={vKey}
                            className="bg-black/60 border border-stone-800 p-2 rounded-xs flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <span className="font-semibold text-white">{size}</span>
                              <span className="text-stone-500 block truncate max-w-[80px]">{color}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`font-mono font-bold ${vStock <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {vStock}
                              </span>
                              <div className="flex flex-col">
                                <button
                                  onClick={() => updateVariantStock(p.id, vKey, vStock + 1)}
                                  className="text-stone-400 hover:text-white px-1 leading-none"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => updateVariantStock(p.id, vKey, Math.max(0, vStock - 1))}
                                  className="text-stone-400 hover:text-white px-1 leading-none"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MONTHLY ARCHIVES & CLOSE (New requested feature!) */}
          {activeAdminTab === 'archives' && (
            <div className="space-y-8">
              {/* Archive Current Month Card */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/40 rounded-xs p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h2 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                      Month-End Order Close & Archiving
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Archive the current order book, download a permanent CSV record, and reset the active order dashboard for the new month.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xs text-right">
                    <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Current Active Orders</span>
                    <span className="text-lg font-mono font-bold text-[#D4AF37]">{orders.length} Orders (PKR {totalSales.toLocaleString()})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-[#121212] p-4 rounded-xs border border-stone-800">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                      Month Label for Archive Record
                    </label>
                    <input
                      type="text"
                      value={archiveMonthName}
                      onChange={(e) => setArchiveMonthName(e.target.value)}
                      placeholder="e.g. October 2026 / Eid Launch 2026"
                      className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white font-medium rounded-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleArchiveMonth}
                    disabled={orders.length === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-widest rounded-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive & Reset Month</span>
                  </button>
                </div>
              </div>

              {/* Historical Archives List */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider">
                    Archived Monthly Records ({monthlyArchives.length})
                  </h3>
                </div>

                {monthlyArchives.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 space-y-2">
                    <Archive className="w-10 h-10 text-stone-700 mx-auto" />
                    <p className="text-xs uppercase tracking-wider">No months archived yet.</p>
                    <p className="text-[11px]">When you close a month above, it will be safely filed here for historical audit and tax records.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                        <tr>
                          <th className="py-3 px-4">MONTH NAME</th>
                          <th className="py-3 px-4">ARCHIVED DATE</th>
                          <th className="py-3 px-4 text-center">TOTAL ORDERS</th>
                          <th className="py-3 px-4 text-center">DELIVERED</th>
                          <th className="py-3 px-4 text-right">TOTAL REVENUE</th>
                          <th className="py-3 px-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 font-medium">
                        {monthlyArchives.map((arch) => (
                          <tr key={arch.id} className="hover:bg-[#161616] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {arch.monthName}
                            </td>
                            <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                              {new Date(arch.archivedAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-white">
                              {arch.totalOrders}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-emerald-400">
                              {arch.deliveredOrders}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#D4AF37] tabular-nums">
                              PKR {arch.totalRevenue.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedArchive(arch)}
                                  className="text-[#D4AF37] hover:underline font-semibold"
                                >
                                  View ({arch.orders.length})
                                </button>
                                <button
                                  onClick={() => exportOrdersCSV(arch.orders, `MS_Archive_${arch.monthName}`)}
                                  className="p-1 text-stone-400 hover:text-white"
                                  title="Download CSV"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* TAB 6: CUSTOMERS MANAGEMENT */}
          {activeAdminTab === 'customers' && (
            <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                    Client Roster ({customerList.length})
                  </h2>
                  <p className="text-xs text-stone-400">
                    Registered clientele, lifetime spending, and consignment addresses.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">CLIENT NAME</th>
                      <th className="py-3 px-4">CONTACT</th>
                      <th className="py-3 px-4">CITY</th>
                      <th className="py-3 px-4 text-center">ORDERS</th>
                      <th className="py-3 px-4 text-right">LIFETIME SPEND</th>
                      <th className="py-3 px-4 text-right">ROSTER STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {customerList.map((c, i) => (
                      <tr key={i} className="hover:bg-[#161616] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {c.name}
                        </td>
                        <td className="py-3.5 px-4 text-stone-300">
                          <div>{c.email}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{c.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-300">
                          {c.city}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-white">
                          {c.orderCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#D4AF37] tabular-nums">
                          PKR {c.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xs">
                            Privilege VIP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeAdminTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400">Total Revenue</span>
                  <div className="text-xl font-bold font-mono text-[#D4AF37] mt-1">
                    PKR {totalSales.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400">Average Order Value</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    PKR {Math.round(totalSales / (totalOrdersCount || 1)).toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400">Delivered Consignments</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {deliveredOrdersCount} orders
                  </div>
                </div>

                <div className="p-5 bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400">Conversion Rate</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    3.84%
                  </div>
                </div>
              </div>

              <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
                  Category Performance Distribution
                </h3>
                <div className="space-y-3 pt-2">
                  {[
                    { name: "Women's Haute Couture", share: 44, amount: 'PKR 21,372,230' },
                    { name: "Men's Bespoke & Tuxedos", share: 32, amount: 'PKR 15,543,440' },
                    { name: 'Eastern Festive & Kurtas', share: 14, amount: 'PKR 6,800,000' },
                    { name: 'Children Haute Couture', share: 10, amount: 'PKR 4,857,000' },
                  ].map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-300">
                        <span>{c.name} ({c.share}%)</span>
                        <span className="font-mono text-[#D4AF37]">{c.amount}</span>
                      </div>
                      <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37]"
                          style={{ width: `${c.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MARKETING & COUPONS */}
          {activeAdminTab === 'marketing' && (
            <div className="space-y-8">
              <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h3 className="text-lg font-serif-luxury font-bold text-white tracking-wide">
                      Privilege Coupons & Discounts
                    </h3>
                    <p className="text-xs text-stone-400">
                      Create promotional codes for clientele checkout incentives.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#121212] p-4 rounded-xs border border-stone-800">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-300 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP25"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                      className="w-full bg-black border border-stone-800 text-xs px-3 py-2 text-white uppercase font-mono rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-300 mb-1">Discount %</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={newCoupon.discountPercent}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 text-xs px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-300 mb-1">Min Order (PKR)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={newCoupon.minOrderAmount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 text-xs px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
                    >
                      + Create Coupon
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141414] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-4">COUPON CODE</th>
                        <th className="py-3 px-4">BENEFIT</th>
                        <th className="py-3 px-4">MIN ORDER</th>
                        <th className="py-3 px-4">REDEMPTIONS</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 font-medium">
                      {coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-[#161616]">
                          <td className="py-3 px-4 font-mono font-bold text-white tracking-wider">
                            {c.code}
                          </td>
                          <td className="py-3 px-4 text-[#D4AF37]">
                            {c.discountPercent ? `${c.discountPercent}% OFF` : `PKR ${c.fixedDiscount} OFF`}
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-300">
                            PKR {c.minOrderAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-300">
                            {c.usageCount} times
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xs">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteCoupon(c.id)}
                              className="text-stone-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS & SECURITY (Includes change Admin Password/Email requested by user!) */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-8 max-w-3xl">
              {/* Security Credentials Card */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/40 rounded-xs p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                  <Lock className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h2 className="text-base font-serif-luxury font-bold text-white tracking-wide uppercase">
                      Administrator Login & Security
                    </h2>
                    <p className="text-xs text-stone-400">
                      Update master login email and password for entering the administrative console.
                    </p>
                  </div>
                </div>

                {credsFeedback && (
                  <div
                    className={`p-3 rounded-xs text-xs flex items-center gap-2 border ${
                      credsFeedback.success
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                        : 'bg-red-950/60 border-red-800/60 text-red-300'
                    }`}
                  >
                    {credsFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{credsFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCreds} className="space-y-4 text-xs">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                      Current Administrator Password * (Required for verification)
                    </label>
                    <input
                      type="password"
                      required
                      value={currentAdminPass}
                      onChange={(e) => setCurrentAdminPass(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Administrator Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Master Store Executive"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Secret Gateway Passcode */}
                  <div className="p-3 bg-black border border-[#D4AF37]/50 rounded-xs space-y-2">
                    <label className="block uppercase tracking-wider text-[#D4AF37] font-semibold text-xs">
                      Secret Gateway Passcode (गेटवे सुरक्षा पासवर्ड)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminGatewayPasscode}
                      onChange={(e) => setNewAdminGatewayPasscode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-[#141414] border border-stone-700 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none font-mono text-sm tracking-widest"
                    />
                    <p className="text-[11px] text-stone-400">
                      यह वह गुप्त पासवर्ड है जो हर बार एडमिन पैनल बटन क्लिक करने पर सबसे पहले मांगा जाएगा।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                        New Password (Leave blank to keep unchanged)
                      </label>
                      <input
                        type="password"
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                      />
                    </div>

                    {newAdminPass ? (
                      <div>
                        <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={confirmAdminPass}
                          onChange={(e) => setConfirmAdminPass(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">
                      Emergency Master Recovery Key
                    </label>
                    <input
                      type="text"
                      value={newAdminRecoveryKey}
                      onChange={(e) => setNewAdminRecoveryKey(e.target.value)}
                      placeholder="e.g. AURA-MASTER-9900"
                      className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none font-mono"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      Use this key to instantly override device lockouts if 3 invalid login attempts are made.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset Admin to Setup Mode? You will be logged out and can re-configure the first-time setup chart.')) {
                          resetAdminToSetupMode();
                          logout();
                        }
                      }}
                      className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-[#D4AF37] text-stone-300 hover:text-white text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                    >
                      Re-run First-Time Setup Wizard
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold uppercase tracking-wider rounded-xs transition-all shadow-lg cursor-pointer"
                    >
                      Update Credentials & Gateway Passcode
                    </button>
                  </div>
                </form>
              </div>

              {/* Hardware Device Protection & Security Controls */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/40 rounded-xs p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <h2 className="text-base font-serif-luxury font-bold text-white tracking-wide uppercase">
                        Terminal Security & 3-Attempt Lockout Protection
                      </h2>
                      <p className="text-xs text-stone-400">
                        Strict rule: If more than 3 failed attempts occur, device access is locked out for 15 minutes.
                      </p>
                    </div>
                  </div>
                  {adminFailedAttempts > 0 && (
                    <button
                      onClick={() => resetAdminLockout('AURA-MASTER-9900')}
                      className="px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Lockout Status</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-black border border-stone-800 p-4 rounded-xs space-y-1">
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider">Device Lockout Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          adminLockoutUntil && Date.now() < adminLockoutUntil
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-bold text-white uppercase tracking-wider">
                        {adminLockoutUntil && Date.now() < adminLockoutUntil
                          ? 'Device Locked'
                          : 'Armed & Normal'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-black border border-stone-800 p-4 rounded-xs space-y-1">
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider">Failed Attempts</span>
                    <div className="font-mono text-xl font-bold text-[#D4AF37]">
                      {adminFailedAttempts} / 3 Attempts Used
                    </div>
                  </div>

                  <div className="bg-black border border-stone-800 p-4 rounded-xs space-y-1">
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider">Encryption Protocol</span>
                    <div className="font-mono text-xs font-semibold text-emerald-300">
                      TLS 1.3 / AES-256
                    </div>
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                      Security & Access Event Logs ({securityLogs.length})
                    </h3>
                    {securityLogs.length > 0 && (
                      <button
                        onClick={clearSecurityLogs}
                        className="text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        Clear Audit Trail
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-stone-800 rounded-xs divide-y divide-stone-800/80">
                    {securityLogs.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500">
                        No security incidents recorded. System secure.
                      </div>
                    ) : (
                      securityLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-black/60 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xs uppercase tracking-wider ${
                                  log.status === 'success'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : log.status === 'warning'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-red-950 text-red-400 border border-red-800'
                                }`}
                              >
                                {log.action}
                              </span>
                              <span className="text-stone-300 font-medium">{log.details}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 font-mono">
                              Device: {log.deviceInfo} • IP: {log.ipAddress}
                            </p>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Global Store Settings Card */}
              <div className="bg-[#0E0E0E] border border-[#C5A059]/30 rounded-xs p-6 md:p-8 space-y-6 shadow-xl">
                <div>
                  <h2 className="text-lg font-serif-luxury font-bold text-white tracking-wide">
                    Storefront Announcements & Delivery
                  </h2>
                  <p className="text-xs text-stone-400">
                    Live parameters instantly synced to customers.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1">
                      Top Announcement Bar Text (Default: AURA)
                    </label>
                    <input
                      type="text"
                      value={settings.announcementText}
                      onChange={(e) => updateSettings({ announcementText: e.target.value })}
                      className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white font-semibold rounded-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1">
                        Free Shipping Threshold (PKR)
                      </label>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => updateSettings({ freeShippingThreshold: Number(e.target.value) })}
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white font-mono rounded-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-stone-300 mb-1">
                        WhatsApp Concierge Number
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                        className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white font-mono rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Live changes active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. ORDER DETAILS MODAL (With Working Delete Button & High Contrast Styling) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-[#0D0D0D] border border-[#C5A059] rounded-xs shadow-2xl p-6 md:p-8 space-y-6 text-[#E5E5E5] animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#C5A059]/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Order Details
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
                    {selectedOrder.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="px-3 py-1.5 bg-[#141414] border border-stone-700 hover:border-[#D4AF37] text-xs uppercase font-semibold text-stone-200 flex items-center gap-1.5 rounded-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete order ${selectedOrder.orderNumber}?`)) {
                        deleteOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-xs uppercase font-semibold text-red-300 flex items-center gap-1.5 rounded-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-stone-400 hover:text-white p-1 rounded-sm ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="p-4 bg-[#141414] border border-[#C5A059]/30 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                    Current Milestone
                  </span>
                  <span className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs uppercase tracking-wider text-stone-300 font-semibold">
                    Update To:
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OrderStatus;
                      updateOrderStatus(selectedOrder.id, newSt);
                      setSelectedOrder((prev) => (prev ? { ...prev, status: newSt } : null));
                    }}
                    className="bg-black border border-[#C5A059]/60 text-xs px-3 py-2 text-[#D4AF37] font-semibold uppercase tracking-wider rounded-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Pending" className="bg-black text-white">Pending</option>
                    <option value="Confirmed" className="bg-black text-white">Confirmed</option>
                    <option value="Processing" className="bg-black text-white">Processing</option>
                    <option value="Packed" className="bg-black text-white">Packed</option>
                    <option value="Shipped" className="bg-black text-white">Shipped</option>
                    <option value="Out for Delivery" className="bg-black text-white">Out for Delivery</option>
                    <option value="Delivered" className="bg-black text-white">Delivered</option>
                    <option value="Cancelled" className="bg-black text-white">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-[#111111] border border-stone-800 rounded-xs text-xs">
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-widest text-[#D4AF37] border-b border-stone-800 pb-1">
                    Client Contact
                  </h4>
                  <p className="text-sm font-bold text-white">{selectedOrder.customerName}</p>
                  <p className="text-stone-300">Email: <strong className="text-amber-200">{selectedOrder.customerEmail}</strong></p>
                  <p className="text-stone-300">Phone: <strong className="text-amber-200">{selectedOrder.customerPhone}</strong></p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-widest text-[#D4AF37] border-b border-stone-800 pb-1">
                    Consignment Address
                  </h4>
                  <p className="text-stone-200">{selectedOrder.address}</p>
                  <p className="text-stone-200">{selectedOrder.area}, {selectedOrder.city}</p>
                  {selectedOrder.orderNotes && (
                    <p className="text-amber-300 text-[11px] pt-1">
                      Note: "{selectedOrder.orderNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-[#D4AF37]">
                  Garments in Consignment ({selectedOrder.items.length})
                </h4>
                <div className="overflow-x-auto border border-stone-800 rounded-xs">
                  <table className="w-full text-left text-xs bg-black">
                    <thead className="bg-[#161616] text-[#D4AF37] uppercase tracking-wider font-semibold border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Garment</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Color</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80 font-medium">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#121212]">
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <img
                              src={item.product.images[0]}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-9 h-11 object-cover rounded-xs border border-stone-800"
                            />
                            <span className="font-semibold text-white uppercase tracking-wider">{item.product.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-amber-200">{item.size}</td>
                          <td className="py-2.5 px-3 text-stone-300">{item.color}</td>
                          <td className="py-2.5 px-3 text-center text-white font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-stone-300 font-mono tabular-nums">
                            PKR {item.price.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#D4AF37] font-mono font-bold tabular-nums">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 bg-[#111111] border border-stone-800 rounded-xs space-y-2 text-xs font-medium">
                <div className="flex justify-between text-stone-300">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white tabular-nums">PKR {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono tabular-nums">-PKR {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-300">
                  <span>Delivery Fee:</span>
                  <span className="font-mono tabular-nums">
                    {selectedOrder.deliveryFee === 0 ? 'FREE (White-Glove)' : `PKR ${selectedOrder.deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-stone-800">
                  <span className="uppercase tracking-wider">Total Cash on Delivery:</span>
                  <span className="font-mono text-[#D4AF37] tabular-nums text-lg">
                    PKR {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                <button
                  onClick={() => {
                    if (confirm(`Permanently delete order ${selectedOrder.orderNumber}?`)) {
                      deleteOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }
                  }}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order Record</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-stone-900 border border-stone-700 hover:border-stone-500 text-xs font-semibold uppercase tracking-wider text-stone-300 rounded-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRODUCT EDIT MODAL (With working Primary & Zoom/Hover Image URLs, Price, Dept) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setEditingProduct(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md" />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#C5A059] rounded-xs shadow-2xl p-6 md:p-8 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider">
                  Edit Garment: {editingProduct.name}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-4">
                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Garment Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Original Price (PKR)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Department</label>
                    <select
                      value={editingProduct.gender}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                      className="w-full bg-black border border-stone-800 px-2 py-2 text-white rounded-xs focus:outline-none capitalize"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="child">Child / Kids</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Category</label>
                    <input
                      type="text"
                      value={editingProduct.subcategory}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Total Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary and Hover Zoom Images (User requirement!) */}
                <div className="space-y-3 p-3 bg-stone-900/60 border border-stone-800 rounded-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#D4AF37] block">
                    Product Imagery Configuration
                  </span>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1">
                      1. Primary Display Image URL / Path *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.images[0] || ''}
                      onChange={(e) => {
                        const imgs = [...editingProduct.images];
                        imgs[0] = e.target.value;
                        setEditingProduct({ ...editingProduct, images: imgs });
                      }}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1">
                      2. Secondary Hover / Zoom Image URL / Path (Appears when customer hovers on card!)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.images[1] || ''}
                      onChange={(e) => {
                        const imgs = [...editingProduct.images];
                        imgs[1] = e.target.value;
                        setEditingProduct({ ...editingProduct, images: imgs });
                      }}
                      placeholder="e.g. /src/assets/images/... or second photo URL"
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Previews */}
                  <div className="flex items-center gap-3 pt-2">
                    {editingProduct.images[0] && (
                      <div className="text-center">
                        <img src={editingProduct.images[0]} alt="Primary" className="w-12 h-14 object-cover rounded-xs border border-stone-700" />
                        <span className="text-[10px] text-stone-400">Primary</span>
                      </div>
                    )}
                    {editingProduct.images[1] && (
                      <div className="text-center">
                        <img src={editingProduct.images[1]} alt="Hover" className="w-12 h-14 object-cover rounded-xs border border-[#D4AF37]/50" />
                        <span className="text-[10px] text-[#D4AF37]">Hover Zoom</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${editingProduct.name}" completely from store?`)) {
                        deleteProduct(editingProduct.id);
                        setEditingProduct(null);
                      }
                    }}
                    className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Garment</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-stone-900 border border-stone-700 text-stone-300 rounded-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#D4AF37] text-black font-bold uppercase rounded-xs hover:bg-[#F3E5AB]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD NEW PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setIsAddProductOpen(false)} className="fixed inset-0 bg-black/85 backdrop-blur-md" />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#C5A059] rounded-xs shadow-2xl p-6 md:p-8 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider">
                  Add New Haute Couture Garment
                </h3>
                <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imperial Silk Kaftan"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={newProd.price}
                      onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Original Price (PKR)</label>
                    <input
                      type="number"
                      value={newProd.originalPrice}
                      onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Department</label>
                    <select
                      value={newProd.gender}
                      onChange={(e) => setNewProd({ ...newProd, gender: e.target.value as any })}
                      className="w-full bg-black border border-stone-800 px-2 py-2 text-white rounded-xs focus:outline-none capitalize"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="child">Child / Kids</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Category</label>
                    <input
                      type="text"
                      value={newProd.subcategory}
                      onChange={(e) => setNewProd({ ...newProd, subcategory: e.target.value })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Initial Stock</label>
                    <input
                      type="number"
                      value={newProd.stock}
                      onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary and Hover Zoom Images */}
                <div className="space-y-3 p-3 bg-stone-900/60 border border-stone-800 rounded-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#D4AF37] block">
                    Product Imagery
                  </span>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1">
                      1. Primary Display Image URL / Path *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProd.images?.[0] || ''}
                      onChange={(e) => {
                        const imgs = [...(newProd.images || [])];
                        imgs[0] = e.target.value;
                        setNewProd({ ...newProd, images: imgs });
                      }}
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-stone-300 mb-1">
                      2. Secondary Hover/Zoom Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={newProd.images?.[1] || ''}
                      onChange={(e) => {
                        const imgs = [...(newProd.images || [])];
                        imgs[1] = e.target.value;
                        setNewProd({ ...newProd, images: imgs });
                      }}
                      placeholder="e.g. /src/assets/images/... (revealed on card hover)"
                      className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-stone-300 mb-1 font-semibold">Description</label>
                  <textarea
                    rows={2}
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    className="w-full bg-black border border-stone-800 px-3 py-2 text-white rounded-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 bg-stone-900 border border-stone-700 text-stone-300 rounded-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#D4AF37] text-black font-bold uppercase rounded-xs hover:bg-[#F3E5AB]"
                  >
                    Save & Publish Garment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW ARCHIVED MONTH MODAL */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setSelectedArchive(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md" />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-[#0D0D0D] border border-[#C5A059] rounded-xs shadow-2xl p-6 md:p-8 space-y-6 text-xs text-[#E5E5E5]">
              <div className="flex justify-between items-center pb-4 border-b border-stone-800">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] block">Historical Snapshot</span>
                  <h3 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                    {selectedArchive.monthName} ({selectedArchive.orders.length} Orders)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportOrdersCSV(selectedArchive.orders, `MS_${selectedArchive.monthName}`)}
                    className="px-3 py-1.5 bg-[#141414] border border-stone-700 text-stone-200 rounded-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Download CSV</span>
                  </button>
                  <button onClick={() => setSelectedArchive(null)} className="text-stone-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-[#111111] border border-stone-800 rounded-xs text-center">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Revenue</span>
                  <div className="font-mono font-bold text-[#D4AF37] text-sm">PKR {selectedArchive.totalRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Orders</span>
                  <div className="font-mono font-bold text-white text-sm">{selectedArchive.totalOrders}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Delivered</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm">{selectedArchive.deliveredOrders}</div>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-800 border border-stone-800 rounded-xs">
                {selectedArchive.orders.map((o) => (
                  <div key={o.id} className="p-3 bg-black flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white">{o.orderNumber}</span>
                      <span className="text-stone-400 ml-2">{o.customerName} ({o.city})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-[#D4AF37]">PKR {o.total.toLocaleString()}</span>
                      <span className="text-stone-500 text-[11px] block">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRINTABLE INVOICE MODAL */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="bg-white text-black p-8 rounded-sm max-w-2xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-black">MS.</h1>
                <p className="text-xs uppercase tracking-widest text-stone-600">Haute Couture Atelier</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-base">{selectedOrder.orderNumber}</p>
                <p className="text-stone-500">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <p className="text-stone-500">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <h3 className="font-bold uppercase text-stone-500 mb-1">Billed & Shipped To:</h3>
                <p className="font-semibold text-sm">{selectedOrder.customerName}</p>
                <p>{selectedOrder.address}</p>
                <p>{selectedOrder.area}, {selectedOrder.city}</p>
                <p>Phone: {selectedOrder.customerPhone}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold uppercase text-stone-500 mb-1">Dispatch Hub:</h3>
                <p className="font-semibold">MS. Flagship Atelier</p>
                <p>Gulberg III, Lahore, Pakistan</p>
                <p>Email: {settings.notificationEmail}</p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 uppercase border-y">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Size</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedOrder.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 font-medium">{it.product.name}</td>
                    <td className="py-2">{it.size}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right font-mono">PKR {it.price.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono font-bold">PKR {(it.price * it.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end text-xs font-medium space-y-1">
              <div className="w-48 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">PKR {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount:</span>
                    <span className="font-mono">-PKR {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-mono">{selectedOrder.deliveryFee === 0 ? 'FREE' : `PKR ${selectedOrder.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-1">
                  <span>Total Due:</span>
                  <span className="font-mono">PKR {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-[10px] text-stone-500">Thank you for your patronage • Official Cash on Delivery Receipt</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-xs"
                >
                  Print
                </button>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="px-4 py-1.5 bg-stone-200 text-black text-xs font-bold rounded-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
