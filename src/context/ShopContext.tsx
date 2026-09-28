import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, Coupon, StoreSettings, UserAccount, AdminCredentials, MonthlyArchive, SecurityLog } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS, INITIAL_COUPONS, INITIAL_SETTINGS } from '../data/initialData';

export type AppView =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'track-order'
  | 'wishlist'
  | 'admin'
  | 'account'
  | 'about'
  | 'contact'
  | 'faq'
  | 'size-guide';

const DEFAULT_ADMIN_CREDS: AdminCredentials = {
  name: 'Store Owner',
  email: 'admin@ms.com',
  password: 'admin123',
  gatewayPasscode: '1234',
  isConfigured: false,
  recoveryKey: 'AURA-MASTER-9900',
  lastUpdated: new Date().toISOString(),
};

const INITIAL_SECURITY_LOGS: SecurityLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    ipAddress: '192.168.1.104 (Encrypted Local Proxy)',
    deviceInfo: 'Authorized Admin Terminal (macOS / Chrome)',
    action: 'LOGIN_SUCCESS',
    details: 'Master Administrator authorized session started.',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    ipAddress: '192.168.1.104 (Encrypted Local Proxy)',
    deviceInfo: 'Authorized Admin Terminal (macOS / Chrome)',
    action: 'LOGIN_SUCCESS',
    details: 'Store parameters and inventory checked.',
    status: 'success',
  },
];

