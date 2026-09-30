import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getAuthLazy, AUTH_SESSION_FLAG, LEGACY_ADMIN_SESSION_FLAG } from '../firebase/config';
import { Product, Category, CartItem, Order, OrderStatus, Review, StoreSettings, CustomerProfile } from '../types';
import {
  checkIsAdmin,
  fetchProducts,
  fetchCategories,
  fetchStoreSettings,
  fetchApprovedReviews,
  fetchAllReviews,
  placeOrder,
  trackOrder,
  PlaceOrderRequest,
  subscribeToOrders,
  updateOrder,
  saveProduct,
  removeProduct,
  saveCategory,
  removeCategory,
  saveStoreSettings,
  fetchCustomerProfile,
  saveCustomerProfile,
  fetchMyOrders,
} from '../services/storeService';
import { INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../data/initialData';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'gold';
}

interface CartSummary {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  itemCount: number;
}

interface StoreContextType {
  isLoading: boolean;
  loadError: string | null;
  /** Products visible to customers (not drafts). */
  products: Product[];
  /** Every product including drafts (admin). */
  allProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Review[];
  user: User | null;
  isAdmin: boolean;
  pendingOrdersCount: number;
  cartSummary: CartSummary;
  toasts: Toast[];

  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackingOpen: boolean;
  isAdminOpen: boolean;
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  trackingOrderId: string | null;
  trackingPhone: string | null;

  // Customer accounts (email + password)
  customerProfile: CustomerProfile | null;
  myOrders: Order[];
  isAccountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
  customerSignUp: (name: string, email: string, password: string) => Promise<void>;
  customerLogin: (email: string, password: string) => Promise<void>;
  customerLogout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateCustomerProfile: (changes: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'defaultAddress'>>) => Promise<void>;
  refreshMyOrders: () => Promise<void>;

  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => Promise<void>;
  handleSaveProduct: (product: Partial<Product>) => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<void>;
  handleSaveCategory: (category: Category) => Promise<void>;
  handleDeleteCategory: (categoryId: string) => Promise<void>;
  handleUpdateSettings: (settings: StoreSettings) => Promise<void>;

  addToCart: (product: Product, quantity?: number, selectedMetal?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, delta: number, selectedSize?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  handlePlaceOrder: (request: PlaceOrderRequest) => Promise<Order>;
  showToast: (message: string, type?: 'success' | 'info' | 'gold') => void;
  refreshData: () => Promise<void>;
  fetchOrder: (orderId: string, phone: string) => Promise<Order | null>;

  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;

  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openTracking: (orderId?: string, phone?: string) => void;
  closeTracking: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  openProductDetails: (product: Product) => void;
  closeProductDetails: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'aura_adorn_cart';
const LOCAL_WISHLIST_KEY = 'aura_adorn_wishlist';
const LOCAL_COMPARE_KEY = 'aura_adorn_compare';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode); cart simply won't persist.
  }
}

