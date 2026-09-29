import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, friendlyFirebaseError, isFirebaseConfigured } from '../firebase/config';
import {
  AppliedCoupon,
  CartItem,
  Category,
  Coupon,
  NewsletterSubscriber,
  Order,
  Product,
  Review,
  StoreSettings,
} from '../types';
import {
  checkIsAdmin,
  fetchOrderById,
  normalizeSettings,
  placeOrder,
  PlaceOrderInput,
  saveCustomerProfile,
  subscribeAllOrders,
  subscribeAllReviews,
  subscribeApprovedReviews,
  subscribeCategories,
  subscribeCoupons,
  subscribeCustomerOrders,
  subscribeProducts,
  subscribeSettings,
  subscribeSubscribers,
  validateCoupon,
} from '../services/storeService';
import { CartSummary, computeCartSummary, describeCoupon } from '../utils/pricing';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'gold';
}

export type CheckoutDetails = Omit<PlaceOrderInput, 'cart' | 'coupon' | 'settings' | 'customerId'>;

interface StoreContextType {
  // Catalogue (live from Firestore)
  /** Products visible to customers (drafts hidden), with ratings from approved reviews */
  products: Product[];
  /** Every product including drafts — for admin */
  allProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  reviews: Review[];
  isCatalogLoading: boolean;
  catalogError: string | null;

  // Auth
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Admin data (only loaded for admins)
  orders: Order[];
  adminReviews: Review[];
  coupons: Coupon[];
  subscribers: NewsletterSubscriber[];
  pendingOrderCount: number;

  // Customer data
  myOrders: Order[];

  // Cart
  cart: CartItem[];
  cartSummary: CartSummary;
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: Product, quantity?: number, selectedMetal?: string, selectedSize?: string) => void;
  removeFromCart: (lineKey: string) => void;
  updateCartQuantity: (lineKey: string, delta: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  handlePlaceOrder: (details: CheckoutDetails) => Promise<Order>;
  fetchOrder: (orderId: string) => Promise<Order | null>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Product comparison
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'gold') => void;

  // Modals & navigation
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackingOpen: boolean;
  isAccountOpen: boolean;
  isAdminOpen: boolean;
  isPolicyOpen: boolean;
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  trackingOrderId: string | null;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openTracking: (orderId?: string) => void;
  closeTracking: () => void;
  openAccount: () => void;
  closeAccount: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  openPolicies: () => void;
  closePolicies: () => void;
  openProductDetails: (product: Product) => void;
  closeProductDetails: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'aura_adorn_cart';
const LOCAL_WISHLIST_KEY = 'aura_adorn_wishlist';
const LOCAL_COMPARE_KEY = 'aura_adorn_compare';

/** Identifies one cart line: the same product in a different size/finish is a separate line. */
export function cartLineKey(item: Pick<CartItem, 'selectedMetal' | 'selectedSize'> & { product: Pick<Product, 'id'> }): string {
  return `${item.product.id}|${item.selectedMetal || ''}|${item.selectedSize || ''}`;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — cart just won't persist
  }
}

