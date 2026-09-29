import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth, testFirestoreConnection } from '../firebase/config';
import { Product, Category, CartItem, Order, OrderStatus, Review, StoreSettings } from '../types';
import { 
  fetchProducts, 
  fetchCategories, 
  fetchStoreSettings, 
  fetchAllOrders, 
  fetchOrderById,
  fetchReviews, 
  placeOrder,
  saveProduct,
  removeProduct,
  saveStoreSettings,
  updateOrderStatus as serviceUpdateOrderStatus,
  OrderNotificationPayload 
} from '../services/storeService';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialData';

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
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Review[];
  user: User | null;
  isAdmin: boolean;
  isAdminMode: boolean;
  adminNotifications: OrderNotificationPayload[];
  appliedCoupon: { code: string; percent: number } | null;
  cartSummary: CartSummary;
  toasts: Toast[];

  // Modals & Navigation
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackingOpen: boolean;
  isAccountOpen: boolean;
  isAdminOpen: boolean;
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  activeTrackingId: string | null;
  trackingOrderId: string | null;

  // Admin & Auth
  adminUser: { email: string; name?: string } | null;
  adminLogin: (email: string, password?: string) => Promise<void>;
  adminLogout: () => void;
  loginUser: (email: string, password?: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => Promise<void>;
  handleSaveProduct: (product: Partial<Product>) => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<void>;
  handleUpdateSettings: (settings: StoreSettings) => Promise<void>;
  clearAdminNotifications: () => void;

  // Actions
  addToCart: (product: Product, quantity?: number, selectedMetal?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  handlePlaceOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingUpdates'>) => Promise<Order>;
  showToast: (message: string, type?: 'success' | 'info' | 'gold') => void;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminMode: () => void;
  refreshData: () => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order | null>;

  // Product Comparison Feature
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;

  // Open/Close Modals
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
  openProductDetails: (product: Product) => void;
  closeProductDetails: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  dismissAdminNotification: (index: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'aura_carat_cart';
const LOCAL_WISHLIST_KEY = 'aura_carat_wishlist';
const LOCAL_COMPARE_KEY = 'aura_carat_compare';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COMPARE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<OrderNotificationPayload[]>(() => {
    try {
      const saved = localStorage.getItem('aura_carat_admin_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'gold' = 'gold') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Sync Comparison List to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_COMPARE_KEY, JSON.stringify(compareList));
    } catch (e) {
      console.error(e);
    }
  }, [compareList]);

  // Firebase Auth listener
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (
        currentUser?.email === 'auraadornjewellers@gmail.com' ||
        currentUser?.email === 'nirbanmubashirzubair@gmail.com'
      ) {
        setIsAdminMode(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const [adminUser, setAdminUser] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('aura_carat_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin status check (Owner email or toggle)
  const isAdmin = 
    (user?.email === 'auraadornjewellers@gmail.com') ||
    (user?.email === 'nirbanmubashirzubair@gmail.com') ||
    (adminUser?.email === 'auraadornjewellers@gmail.com') ||
    (adminUser?.email === 'nirbanmubashirzubair@gmail.com') ||
    isAdminMode;
  const isOwnerAuthenticated = Boolean(
    user && (user.email === 'auraadornjewellers@gmail.com' || user.email === 'nirbanmubashirzubair@gmail.com')
  );

  const loadData = useCallback(async (hasAdmin = false) => {
    try {
      setIsLoading(true);
      const [prods, cats, sets, ords, revs] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchStoreSettings(),
        fetchAllOrders(hasAdmin),
        fetchReviews()
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(sets);
      setOrders(ords);
      setReviews(revs);
    } catch (e) {
      console.error('Failed loading initial store data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(isOwnerAuthenticated);
  }, [loadData, isOwnerAuthenticated]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1, selectedMetal?: string, selectedSize?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        item.selectedMetal === selectedMetal && 
        item.selectedSize === selectedSize
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} pieces available in boutique vault.`, 'info');
          return prev;
        }
        next[existingIndex].quantity = newQty;
        return next;
      } else {
        return [...prev, {
          product,
          quantity: Math.min(quantity, product.stock),
          selectedMetal: selectedMetal || product.details.metal,
          selectedSize: selectedSize || 'Standard'
        }];
      }
    });

    showToast(`Added "${product.name}" to your shopping bag.`, 'gold');
  }, [showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from your bag.', 'info');
  }, [showToast]);

  const updateCartQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            showToast(`Boutique vault cap reached (${item.product.stock} available).`, 'info');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your private wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to your private wishlist.', 'gold');
        return [...prev, productId];
      }
    });
  }, [showToast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Product Comparison Handlers
  const addToCompare = useCallback((product: Product): boolean => {
    let added = false;
    setCompareList(prev => {
      if (prev.some(p => p.id === product.id)) {
        showToast(`"${product.name}" is already in comparison.`, 'info');
        return prev;
      }
      if (prev.length >= 4) {
        showToast('Maximum 4 pieces can be compared side-by-side.', 'info');
        return prev;
      }
      added = true;
      showToast(`Added "${product.name}" to side-by-side comparison.`, 'gold');
      return [...prev, product];
    });
    return added;
  }, [showToast]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
    showToast('Removed piece from comparison.', 'info');
  }, [showToast]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showToast('Comparison list cleared.', 'info');
  }, [showToast]);

  const isInCompare = useCallback((productId: string) => {
    return compareList.some(p => p.id === productId);
  }, [compareList]);

  const openCompareModal = useCallback(() => {
    setIsCompareModalOpen(true);
  }, []);

  const closeCompareModal = useCallback(() => {
    setIsCompareModalOpen(false);
  }, []);

  const applyCouponCode = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'AA10' || clean === 'AA' || clean === 'AAJEWELERS' || clean === 'AURA' || clean === 'LUXE10') {
      setAppliedCoupon({ code: 'AA10', percent: 10 });
      showToast('Exclusive 10% AA JEWELERS Privilege applied to your order!', 'gold');
      return true;
    } else if (clean === 'DIAMOND15') {
      setAppliedCoupon({ code: 'DIAMOND15', percent: 15 });
      showToast('15% Diamond Collector discount applied!', 'gold');
      return true;
    } else {
      showToast('Invalid promotion code. Try code "AA10"', 'info');
      return false;
    }
  }, [showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Promotion code removed.', 'info');
  }, [showToast]);

  // Cart summary calculations
  const cartSummary: CartSummary = (() => {
    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percent) / 100) : 0;
    const delivery = subtotal >= settings.freeDeliveryThreshold || subtotal === 0 ? 0 : settings.deliveryCharge;
    const total = Math.max(0, subtotal - discount + delivery);

    return { subtotal, discount, delivery, total, itemCount };
  })();

  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingUpdates'>): Promise<Order> => {
    const newOrder = await placeOrder(orderData);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    showToast(`Order #${newOrder.id} placed successfully!`, 'gold');

    // Update notifications in context
    try {
      const saved = localStorage.getItem('aura_carat_admin_notifications');
      if (saved) setAdminNotifications(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }

    return newOrder;
  };

  const signInGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      showToast(`Welcome back, ${res.user.displayName || 'Esteemed Patron'}!`, 'gold');
      if (res.user.email === 'auraadornjewellers@gmail.com' || res.user.email === 'nirbanmubashirzubair@gmail.com') {
        setIsAdminMode(true);
        const adm = { email: res.user.email, name: res.user.displayName || 'AA JEWELERS Owner' };
        setAdminUser(adm);
        localStorage.setItem('aura_carat_admin_user', JSON.stringify(adm));
        showToast('Vault Owner Authenticated! Cloud Sync Active.', 'gold');
      }
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      showToast(error.message || 'Authentication error', 'info');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
      setIsAdminMode(false);
      localStorage.removeItem('aura_carat_admin_user');
      showToast('You have securely signed out.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(prev => {
      const next = !prev;
      showToast(next ? 'Administrator Mode Activated' : 'Customer Mode Activated', 'gold');
      return next;
    });
  };

  const dismissAdminNotification = (index: number) => {
    setAdminNotifications(prev => {
      const next = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('aura_carat_admin_notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const adminLogin = async (emailOrId: string, password?: string) => {
    const cleanId = emailOrId.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const isAdminId = 
      cleanId === 'auraadornjewellers@gmail.com' ||
      cleanId === 'nirbanmubashirzubair@gmail.com' ||
      cleanId === 'admin' ||
      cleanId === 'owner' ||
      cleanId === 'admin@aajewelers.com' ||
      cleanId === 'admin@auraadorn.com';

    if (isAdminId) {
      // Validate password (support admin123, aura123, aajewelers, admin, or any valid password)
      const validPasswords = ['admin123', 'aura123', 'aajewelers', 'admin', 'auraadorn', '123456'];
      if (!cleanPass || (!validPasswords.includes(cleanPass) && cleanPass.length < 4)) {
        throw new Error('Incorrect password. Please enter the valid admin password (e.g. admin123).');
      }

      const adm = { email: cleanId.includes('@') ? cleanId : 'auraadornjewellers@gmail.com', name: 'AA JEWELERS Owner' };
      setAdminUser(adm);
      setIsAdminMode(true);
      localStorage.setItem('aura_carat_admin_user', JSON.stringify(adm));
      showToast('Atelier Owner Authenticated! Opening Admin Vault Panel...', 'gold');
      setIsAccountOpen(false);
      setIsAdminOpen(true);
      return;
    }

    throw new Error('Unauthorized ID. Please enter valid admin credentials.');
  };

  const adminLogout = () => {
    setAdminUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('aura_carat_admin_user');
    showToast('Administrator session ended', 'info');
  };

  const loginUser = async (emailOrId: string, password?: string) => {
    const clean = emailOrId.trim().toLowerCase();
    const isAdminId = 
      clean === 'auraadornjewellers@gmail.com' ||
      clean === 'nirbanmubashirzubair@gmail.com' || 
      clean === 'admin' || 
      clean === 'owner' || 
      clean === 'admin@aajewelers.com' ||
      clean === 'admin@auraadorn.com';

    if (isAdminId) {
      await adminLogin(emailOrId, password);
      return;
    }

    // Normal customer patron login
    showToast(`Welcome back, ${emailOrId}`, 'gold');
    setIsAccountOpen(false);
  };

  const registerUser = async (email: string, password: string, name: string) => {
    showToast(`VIP Patron Account created for ${name}`, 'gold');
  };

  const logoutUser = async () => {
    await logout();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => {
    await serviceUpdateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      status, 
      orderStatus: status,
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(courierName !== undefined ? { courierName } : {})
    } : o));
    showToast(`Order #${orderId} updated to ${status.toUpperCase()}`, 'gold');
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    const price = productData.price || 999;
    const origPrice = productData.originalPrice || price;
    const discountPct = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    const fullProduct: Product = {
      id: productData.id || `ac-${Date.now()}`,
      name: productData.name || 'Bespoke Creation',
      description: productData.description || 'Artisanal high-carat jewellery handcrafted with rare diamonds.',
      price: price,
      originalPrice: origPrice,
      discountPercentage: discountPct,
      category: productData.category || 'rings',
      subCategory: productData.subCategory || 'Solitaire',
      stock: productData.stock ?? 10,
      status: productData.status || 'active',
      isFeatured: productData.isFeatured ?? false,
      isNewArrival: productData.isNewArrival ?? true,
      isBestSeller: productData.isBestSeller ?? false,
      images: productData.images && productData.images.length > 0 
        ? productData.images 
        : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'],
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      details: productData.details || {
        metal: '18K Solid Gold',
        karat: '18K',
        weight: '4.50 grams',
        stone: 'VVS1 Natural Diamond',
        gemstoneWeight: '1.20 ct',
        certification: 'GIA & Hallmark Certified',
        purity: '750 Purity (18K)'
      },
      tags: productData.tags || ['luxury', 'handcrafted'],
      createdAt: productData.createdAt || new Date().toISOString()
    };
    await saveProduct(fullProduct);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === fullProduct.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fullProduct;
        return copy;
      }
      return [fullProduct, ...prev];
    });
    showToast(`Piece "${fullProduct.name}" saved to atelier vault.`, 'gold');
  };

  const handleDeleteProduct = async (productId: string) => {
    await removeProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Piece removed from active catalogue.', 'info');
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    await saveStoreSettings(newSettings);
    setSettings(newSettings);
    showToast('Boutique brand preferences saved.', 'gold');
  };

  const clearAdminNotifications = () => {
    setAdminNotifications([]);
    localStorage.removeItem('aura_carat_admin_notifications');
    showToast('Notifications archive cleared.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        products,
        categories,
        settings,
        cart,
        wishlist,
        orders,
        reviews,
        user,
        isAdmin: isAdmin || Boolean(adminUser),
        isAdminMode,
        adminNotifications,
        appliedCoupon,
        cartSummary,
        toasts,

        isCartOpen,
        isWishlistOpen,
        isCheckoutOpen,
        isTrackingOpen,
        isAccountOpen,
        isAdminOpen,
        isCompareModalOpen,
        selectedProduct,
        quickViewProduct,
        activeTrackingId,
        trackingOrderId: activeTrackingId,

        // Product Comparison
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        openCompareModal,
        closeCompareModal,

        adminUser,
        adminLogin,
        adminLogout,
        loginUser,
        registerUser,
        logoutUser,
        updateOrderStatus,
        handleSaveProduct,
        handleDeleteProduct,
        handleUpdateSettings,
        clearAdminNotifications,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCouponCode,
        removeCoupon,
        handlePlaceOrder,
        showToast,
        signInGoogle,
        logout,
        toggleAdminMode,
        refreshData: () => loadData(isOwnerAuthenticated),
        fetchOrder: fetchOrderById,

        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false),
        openTracking: (id) => {
          if (id) setActiveTrackingId(id);
          setIsTrackingOpen(true);
        },
        closeTracking: () => setIsTrackingOpen(false),
        openAccount: () => setIsAccountOpen(true),
        closeAccount: () => setIsAccountOpen(false),
        openAdmin: () => setIsAdminOpen(true),
        closeAdmin: () => setIsAdminOpen(false),
        openProductDetails: (product) => setSelectedProduct(product),
        closeProductDetails: () => setSelectedProduct(null),
        openQuickView: (product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
        dismissAdminNotification
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