interface ShopContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  settings: StoreSettings;
  monthlyArchives: MonthlyArchive[];
  
  // Auth state
  currentUser: UserAccount | null;
  isAdminLoggedIn: boolean;
  adminCredentials: AdminCredentials;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'admin';
  setAuthModalMode: (mode: 'login' | 'signup' | 'admin') => void;
  
  // Security & Admin Lockout
  adminFailedAttempts: number;
  adminLockoutUntil: number | null;
  securityLogs: SecurityLog[];
  isGatewayUnlocked: boolean;
  setIsGatewayUnlocked: (unlocked: boolean) => void;
  initializeAdmin: (data: {
    name: string;
    email: string;
    password: string;
    gatewayPasscode: string;
    recoveryKey?: string;
  }) => { success: boolean; message: string };
  verifyGatewayPasscode: (passcode: string) => {
    success: boolean;
    message: string;
    remainingAttempts?: number;
    locked?: boolean;
    remainingSeconds?: number;
  };
  adminLogin: (email: string, password: string) => {
    success: boolean;
    message: string;
    remainingAttempts?: number;
    locked?: boolean;
    remainingSeconds?: number;
  };
  resetAdminLockout: (recoveryKey?: string) => { success: boolean; message: string };
  clearSecurityLogs: () => void;
  resetAdminToSetupMode: () => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  activeAdminTab: 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'analytics' | 'marketing' | 'archives' | 'settings';
  setActiveAdminTab: (tab: 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'analytics' | 'marketing' | 'archives' | 'settings') => void;
  adminSelectedOrderId: string | null;
  setAdminSelectedOrderId: (id: string | null) => void;
  
  // Cart & Pricing
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  freeShippingProgress: number;
  amountUntilFreeShipping: number;
  deliveryDistanceKm: number;
  setDeliveryDistanceKm: (km: number) => void;
  calculateDeliveryFee: (distanceKm: number, subtotalAmount?: number) => number;
  
  // Auth Actions
  users: UserAccount[];
  deleteCustomer: (emailOrPhone: string) => void;
  login: (email: string, password: string) => { success: boolean; role?: 'admin' | 'customer'; message: string };
  signup: (userData: { name: string; email: string; password: string; phone: string; city: string; address: string }) => { success: boolean; message: string };
  logout: () => void;
  updateAdminCredentials: (
    currentPassword: string,
    newEmail: string,
    newPassword: string,
    newGatewayPasscode?: string,
    newRecoveryKey?: string,
    newName?: string
  ) => { success: boolean; message: string };
  
  // Cart Actions
  addToCart: (product: Product, size: string, color: string, quantity: number) => { success: boolean; message: string };
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postalCode?: string;
    notes?: string;
  }) => Order;
  
  // Admin & Data Management
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  deleteOrder: (orderId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateVariantStock: (productId: string, variantKey: string, newStock: number) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  archiveCurrentMonth: (monthLabel?: string) => { success: boolean; archive: MonthlyArchive };
  deleteArchive: (archiveId: string) => void;
  restoreArchive: (archiveId: string) => void;
  navigateTo: (view: AppView, productId?: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ms_products_v2');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ms_orders_v2');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Monthly Archives
  const [monthlyArchives, setMonthlyArchives] = useState<MonthlyArchive[]>(() => {
    try {
      const saved = localStorage.getItem('ms_monthly_archives');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem('ms_admin_creds');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_ADMIN_CREDS,
          ...parsed,
          gatewayPasscode: parsed.gatewayPasscode || '1234',
          isConfigured: parsed.isConfigured !== undefined ? parsed.isConfigured : false,
        };
      }
      return DEFAULT_ADMIN_CREDS;
    } catch {
      return DEFAULT_ADMIN_CREDS;
    }
  });

  // Gateway Security Passcode Unlocked State
  const [isGatewayUnlocked, setIsGatewayUnlocked] = useState<boolean>(false);

  // Registered Customer Accounts
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('ms_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ms_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ms_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'admin'>('login');

  // Device Lockout & Security State (Max 3 failed login attempts security mechanism)
  const [adminFailedAttempts, setAdminFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ms_admin_failed_attempts');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [adminLockoutUntil, setAdminLockoutUntil] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('ms_admin_lockout_until');
      if (!saved) return null;
      const until = parseInt(saved, 10);
      if (Date.now() < until) return until;
      // Expired lockout
      localStorage.removeItem('ms_admin_lockout_until');
      localStorage.removeItem('ms_admin_failed_attempts');
      return null;
    } catch {
      return null;
    }
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    try {
      const saved = localStorage.getItem('ms_admin_security_logs');
      return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
    } catch {
      return INITIAL_SECURITY_LOGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ms_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ms_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('ms_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('ms_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          freeShippingThreshold: parsed.freeShippingThreshold !== undefined ? parsed.freeShippingThreshold : 500,
          baseDeliveryDistanceKm: parsed.baseDeliveryDistanceKm || 1,
          baseDeliveryRate: parsed.baseDeliveryRate || 200,
          perKmDeliveryRate: parsed.perKmDeliveryRate || 50,
          storeBaseLocation: parsed.storeBaseLocation || INITIAL_SETTINGS.storeBaseLocation,
        };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(1);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'analytics' | 'marketing' | 'archives' | 'settings'>('dashboard');
  const [adminSelectedOrderId, setAdminSelectedOrderId] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ms_products_v2', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_monthly_archives', JSON.stringify(monthlyArchives));
    } catch (e) {
      console.error(e);
    }
  }, [monthlyArchives]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_admin_creds', JSON.stringify(adminCredentials));
    } catch (e) {
      console.error(e);
    }
  }, [adminCredentials]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ms_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ms_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_is_admin', isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_admin_failed_attempts', adminFailedAttempts.toString());
    } catch (e) {
      console.error(e);
    }
  }, [adminFailedAttempts]);

  useEffect(() => {
    try {
      if (adminLockoutUntil) {
        localStorage.setItem('ms_admin_lockout_until', adminLockoutUntil.toString());
      } else {
        localStorage.removeItem('ms_admin_lockout_until');
      }
    } catch (e) {
      console.error(e);
    }
  }, [adminLockoutUntil]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_admin_security_logs', JSON.stringify(securityLogs));
    } catch (e) {
      console.error(e);
    }
  }, [securityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeThreshold = settings.freeShippingThreshold ?? 500;
  const freeShippingProgress = Math.min(
    100,
    subtotal > 0 ? (subtotal / freeThreshold) * 100 : 0
  );
  const amountUntilFreeShipping = Math.max(0, freeThreshold - subtotal);

  const calculateDeliveryFee = (distanceKm: number, subtotalAmount: number = subtotal): number => {
    if (subtotalAmount === 0) return 0;
    if (subtotalAmount >= (settings.freeShippingThreshold ?? 500)) return 0;

    const baseRate = settings.baseDeliveryRate ?? 200;
    const perKm = settings.perKmDeliveryRate ?? 50;

    if (distanceKm <= 1) return baseRate;
    return baseRate + Math.max(0, Math.ceil(distanceKm - 1)) * perKm;
  };

  const deliveryFee = calculateDeliveryFee(deliveryDistanceKm, subtotal);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.fixedDiscount) {
      discountAmount = appliedCoupon.fixedDiscount;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const deleteCustomer = (emailOrPhoneOrId: string) => {
    const cleanTarget = emailOrPhoneOrId.trim().toLowerCase();
    setUsers((prev) =>
      prev.filter(
        (u) =>
          u.email.toLowerCase() !== cleanTarget &&
          u.phone.trim().toLowerCase() !== cleanTarget &&
          u.id !== cleanTarget
      )
    );
  };

  // AUTHENTICATION & SECURITY LOGIC
  const addSecurityLog = (
    action: SecurityLog['action'],
    details: string,
    status: SecurityLog['status']
  ) => {
    const newLog: SecurityLog = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.104 (Authenticated Local IP)',
      deviceInfo: typeof navigator !== 'undefined' ? `${navigator.platform || 'Device'} • ${navigator.userAgent.slice(0, 32)}...` : 'Admin Workstation',
      action,
      details,
      status,
    };
    setSecurityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    try {
      localStorage.removeItem('ms_admin_security_logs');
    } catch (e) {
      console.error(e);
    }
  };

  const resetAdminLockout = (recoveryKey?: string) => {
    const masterKey = adminCredentials.recoveryKey || 'AURA-MASTER-9900';
    if (!recoveryKey || recoveryKey.trim().toUpperCase() !== masterKey.toUpperCase()) {
      addSecurityLog('LOGIN_FAILED', 'Failed security lockout override attempt: Invalid Master Key.', 'danger');
      return { success: false, message: 'Invalid Master Recovery Key. Security override rejected.' };
    }

    setAdminFailedAttempts(0);
    setAdminLockoutUntil(null);
    try {
      localStorage.removeItem('ms_admin_failed_attempts');
      localStorage.removeItem('ms_admin_lockout_until');
    } catch (e) {
      console.error(e);
    }
    addSecurityLog('LOCKOUT_RESET', 'Device security lockout overridden via Master Security Key.', 'success');
    return { success: true, message: 'Security lockout cleared. Device authorization unlocked.' };
  };

  const adminLogin = (emailInput: string, passwordInput: string) => {
    const now = Date.now();
    // 1. Check if device is actively locked out
    if (adminLockoutUntil && now < adminLockoutUntil) {
      const remainingSec = Math.ceil((adminLockoutUntil - now) / 1000);
      return {
        success: false,
        locked: true,
        remainingSeconds: remainingSec,
        message: `Device security lockout active due to repeated failures. Access blocked for ${Math.ceil(remainingSec / 60)} minute(s).`,
      };
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 2. Validate Master Admin Credentials
    if (
      cleanEmail === adminCredentials.email.toLowerCase() &&
      cleanPassword === adminCredentials.password
    ) {
      setAdminFailedAttempts(0);
      setAdminLockoutUntil(null);
      try {
        localStorage.removeItem('ms_admin_failed_attempts');
        localStorage.removeItem('ms_admin_lockout_until');
      } catch (e) {
        console.error(e);
      }

      setIsAdminLoggedIn(true);
      setCurrentUser({
        id: 'admin-master',
        name: 'MS Admin Master',
        email: adminCredentials.email,
        phone: settings.whatsappNumber,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      setIsAuthModalOpen(false);
      setCurrentView('admin');

      addSecurityLog('LOGIN_SUCCESS', `Administrator verified and authenticated successfully on this terminal.`, 'success');

      return {
        success: true,
        locked: false,
        message: 'Welcome back, Master Administrator.',
      };
    }

    // 3. Failed Attempt Logic (Max 3 failed login attempts security mechanism)
    const nextAttempts = adminFailedAttempts + 1;
    if (nextAttempts >= 3) {
      const lockoutPeriod = 15 * 60 * 1000; // 15 minutes lockout cooldown
      const lockUntil = now + lockoutPeriod;
      setAdminFailedAttempts(3);
      setAdminLockoutUntil(lockUntil);
      try {
        localStorage.setItem('ms_admin_failed_attempts', '3');
        localStorage.setItem('ms_admin_lockout_until', lockUntil.toString());
      } catch (e) {
        console.error(e);
      }

      addSecurityLog(
        'DEVICE_LOCKED',
        `3 consecutive failed admin authorization attempts for [${cleanEmail}]. Terminal locked for 15 minutes.`,
        'danger'
      );

      return {
        success: false,
        locked: true,
        remainingAttempts: 0,
        remainingSeconds: 900,
        message: 'CRITICAL SECURITY ALERT: 3 failed authorization attempts. This terminal has been locked out for 15 minutes.',
      };
    } else {
      setAdminFailedAttempts(nextAttempts);
      try {
        localStorage.setItem('ms_admin_failed_attempts', nextAttempts.toString());
      } catch (e) {
        console.error(e);
      }
      const remaining = 3 - nextAttempts;

      addSecurityLog(
        'LOGIN_FAILED',
        `Failed admin login attempt ${nextAttempts}/3 for email [${cleanEmail}].`,
        'warning'
      );

      return {
        success: false,
        locked: false,
        remainingAttempts: remaining,
        message: `Invalid credentials. Security warning: ${remaining} attempt(s) remaining before this device is locked out.`,
      };
    }
  };

  const login = (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 1. If Admin email is entered, enforce strict Admin Login security & 3-attempt lockout!
    if (cleanEmail === adminCredentials.email.toLowerCase()) {
      return adminLogin(emailInput, passwordInput);
    }

    // 2. Check if registered customer
    const customer = users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
    if (customer) {
      setCurrentUser(customer);
      setIsAdminLoggedIn(false);
      setIsAuthModalOpen(false);
      return { success: true, role: 'customer' as const, message: `Welcome back, ${customer.name}.` };
    }

    return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
  };

  const signup = (userData: { name: string; email: string; password: string; phone: string; city: string; address: string }) => {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Prevent signing up with admin email
    if (cleanEmail === adminCredentials.email.toLowerCase()) {
      return { success: false, message: 'This email is reserved for administration.' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      phone: userData.phone.trim(),
      city: userData.city,
      address: userData.address.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAdminLoggedIn(false);
    setIsAuthModalOpen(false);
    return { success: true, message: `Account created successfully! Welcome, ${newUser.name}.` };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setIsGatewayUnlocked(false);
    if (currentView === 'admin' || currentView === 'account') {
      setCurrentView('home');
    }
  };

  const initializeAdmin = (data: {
    name: string;
    email: string;
    password: string;
    gatewayPasscode: string;
    recoveryKey?: string;
  }) => {
    const updated: AdminCredentials = {
      name: data.name.trim() || 'Master Admin',
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
      gatewayPasscode: data.gatewayPasscode.trim(),
      isConfigured: true,
      recoveryKey: data.recoveryKey?.trim() || 'AURA-MASTER-9900',
      lastUpdated: new Date().toISOString(),
    };

    setAdminCredentials(updated);
    try {
      localStorage.setItem('ms_admin_creds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    addSecurityLog(
      'ADMIN_CREATED',
      `Master Administrator account initialized for [${updated.email}] with Secret Gateway Passcode.`,
      'success'
    );
    setIsGatewayUnlocked(true);
    return { success: true, message: 'Admin Console & Gateway Passcode permanently created and saved!' };
  };

  const verifyGatewayPasscode = (passcodeInput: string) => {
    const now = Date.now();
    // 1. Check if device is actively locked out
    if (adminLockoutUntil && now < adminLockoutUntil) {
      const remainingSec = Math.ceil((adminLockoutUntil - now) / 1000);
      return {
        success: false,
        locked: true,
        remainingSeconds: remainingSec,
        message: `Device security lockout active. Access blocked for ${Math.ceil(remainingSec / 60)} minute(s).`,
      };
    }

    const cleanPasscode = passcodeInput.trim();
    if (cleanPasscode === adminCredentials.gatewayPasscode) {
      setIsGatewayUnlocked(true);
      setAdminFailedAttempts(0);
      addSecurityLog('GATEWAY_UNLOCKED', 'Gateway passcode verified. Admin login form unlocked.', 'success');
      return {
        success: true,
        message: 'Security Gate Passcode verified. Proceed to Administrator Login.',
      };
    }

    // Failed attempt logic
    const nextAttempts = adminFailedAttempts + 1;
    if (nextAttempts >= 3) {
      const lockoutPeriod = 15 * 60 * 1000;
      const lockUntil = now + lockoutPeriod;
      setAdminFailedAttempts(3);
      setAdminLockoutUntil(lockUntil);
      try {
        localStorage.setItem('ms_admin_failed_attempts', '3');
        localStorage.setItem('ms_admin_lockout_until', lockUntil.toString());
      } catch (e) {
        console.error(e);
      }
      addSecurityLog(
        'DEVICE_LOCKED',
        '3 consecutive failed Gateway Passcode attempts. Terminal locked for 15 minutes.',
        'danger'
      );
      return {
        success: false,
        locked: true,
        remainingAttempts: 0,
        remainingSeconds: 900,
        message: 'CRITICAL SECURITY ALERT: 3 failed attempts. This terminal has been locked out for 15 minutes.',
      };
    } else {
      setAdminFailedAttempts(nextAttempts);
      try {
        localStorage.setItem('ms_admin_failed_attempts', nextAttempts.toString());
      } catch (e) {
        console.error(e);
      }
      const remaining = 3 - nextAttempts;
      addSecurityLog(
        'GATEWAY_FAILED',
        `Incorrect Gateway Passcode entered. Attempt ${nextAttempts}/3.`,
        'warning'
      );
      return {
        success: false,
        locked: false,
        remainingAttempts: remaining,
        message: `Incorrect Security Gate Passcode. Warning: ${remaining} attempt(s) remaining before device lockout.`,
      };
    }
  };

  const resetAdminToSetupMode = () => {
    const updated: AdminCredentials = {
      ...adminCredentials,
      isConfigured: false,
    };
    setAdminCredentials(updated);
    setIsGatewayUnlocked(false);
    try {
      localStorage.setItem('ms_admin_creds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    addSecurityLog('CREDENTIALS_CHANGED', 'Admin console reset to Setup Mode.', 'warning');
  };

  const updateAdminCredentials = (
    currentPassword: string,
    newEmail: string,
    newPassword: string,
    newGatewayPasscode?: string,
    newRecoveryKey?: string,
    newName?: string
  ) => {
    if (currentPassword !== adminCredentials.password) {
      addSecurityLog('LOGIN_FAILED', 'Failed attempt to modify administrator credentials: Invalid current password.', 'danger');
      return { success: false, message: 'Current administrator password is incorrect.' };
    }

    const updated: AdminCredentials = {
      name: newName?.trim() || adminCredentials.name || 'Master Admin',
      email: newEmail.trim() || adminCredentials.email,
      password: newPassword.trim() || adminCredentials.password,
      gatewayPasscode: newGatewayPasscode?.trim() || adminCredentials.gatewayPasscode,
      isConfigured: true,
      recoveryKey: newRecoveryKey?.trim() || adminCredentials.recoveryKey || 'AURA-MASTER-9900',
      lastUpdated: new Date().toISOString(),
    };

    setAdminCredentials(updated);
    try {
      localStorage.setItem('ms_admin_creds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    addSecurityLog('CREDENTIALS_CHANGED', 'Administrator credentials, Gateway Passcode, and Security Keys updated.', 'success');
    return { success: true, message: 'Administrator credentials and security passcode updated successfully.' };
  };

  // MONTHLY ARCHIVE & REFRESH LOGIC
  const archiveCurrentMonth = (monthLabel?: string) => {
    const now = new Date();
    const defaultLabel = monthLabel || now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

    const newArchive: MonthlyArchive = {
      id: `arch-${Date.now()}`,
      monthName: defaultLabel,
      year: now.getFullYear(),
      archivedAt: now.toISOString(),
      totalRevenue: totalRev,
      totalOrders: orders.length,
      deliveredOrders: deliveredCount,
      cancelledOrders: cancelledCount,
      orders: [...orders],
    };

    setMonthlyArchives((prev) => [newArchive, ...prev]);
    // Reset active orders for the fresh month
    setOrders([]);
    return { success: true, archive: newArchive };
  };

  const deleteArchive = (archiveId: string) => {
    setMonthlyArchives((prev) => prev.filter((a) => a.id !== archiveId));
  };

  const restoreArchive = (archiveId: string) => {
    const found = monthlyArchives.find((a) => a.id === archiveId);
    if (found && found.orders.length > 0) {
      setOrders((prev) => {
        // Prevent duplicate orders by checking id
        const existingIds = new Set(prev.map((o) => o.id));
        const newOrdersToAdd = found.orders.filter((o) => !existingIds.has(o.id));
        return [...newOrdersToAdd, ...prev];
      });
    }
  };

  // Cart operations
  const addToCart = (
    product: Product,
    size: string,
    color: string,
    quantity: number
  ): { success: boolean; message: string } => {
    const variantKey = `${size}_${color}`;
    const availableStock = product.variantStock[variantKey] ?? product.stock;

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.size === size && item.color === color
    );

    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (availableStock <= 0) {
      return { success: false, message: `Selected variant (${size} / ${color}) is currently out of stock.` };
    }

    if (requestedTotal > availableStock) {
      return {
        success: false,
        message: `Only ${availableStock} units available in stock. You already have ${currentQtyInCart} in your bag.`,
      };
    }

    if (existingIndex > -1) {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${size}-${color.replace(/[^a-zA-Z0-9]/g, '')}`,
        productId: product.id,
        product,
        size,
        color,
        quantity,
        price: product.price,
      };
      setCart((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
    return { success: true, message: `Added ${product.name} (${size}) to your bag.` };
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const variantKey = `${item.size}_${item.color}`;
          const maxStock = item.product.variantStock[variantKey] ?? item.product.stock;
          const cappedQty = Math.min(quantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const formattedCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === formattedCode && c.isActive);

    if (!coupon) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of PKR ${coupon.minOrderAmount.toLocaleString()}.`,
      };
    }

    setAppliedCoupon(coupon);
    return {
      success: true,
      message: `Coupon ${coupon.code} applied! Saved ${
        coupon.discountPercent ? `${coupon.discountPercent}%` : `PKR ${coupon.fixedDiscount}`
      }`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place Order
  const placeOrder = (customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postalCode?: string;
    notes?: string;
  }): Order => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      area: customerInfo.area,
      postalCode: customerInfo.postalCode || 'N/A',
      orderNotes: customerInfo.notes || '',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      trackingHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer via Cash on Delivery.',
        },
      ],
    };

    // Deduct stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItemForProduct = cart.filter((c) => c.productId === p.id);
        if (cartItemForProduct.length === 0) return p;

        const updatedVariantStock = { ...p.variantStock };
        let totalDeduction = 0;

        cartItemForProduct.forEach((item) => {
          const vKey = `${item.size}_${item.color}`;
          const currentVariantStock = updatedVariantStock[vKey] ?? 0;
          updatedVariantStock[vKey] = Math.max(0, currentVariantStock - item.quantity);
          totalDeduction += item.quantity;
        });

        return {
          ...p,
          variantStock: updatedVariantStock,
          stock: Math.max(0, p.stock - totalDeduction),
        };
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const timestamp = new Date().toISOString();
          const defaultNotes: Record<OrderStatus, string> = {
            Pending: 'Order is awaiting confirmation.',
            Confirmed: 'Order confirmed and registered in production roster.',
            Processing: 'Garment undergoing quality assurance & tailoring inspection.',
            Packed: 'Dispatched to luxury sealed packaging with security tag.',
            Shipped: 'Handed over to courier express dispatch.',
            'Out for Delivery': 'Courier driver is currently en route to delivery address.',
            Delivered: 'Consignment successfully delivered. Cash payment collected.',
            Cancelled: 'Order cancelled by management or customer request.',
          };

          const newTrackingEntry = {
            status,
            timestamp,
            note: note || defaultNotes[status] || `Status updated to ${status}.`,
          };

          return {
            ...order,
            status,
            trackingHistory: [...order.trackingHistory, newTrackingEntry],
          };
        }
        return order;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Product CRUD
  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateVariantStock = (productId: string, variantKey: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedVariants = { ...p.variantStock, [variantKey]: Math.max(0, newStock) };
          const sumStock = Object.values(updatedVariants).reduce((a, b) => a + b, 0);
          return {
            ...p,
            variantStock: updatedVariants,
            stock: sumStock > 0 ? sumStock : Math.max(0, newStock),
          };
        }
        return p;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const navigateTo = (view: AppView, productId?: string) => {
    setCurrentView(view);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        orders,
        cart,
        wishlist,
        coupons,
        appliedCoupon,
        settings,
        monthlyArchives,
        currentUser,
        isAdminLoggedIn,
        adminCredentials,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isCartOpen,
        setIsCartOpen,
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        lastPlacedOrder,
        setLastPlacedOrder,
        quickViewProduct,
        setQuickViewProduct,
        activeAdminTab,
        setActiveAdminTab,
        adminSelectedOrderId,
        setAdminSelectedOrderId,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        freeShippingProgress,
        amountUntilFreeShipping,
        deliveryDistanceKm,
        setDeliveryDistanceKm,
        calculateDeliveryFee,
        users,
        deleteCustomer,
        login,
        signup,
        logout,
        updateAdminCredentials,
        adminFailedAttempts,
        adminLockoutUntil,
        securityLogs,
        isGatewayUnlocked,
        setIsGatewayUnlocked,
        initializeAdmin,
        verifyGatewayPasscode,
        adminLogin,
        resetAdminLockout,
        clearSecurityLogs,
        resetAdminToSetupMode,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateVariantStock,
        updateSettings,
        addCoupon,
        deleteCoupon,
        archiveCurrentMonth,
        deleteArchive,
        restoreArchive,
        navigateTo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