/** Short chime so the owner notices new orders while the admin panel is open. */
function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch {
    // audio not available
  }
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ---------- Catalogue ----------
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => normalizeSettings(undefined));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // ---------- Auth ----------
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setProfileVersion] = useState(0);

  // ---------- Admin / customer data ----------
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // ---------- Cart / wishlist / compare ----------
  const [storedCart, setStoredCart] = useState<CartItem[]>(() => readLocal(LOCAL_CART_KEY, []));
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => readLocal(LOCAL_WISHLIST_KEY, []));
  const [compareIds, setCompareIds] = useState<string[]>(() =>
    readLocal<Array<string | Product>>(LOCAL_COMPARE_KEY, []).map(x => (typeof x === 'string' ? x : x.id))
  );

  // ---------- UI ----------
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'gold' = 'gold') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  // ---------- Public live listeners ----------
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const onError = (e: Error) => {
      console.error(e);
      setCatalogError('We could not load the shop. Please check your internet connection and refresh.');
      setProductsLoaded(true);
    };
    const unsubs = [
      subscribeProducts(items => {
        setRawProducts(items);
        setProductsLoaded(true);
        setCatalogError(null);
      }, onError),
      subscribeCategories(setRawCategories),
      subscribeSettings(setSettings),
      subscribeApprovedReviews(setReviews),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ---------- Auth listener + admin check ----------
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, async currentUser => {
      // Resolve admin status first so the UI never shows a signed-in owner as "not an admin".
      const admin = currentUser ? await checkIsAdmin(currentUser.uid) : false;
      setUser(currentUser);
      setIsAdmin(admin);
      setAuthReady(true);
    });
  }, []);

  // ---------- Admin live listeners ----------
  const knownOrderIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      setAdminReviews([]);
      setCoupons([]);
      setSubscribers([]);
      knownOrderIds.current = null;
      return;
    }
    const unsubs = [
      subscribeAllOrders(items => {
        const known = knownOrderIds.current;
        if (known) {
          const fresh = items.filter(o => !known.has(o.id));
          if (fresh.length > 0) {
            playNewOrderChime();
            fresh.forEach(o => showToast(`New order ${o.id} from ${o.customerName}`, 'gold'));
          }
        }
        knownOrderIds.current = new Set(items.map(o => o.id));
        setOrders(items);
      }),
      subscribeAllReviews(setAdminReviews),
      subscribeCoupons(setCoupons),
      subscribeSubscribers(setSubscribers),
    ];
    return () => unsubs.forEach(u => u());
  }, [isAdmin, showToast]);

  // ---------- Customer's own orders ----------
  useEffect(() => {
    if (!user) {
      setMyOrders([]);
      return;
    }
    return subscribeCustomerOrders(user.uid, setMyOrders);
  }, [user]);

  // ---------- Derived catalogue ----------
  const allProducts = useMemo(() => {
    const stats = new Map<string, { sum: number; count: number }>();
    reviews.forEach(r => {
      const s = stats.get(r.productId) || { sum: 0, count: 0 };
      s.sum += Number(r.rating) || 0;
      s.count += 1;
      stats.set(r.productId, s);
    });
    return rawProducts.map(p => {
      const s = stats.get(p.id);
      return s ? { ...p, rating: Math.round((s.sum / s.count) * 10) / 10, reviewCount: s.count } : p;
    });
  }, [rawProducts, reviews]);

  const products = useMemo(() => allProducts.filter(p => p.status !== 'draft'), [allProducts]);

  const categories = useMemo(
    () => rawCategories.map(c => ({ ...c, itemCount: products.filter(p => p.category === c.slug).length })),
    [rawCategories, products]
  );

  const productById = useMemo(() => new Map(allProducts.map(p => [p.id, p])), [allProducts]);

  // Cart lines always use the latest product data (price, stock, images).
  const cart = useMemo(() => {
    if (!productsLoaded) return storedCart;
    return storedCart.flatMap(item => {
      const live = productById.get(item.product.id);
      if (!live || live.status === 'draft') return [];
      return [{ ...item, product: live }];
    });
  }, [storedCart, productById, productsLoaded]);

  const compareList = useMemo(
    () => compareIds.map(id => productById.get(id)).filter((p): p is Product => Boolean(p)),
    [compareIds, productById]
  );

  const cartSummary = useMemo(() => computeCartSummary(cart, appliedCoupon, settings), [cart, appliedCoupon, settings]);

  const pendingOrderCount = useMemo(() => orders.filter(o => o.status === 'pending').length, [orders]);

  // Browser tab title shows the shop name, plus the new-order count for the signed-in owner.
  useEffect(() => {
    document.title = isAdmin && pendingOrderCount > 0
      ? `(${pendingOrderCount}) New orders · ${settings.brandName}`
      : settings.brandName;
  }, [isAdmin, pendingOrderCount, settings.brandName]);

  // ---------- Persistence ----------
  useEffect(() => writeLocal(LOCAL_CART_KEY, storedCart), [storedCart]);
  useEffect(() => writeLocal(LOCAL_WISHLIST_KEY, wishlist), [wishlist]);
  useEffect(() => writeLocal(LOCAL_COMPARE_KEY, compareIds), [compareIds]);

  // Drop cart lines for products that were deleted or unpublished.
  useEffect(() => {
    if (productsLoaded && cart.length !== storedCart.length) setStoredCart(cart);
  }, [productsLoaded, cart, storedCart.length]);

  // ---------- Auth actions ----------
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      throw new Error(friendlyFirebaseError(e));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await saveCustomerProfile({
        id: cred.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || '',
        createdAt: new Date().toISOString(),
      }).catch(e => console.warn('Customer profile not saved:', e));
      // updateProfile mutates the user object without firing onAuthStateChanged — re-render so the name shows.
      setProfileVersion(v => v + 1);
    } catch (e) {
      throw new Error(friendlyFirebaseError(e));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e) {
      throw new Error(friendlyFirebaseError(e));
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setIsAdminOpen(false);
    showToast('You have signed out.', 'info');
  }, [showToast]);

  // ---------- Cart actions ----------
  const addToCart = useCallback((product: Product, quantity = 1, selectedMetal?: string, selectedSize?: string) => {
    if (product.status !== 'active' || product.stock <= 0) {
      showToast(`"${product.name}" is out of stock.`, 'info');
      return;
    }
    const line: CartItem = {
      product,
      quantity: 0,
      selectedMetal: selectedMetal || product.details?.metal || '',
      selectedSize: selectedSize || '',
    };
    const key = cartLineKey(line);
    const inCartTotal = storedCart.filter(i => i.product.id === product.id).reduce((s, i) => s + i.quantity, 0);
    if (inCartTotal + quantity > product.stock) {
      showToast(`Only ${product.stock} of "${product.name}" available.`, 'info');
      return;
    }
    const exists = storedCart.some(i => cartLineKey(i) === key);
    setStoredCart(
      exists
        ? storedCart.map(i => (cartLineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i))
        : [...storedCart, { ...line, quantity }]
    );
    showToast(`Added "${product.name}" to your bag.`, 'gold');
  }, [storedCart, showToast]);

  const removeFromCart = useCallback((lineKey: string) => {
    setStoredCart(prev => prev.filter(i => cartLineKey(i) !== lineKey));
  }, []);

  const updateCartQuantity = useCallback((lineKey: string, delta: number) => {
    const target = storedCart.find(i => cartLineKey(i) === lineKey);
    if (!target) return;
    const live = productById.get(target.product.id) || target.product;
    const next = target.quantity + delta;
    if (next <= 0) {
      setStoredCart(storedCart.filter(i => cartLineKey(i) !== lineKey));
      return;
    }
    const otherLines = storedCart
      .filter(i => i.product.id === target.product.id && cartLineKey(i) !== lineKey)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (next + otherLines > live.stock) {
      showToast(`Only ${live.stock} available.`, 'info');
      return;
    }
    setStoredCart(storedCart.map(i => (cartLineKey(i) === lineKey ? { ...i, quantity: next } : i)));
  }, [storedCart, productById, showToast]);

  const clearCart = useCallback(() => setStoredCart([]), []);

  const applyCouponCode = useCallback(async (code: string) => {
    try {
      const coupon = await validateCoupon(code, cartSummary.subtotal);
      setAppliedCoupon(coupon);
      showToast(`Coupon ${coupon.code} applied — ${describeCoupon(coupon)}!`, 'gold');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Invalid coupon code.', 'info');
      return false;
    }
  }, [cartSummary.subtotal, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  }, [showToast]);

  const handlePlaceOrder = useCallback(async (details: CheckoutDetails) => {
    const order = await placeOrder({
      ...details,
      customerId: user?.uid || null,
      cart,
      coupon: appliedCoupon,
      settings,
    });
    setStoredCart([]);
    setAppliedCoupon(null);
    return order;
  }, [user, cart, appliedCoupon, settings]);

  // ---------- Wishlist ----------
  const toggleWishlist = useCallback((productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist(exists ? wishlist.filter(id => id !== productId) : [...wishlist, productId]);
    showToast(exists ? 'Removed from your wishlist.' : 'Saved to your wishlist.', exists ? 'info' : 'gold');
  }, [wishlist, showToast]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // ---------- Compare ----------
  const addToCompare = useCallback((product: Product): boolean => {
    if (compareIds.includes(product.id)) {
      showToast(`"${product.name}" is already in comparison.`, 'info');
      return false;
    }
    if (compareIds.length >= 4) {
      showToast('You can compare up to 4 pieces.', 'info');
      return false;
    }
    setCompareIds(prev => [...prev, product.id]);
    showToast(`Added "${product.name}" to comparison.`, 'gold');
    return true;
  }, [compareIds, showToast]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);
  const isInCompare = useCallback((productId: string) => compareIds.includes(productId), [compareIds]);

  // ---------- Deep links: /?admin opens the admin panel, /?track=ID opens tracking ----------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin')) setIsAdminOpen(true);
    const track = params.get('track');
    if (track) {
      setTrackingOrderId(track);
      setIsTrackingOpen(true);
    }
  }, []);

  const selectedProduct = selectedProductId ? productById.get(selectedProductId) || null : null;
  const quickViewProduct = quickViewProductId ? productById.get(quickViewProductId) || null : null;

  const value: StoreContextType = {
    products,
    allProducts,
    categories,
    settings,
    reviews,
    isCatalogLoading: isFirebaseConfigured && !productsLoaded,
    catalogError,

    user,
    authReady,
    isAdmin,
    signIn,
    register,
    resetPassword,
    logout,

    orders,
    adminReviews,
    coupons,
    subscribers,
    pendingOrderCount,
    myOrders,

    cart,
    cartSummary,
    appliedCoupon,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyCouponCode,
    removeCoupon,
    handlePlaceOrder,
    fetchOrder: fetchOrderById,

    wishlist,
    toggleWishlist,
    isInWishlist,

    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    isCompareModalOpen,
    openCompareModal: () => setIsCompareModalOpen(true),
    closeCompareModal: () => setIsCompareModalOpen(false),

    toasts,
    showToast,

    isCartOpen,
    isWishlistOpen,
    isCheckoutOpen,
    isTrackingOpen,
    isAccountOpen,
    isAdminOpen,
    isPolicyOpen,
    selectedProduct,
    quickViewProduct,
    trackingOrderId,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    openWishlist: () => setIsWishlistOpen(true),
    closeWishlist: () => setIsWishlistOpen(false),
    openCheckout: () => setIsCheckoutOpen(true),
    closeCheckout: () => setIsCheckoutOpen(false),
    openTracking: (id?: string) => {
      setTrackingOrderId(id || null);
      setIsTrackingOpen(true);
    },
    closeTracking: () => setIsTrackingOpen(false),
    openAccount: () => setIsAccountOpen(true),
    closeAccount: () => setIsAccountOpen(false),
    openAdmin: () => setIsAdminOpen(true),
    closeAdmin: () => setIsAdminOpen(false),
    openPolicies: () => setIsPolicyOpen(true),
    closePolicies: () => setIsPolicyOpen(false),
    openProductDetails: (product: Product) => setSelectedProductId(product.id),
    closeProductDetails: () => setSelectedProductId(null),
    openQuickView: (product: Product) => setQuickViewProductId(product.id),
    closeQuickView: () => setQuickViewProductId(null),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