const sameLine = (item: CartItem, productId: string, size?: string) =>
  item.product.id === productId && (size === undefined || item.selectedSize === size);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => readLocal(LOCAL_CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readLocal(LOCAL_WISHLIST_KEY, []));
  const [compareList, setCompareList] = useState<Product[]>(() => readLocal(LOCAL_COMPARE_KEY, []));

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingPhone, setTrackingPhone] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'gold' = 'gold') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => writeLocal(LOCAL_CART_KEY, cart), [cart]);
  useEffect(() => writeLocal(LOCAL_WISHLIST_KEY, wishlist), [wishlist]);
  useEffect(() => writeLocal(LOCAL_COMPARE_KEY, compareList), [compareList]);

  // Auth: admin rights come from the Firestore admins/{uid} document (also enforced by security rules).
  // Firebase Auth is only loaded for returning admins (flag set at sign-in) or when the admin panel opens.
  const [authWanted, setAuthWanted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_SESSION_FLAG) === '1' || localStorage.getItem(LEGACY_ADMIN_SESSION_FLAG) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!authWanted) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const [{ onAuthStateChanged }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, async currentUser => {
        setUser(currentUser);
        if (!currentUser) {
          setIsAdmin(false);
          setCustomerProfile(null);
          setMyOrders([]);
          return;
        }
        const [admin, profile] = await Promise.all([
          checkIsAdmin(currentUser.uid),
          fetchCustomerProfile(currentUser.uid).catch(() => null),
        ]);
        setIsAdmin(admin);
        setCustomerProfile(profile);
      });
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [authWanted]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [prods, cats, sets] = await Promise.all([fetchProducts(), fetchCategories(), fetchStoreSettings()]);
      setAllProducts(prods);
      setCategories(cats);
      setSettings(sets);
    } catch (e) {
      console.error('Failed loading store data', e);
      setLoadError('We could not load the store right now. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
    try {
      setReviews(isAdmin ? await fetchAllReviews() : await fetchApprovedReviews());
    } catch (e) {
      console.warn('Reviews unavailable', e);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live order list for admins only.
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    subscribeToOrders(setOrders, e => {
      console.error('Order subscription failed', e);
      showToast('Could not load orders. Check your connection.', 'info');
    }).then(unsub => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [isAdmin, showToast]);

  const products = useMemo(() => allProducts.filter(p => p.status !== 'draft'), [allProducts]);

  // Keep cart items in sync with the latest product data (price, stock, removed products).
  useEffect(() => {
    if (isLoading || loadError) return;
    setCart(prev => {
      const next = prev
        .map(item => {
          const fresh = products.find(p => p.id === item.product.id);
          return fresh ? { ...item, product: fresh, quantity: Math.min(item.quantity, fresh.stock) } : null;
        })
        .filter((item): item is CartItem => Boolean(item && item.quantity > 0));
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [products, isLoading, loadError]);

  // Wishlist sync for signed-in customers: merge the saved list once, then save changes.
  const wishlistMergedFor = React.useRef<string | null>(null);
  useEffect(() => {
    if (!user || !customerProfile || wishlistMergedFor.current === user.uid) return;
    wishlistMergedFor.current = user.uid;
    setWishlist(prev => Array.from(new Set([...(customerProfile.wishlist || []), ...prev])).slice(0, 200));
  }, [user, customerProfile]);

  useEffect(() => {
    if (!user || !customerProfile || wishlistMergedFor.current !== user.uid) return;
    const saved = customerProfile.wishlist || [];
    if (saved.length === wishlist.length && saved.every(id => wishlist.includes(id))) return;
    const t = setTimeout(() => {
      const next = { ...customerProfile, wishlist };
      saveCustomerProfile(next)
        .then(() => setCustomerProfile(next))
        .catch(e => console.warn('Wishlist sync failed', e));
    }, 800);
    return () => clearTimeout(t);
  }, [wishlist, user, customerProfile]);

  useEffect(() => {
    if (!user) wishlistMergedFor.current = null;
  }, [user]);

  // ---------------- Cart ----------------

  const addToCart = useCallback((product: Product, quantity = 1, selectedMetal?: string, selectedSize?: string) => {
    if (product.stock <= 0 || product.status === 'out_of_stock') {
      showToast('Sorry, this item is out of stock.', 'info');
      return;
    }
    if ((product.options?.length || 0) > 0 && !selectedSize) {
      setSelectedProduct(product);
      showToast(`Please choose a ${(product.optionLabel || 'size').toLowerCase()} first.`, 'info');
      return;
    }
    const size = selectedSize || '';
    let added = true;
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id && (item.selectedSize || '') === size);
      if (idx >= 0) {
        const newQty = prev[idx].quantity + quantity;
        if (newQty > product.stock) {
          added = false;
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: newQty };
        return next;
      }
      return [...prev, {
        product,
        quantity: Math.min(quantity, product.stock),
        selectedMetal: selectedMetal || product.details?.metal,
        selectedSize: size || undefined,
      }];
    });
    if (added) showToast(`Added "${product.name}" to your bag.`, 'gold');
    else showToast(`Only ${product.stock} available.`, 'info');
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart(prev => prev.filter(item => !sameLine(item, productId, selectedSize)));
    showToast('Item removed from your bag.', 'info');
  }, [showToast]);

  const updateCartQuantity = useCallback((productId: string, delta: number, selectedSize?: string) => {
    setCart(prev => prev
      .map(item => {
        if (!sameLine(item, productId, selectedSize)) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      })
      .filter((item): item is CartItem => item !== null));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from your wishlist.', 'info');
        return prev.filter(id => id !== productId);
      }
      showToast('Saved to your wishlist.', 'gold');
      return [...prev, productId];
    });
  }, [showToast]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // ---------------- Compare ----------------

  const addToCompare = useCallback((product: Product): boolean => {
    if (compareList.some(p => p.id === product.id)) {
      showToast(`"${product.name}" is already in comparison.`, 'info');
      return false;
    }
    if (compareList.length >= 4) {
      showToast('You can compare up to 4 items.', 'info');
      return false;
    }
    setCompareList(prev => [...prev, product]);
    showToast(`Added "${product.name}" to comparison.`, 'gold');
    return true;
  }, [compareList, showToast]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);
  const isInCompare = useCallback((productId: string) => compareList.some(p => p.id === productId), [compareList]);

  // ---------------- Totals (display only; the server recalculates on checkout) ----------------

  const cartSummary: CartSummary = useMemo(() => {
    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const freeOver = settings.freeDeliveryThreshold || 0;
    const delivery = subtotal === 0 || (freeOver > 0 && subtotal >= freeOver) ? 0 : settings.deliveryCharge;
    return { subtotal, discount: 0, delivery, total: subtotal + delivery, itemCount };
  }, [cart, settings.deliveryCharge, settings.freeDeliveryThreshold]);

  const handlePlaceOrder = async (request: PlaceOrderRequest): Promise<Order> => {
    const idToken = user ? await user.getIdToken().catch(() => null) : null;
    const newOrder = await placeOrder(request, idToken);
    if (user) {
      refreshMyOrders();
      if (request.saveAddress) fetchCustomerProfile(user.uid).then(p => p && setCustomerProfile(p)).catch(() => undefined);
    }
    clearCart();
    showToast(`Order ${newOrder.id} placed successfully!`, 'gold');
    loadData(); // refresh stock counts
    return newOrder;
  };

  // ---------------- Admin ----------------

  const markSession = (on: boolean) => {
    try {
      if (on) localStorage.setItem(AUTH_SESSION_FLAG, '1');
      else {
        localStorage.removeItem(AUTH_SESSION_FLAG);
        localStorage.removeItem(LEGACY_ADMIN_SESSION_FLAG);
      }
    } catch {
      // storage unavailable
    }
  };

  const authErrorMessage = (e: unknown): string => {
    const code = (e as { code?: string })?.code || '';
    if (code.includes('email-already-in-use')) return 'An account with this email already exists. Please log in instead.';
    if (code.includes('invalid-email')) return 'Please enter a valid email address.';
    if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
    if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a few minutes and try again.';
    if (code.includes('network-request-failed')) return 'Network error. Please check your internet connection.';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Incorrect email or password.';
    }
    return 'Something went wrong. Please try again.';
  };

  const refreshMyOrders = useCallback(async () => {
    if (!user) {
      setMyOrders([]);
      return;
    }
    try {
      setMyOrders(await fetchMyOrders(user.uid));
    } catch (e) {
      console.warn('Could not load my orders', e);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAccountOpen) refreshMyOrders();
  }, [user, isAccountOpen, refreshMyOrders]);

  const customerSignUp = async (name: string, email: string, password: string) => {
    const [{ createUserWithEmailAndPassword, updateProfile, sendEmailVerification }, auth] = await Promise.all([
      import('firebase/auth'),
      getAuthLazy(),
    ]);
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      throw new Error(authErrorMessage(e));
    }
    const cleanName = name.trim().slice(0, 150);
    await updateProfile(cred.user, { displayName: cleanName }).catch(() => undefined);
    const profile: CustomerProfile = {
      id: cred.user.uid,
      name: cleanName,
      email: cred.user.email || email.trim(),
      wishlist,
      createdAt: new Date().toISOString(),
    };
    await saveCustomerProfile(profile).catch(e => console.error('Profile create failed', e));
    sendEmailVerification(cred.user).catch(() => undefined);
    setUser(cred.user);
    setCustomerProfile(profile);
    setAuthWanted(true);
    markSession(true);
    showToast(`Welcome, ${cleanName}! Your account is ready.`, 'gold');
  };

  const customerLogin = async (email: string, password: string) => {
    const [{ signInWithEmailAndPassword }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      throw new Error(authErrorMessage(e));
    }
    setUser(cred.user);
    const [admin, profile] = await Promise.all([
      checkIsAdmin(cred.user.uid),
      fetchCustomerProfile(cred.user.uid).catch(() => null),
    ]);
    setIsAdmin(admin);
    setCustomerProfile(profile);
    setAuthWanted(true);
    markSession(true);
    showToast(`Welcome back${profile?.name ? `, ${profile.name}` : ''}!`, 'gold');
  };

  const customerLogout = async () => {
    const [{ signOut }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
    await signOut(auth);
    markSession(false);
    setIsAdmin(false);
    setCustomerProfile(null);
    setMyOrders([]);
    showToast('You have logged out.', 'info');
  };

  const sendPasswordReset = async (email: string) => {
    const [{ sendPasswordResetEmail }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      // Don't reveal whether an account exists for this email.
      if (!code.includes('user-not-found')) throw new Error(authErrorMessage(e));
    }
  };

  const updateCustomerProfile = async (changes: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'defaultAddress'>>) => {
    if (!user) throw new Error('Please log in first.');
    const next: CustomerProfile = {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      wishlist,
      createdAt: new Date().toISOString(),
      ...(customerProfile || {}),
      ...changes,
    };
    await saveCustomerProfile(next);
    setCustomerProfile(next);
    showToast('Your details have been saved.', 'gold');
  };

  const adminLogin = async (email: string, password: string) => {
    const [{ signInWithEmailAndPassword, signOut }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      throw new Error('Incorrect email or password.');
    }
    const ok = await checkIsAdmin(cred.user.uid);
    if (!ok) {
      await signOut(auth);
      throw new Error('This account does not have admin access.');
    }
    setIsAdmin(true);
    setUser(cred.user);
    setAuthWanted(true);
    try {
      localStorage.setItem(AUTH_SESSION_FLAG, '1');
    } catch {
      // ignore
    }
    showToast('Signed in to the admin panel.', 'gold');
  };

  const adminLogout = async () => {
    const [{ signOut }, auth] = await Promise.all([import('firebase/auth'), getAuthLazy()]);
    await signOut(auth);
    try {
      localStorage.removeItem(AUTH_SESSION_FLAG);
      localStorage.removeItem(LEGACY_ADMIN_SESSION_FLAG);
    } catch {
      // ignore
    }
    setIsAdmin(false);
    showToast('Signed out.', 'info');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => {
    try {
      await updateOrder(orderId, { status, trackingNumber, courierName });
      showToast(`Order ${orderId} updated to ${status.toUpperCase()}`, 'gold');
    } catch (e) {
      console.error(e);
      showToast('Could not update the order. Please try again.', 'info');
      throw e;
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const price = Number(productData.price) || 0;
    const origPrice = Number(productData.originalPrice) || price;
    const fullProduct: Product = {
      id: productData.id || `p-${Date.now().toString(36)}`,
      name: (productData.name || '').trim(),
      description: productData.description || '',
      price,
      originalPrice: origPrice,
      discountPercentage: origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0,
      category: productData.category || categories[0]?.slug || '',
      subCategory: productData.subCategory || '',
      stock: Math.max(0, Number(productData.stock ?? 0)),
      status: productData.status || 'active',
      isFeatured: productData.isFeatured ?? false,
      isNewArrival: productData.isNewArrival ?? true,
      isBestSeller: productData.isBestSeller ?? false,
      loyaltyBadge: productData.loyaltyBadge,
      options: (productData.options || []).map(o => o.trim()).filter(Boolean),
      optionLabel: productData.optionLabel || '',
      images: (productData.images || []).filter(Boolean),
      rating: productData.rating || 0,
      reviewCount: productData.reviewCount || 0,
      details: {
        metal: productData.details?.metal || '',
        stone: productData.details?.stone || '',
        color: productData.details?.color || '',
        weight: productData.details?.weight || '',
        dimensions: productData.details?.dimensions || '',
        includes: productData.details?.includes || '',
      },
      tags: productData.tags || [],
      createdAt: productData.createdAt || new Date().toISOString(),
    };
    try {
      await saveProduct(fullProduct);
    } catch (e) {
      console.error(e);
      showToast('Could not save the product. Are you signed in as admin?', 'info');
      throw e;
    }
    setAllProducts(prev => {
      const idx = prev.findIndex(p => p.id === fullProduct.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fullProduct;
        return copy;
      }
      return [fullProduct, ...prev];
    });
    showToast(`"${fullProduct.name}" saved.`, 'gold');
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await removeProduct(productId);
    } catch (e) {
      showToast('Could not delete the product.', 'info');
      throw e;
    }
    setAllProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted.', 'info');
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await saveCategory(category);
    } catch (e) {
      showToast('Could not save the category.', 'info');
      throw e;
    }
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
    showToast(`Category "${category.name}" saved.`, 'gold');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await removeCategory(categoryId);
    } catch (e) {
      showToast('Could not delete the category.', 'info');
      throw e;
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    showToast('Category deleted.', 'info');
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    try {
      await saveStoreSettings(newSettings);
    } catch (e) {
      showToast('Could not save settings.', 'info');
      throw e;
    }
    setSettings(newSettings);
    showToast('Settings saved.', 'gold');
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        loadError,
        products,
        allProducts,
        categories,
        settings,
        cart,
        wishlist,
        orders,
        reviews,
        user,
        isAdmin,
        pendingOrdersCount,
        cartSummary,
        toasts,

        isCartOpen,
        isWishlistOpen,
        isCheckoutOpen,
        isTrackingOpen,
        isAdminOpen,
        isCompareModalOpen,
        selectedProduct,
        quickViewProduct,
        trackingOrderId,
        trackingPhone,

        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        openCompareModal: () => setIsCompareModalOpen(true),
        closeCompareModal: () => setIsCompareModalOpen(false),

        customerProfile,
        myOrders,
        isAccountOpen,
        openAccount: () => {
          setAuthWanted(true);
          setIsAccountOpen(true);
        },
        closeAccount: () => setIsAccountOpen(false),
        customerSignUp,
        customerLogin,
        customerLogout,
        sendPasswordReset,
        updateCustomerProfile,
        refreshMyOrders,

        adminLogin,
        adminLogout,
        updateOrderStatus,
        handleSaveProduct,
        handleDeleteProduct,
        handleSaveCategory,
        handleDeleteCategory,
        handleUpdateSettings,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        handlePlaceOrder,
        showToast,
        refreshData: loadData,
        fetchOrder: trackOrder,

        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false),
        openTracking: (id, phone) => {
          setTrackingOrderId(id || null);
          setTrackingPhone(phone || null);
          setIsTrackingOpen(true);
        },
        closeTracking: () => setIsTrackingOpen(false),
        openAdmin: () => {
          setAuthWanted(true);
          setIsAdminOpen(true);
        },
        closeAdmin: () => setIsAdminOpen(false),
        openProductDetails: product => setSelectedProduct(product),
        closeProductDetails: () => setSelectedProduct(null),
        openQuickView: product => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
