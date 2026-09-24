import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, Category, Order, OrderStatus, Review, StoreSettings, CustomerProfile, NewsletterSubscriber } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_REVIEWS } from '../data/initialData';

const LOCAL_PRODUCTS_KEY = 'aura_carat_products';
const LOCAL_CATEGORIES_KEY = 'aura_carat_categories';
const LOCAL_SETTINGS_KEY = 'aura_carat_settings';
const LOCAL_ORDERS_KEY = 'aura_carat_orders';
const LOCAL_REVIEWS_KEY = 'aura_carat_reviews';
const LOCAL_SUBSCRIBERS_KEY = 'aura_carat_subscribers';

// Helper to get local data
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading localStorage for', key, e);
  }
  return fallback;
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed saving localStorage for', key, e);
  }
}

// ---------------- PRODUCTS SERVICE ----------------

export async function fetchProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      setLocal(LOCAL_PRODUCTS_KEY, items);
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }

  // If Firestore collection is empty or unreachable, return local or initial
  const local = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS);
  return local.length > 0 ? local : INITIAL_PRODUCTS;
}

export async function saveProduct(product: Product): Promise<void> {
  // Update local immediately
  const existing = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS);
  const index = existing.findIndex(p => p.id === product.id);
  if (index >= 0) {
    existing[index] = product;
  } else {
    existing.unshift(product);
  }
  setLocal(LOCAL_PRODUCTS_KEY, existing);

  // Sync to Firestore only when an authenticated session is active
  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const existing = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS);
  const filtered = existing.filter(p => p.id !== productId);
  setLocal(LOCAL_PRODUCTS_KEY, filtered);

  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  }
}

// ---------------- CATEGORIES SERVICE ----------------

export async function fetchCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: Category[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Category);
      });
      setLocal(LOCAL_CATEGORIES_KEY, items);
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
  }
  return getLocal<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES);
}

export async function saveCategory(category: Category): Promise<void> {
  const existing = getLocal<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES);
  const index = existing.findIndex(c => c.id === category.id);
  if (index >= 0) {
    existing[index] = category;
  } else {
    existing.push(category);
  }
  setLocal(LOCAL_CATEGORIES_KEY, existing);

  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
    }
  }
}

export async function removeCategory(categoryId: string): Promise<void> {
  const existing = getLocal<Category[]>(LOCAL_CATEGORIES_KEY, INITIAL_CATEGORIES);
  setLocal(LOCAL_CATEGORIES_KEY, existing.filter(c => c.id !== categoryId));

  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  }
}

// ---------------- ORDERS SERVICE ----------------

export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AC-2026-${timestamp}${random}`;
}

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  storeOwnerEmail: string;
}

export async function placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingUpdates'>): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    status: 'pending',
    createdAt: now,
    trackingUpdates: [
      {
        status: 'pending',
        title: 'Order Placed (Cash on Delivery)',
        description: 'Your bespoke jewellery order has been received and logged into our boutique dispatch queue.',
        timestamp: now,
        completed: true
      }
    ]
  };

  // Save to local cache first
  const existingOrders = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  existingOrders.unshift(newOrder);
  setLocal(LOCAL_ORDERS_KEY, existingOrders);

  // Save immediately to Firestore
  try {
    await setDoc(doc(db, 'orders', orderId), newOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
  }

  // Deduct stock for purchased items in local cache
  try {
    const products = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, INITIAL_PRODUCTS);
    let stockModified = false;
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) prod.status = 'out_of_stock';
        stockModified = true;
      }
    }
    if (stockModified) {
      setLocal(LOCAL_PRODUCTS_KEY, products);
    }
  } catch (e) {
    console.warn('Stock update warning:', e);
  }

  // Trigger Admin Notification (Store Owner: nirbanmubashirzubair@gmail.com)
  sendOwnerOrderNotification({
    orderId,
    customerName: newOrder.customerName,
    phone: newOrder.phone,
    email: newOrder.email,
    address: `${newOrder.address}, ${newOrder.area}, ${newOrder.city} ${newOrder.postalCode || ''}`,
    totalAmount: newOrder.totalAmount,
    items: newOrder.items.map(i => ({ name: i.productName, quantity: i.quantity, price: i.price })),
    storeOwnerEmail: 'nirbanmubashirzubair@gmail.com'
  });

  return newOrder;
}

export async function fetchAllOrders(isAdmin = false): Promise<Order[]> {
  // Only attempt Firestore remote collection list when the user is signed in to Firebase Auth with admin privileges
  if (isAdmin && auth.currentUser) {
    try {
      const colRef = collection(db, 'orders');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const orders: Order[] = [];
        snapshot.forEach(docSnap => {
          orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        // Sort newest first
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLocal(LOCAL_ORDERS_KEY, orders);
        return orders;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  }
  return getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const cleanId = orderId.trim();
  if (!cleanId) return null;

  // Check local cache first
  const localOrders = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const found = localOrders.find(o => o.id.toUpperCase() === cleanId.toUpperCase());
  if (found) return found;

  // Fetch individual document from Firestore
  try {
    const snap = await getDoc(doc(db, 'orders', cleanId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `orders/${cleanId}`);
  }
  return null;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const existingOrders = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const order = existingOrders.find(o => o.id === orderId);

  const statusDescriptions: Record<OrderStatus, { title: string; desc: string }> = {
    pending: { title: 'Order Received', desc: 'Order is awaiting boutique confirmation.' },
    confirmed: { title: 'Order Confirmed', desc: 'Jewellery pieces allocated from vault and certified.' },
    processing: { title: 'Hand-Polishing & Packaging', desc: 'Inspecting carats and packing in luxury velvet presentation chest.' },
    shipped: { title: 'Handed to Armed / Insured Courier', desc: 'Package dispatched for safe white-glove transit.' },
    delivered: { title: 'Delivered & Payment Received', desc: 'Cash on delivery collected and signed by recipient.' },
    cancelled: { title: 'Order Cancelled', desc: 'This order was cancelled.' }
  };

  const now = new Date().toISOString();

  if (order) {
    order.status = newStatus;
    order.updatedAt = now;
    if (!order.trackingUpdates) order.trackingUpdates = [];
    order.trackingUpdates.push({
      status: newStatus,
      title: statusDescriptions[newStatus].title,
      description: statusDescriptions[newStatus].desc,
      timestamp: now,
      completed: true
    });
    setLocal(LOCAL_ORDERS_KEY, existingOrders);
  }

  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: now,
        trackingUpdates: order?.trackingUpdates || []
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  }
}

// ---------------- STORE SETTINGS SERVICE ----------------

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as StoreSettings;
      const normalized: StoreSettings = {
        ...INITIAL_SETTINGS,
        ...data,
        brandName: 'AURA ADORN',
        announcementText: data.announcementText?.includes('LUXE10') 
          ? INITIAL_SETTINGS.announcementText 
          : (data.announcementText || INITIAL_SETTINGS.announcementText)
      };
      setLocal(LOCAL_SETTINGS_KEY, normalized);
      return normalized;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/general');
  }
  const cached = getLocal<StoreSettings>(LOCAL_SETTINGS_KEY, INITIAL_SETTINGS);
  return {
    ...INITIAL_SETTINGS,
    ...cached,
    brandName: 'AURA ADORN',
    announcementText: cached.announcementText?.includes('LUXE10') 
      ? INITIAL_SETTINGS.announcementText 
      : (cached.announcementText || INITIAL_SETTINGS.announcementText)
  };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  setLocal(LOCAL_SETTINGS_KEY, settings);
  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
    }
  }
}

// ---------------- REVIEWS SERVICE ----------------

export async function fetchReviews(): Promise<Review[]> {
  try {
    const colRef = collection(db, 'reviews');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const revs: Review[] = [];
      snapshot.forEach(d => revs.push({ id: d.id, ...d.data() } as Review));
      setLocal(LOCAL_REVIEWS_KEY, revs);
      return revs;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reviews');
  }
  return getLocal<Review[]>(LOCAL_REVIEWS_KEY, INITIAL_REVIEWS);
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
  const newRev: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    status: 'approved', // auto-approved for instant satisfaction, admin can moderate
    createdAt: new Date().toISOString()
  };

  const existing = getLocal<Review[]>(LOCAL_REVIEWS_KEY, INITIAL_REVIEWS);
  existing.unshift(newRev);
  setLocal(LOCAL_REVIEWS_KEY, existing);

  try {
    await setDoc(doc(db, 'reviews', newRev.id), newRev);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reviews/${newRev.id}`);
  }

  return newRev;
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'pending'): Promise<void> {
  const existing = getLocal<Review[]>(LOCAL_REVIEWS_KEY, INITIAL_REVIEWS);
  const rev = existing.find(r => r.id === reviewId);
  if (rev) rev.status = status;
  setLocal(LOCAL_REVIEWS_KEY, existing);

  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const existing = getLocal<Review[]>(LOCAL_REVIEWS_KEY, INITIAL_REVIEWS);
  setLocal(LOCAL_REVIEWS_KEY, existing.filter(r => r.id !== reviewId));

  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
  }
}

// ---------------- ADMIN ORDER NOTIFICATION DISPATCH ----------------

export function sendOwnerOrderNotification(payload: OrderNotificationPayload) {
  console.info('🔔 [Aura & Carat Admin Notification Dispatch]');
  console.info(`Target Owner: ${payload.storeOwnerEmail}`);
  console.info(`Order ID: ${payload.orderId} | Value: $${payload.totalAmount}`);
  console.info(`Customer: ${payload.customerName} (${payload.phone} - ${payload.email})`);
  console.info(`Shipping: ${payload.address}`);
  console.info(`Items:`, payload.items);

  // Store in notifications history for immediate Admin Panel banner & badge display
  try {
    const notifs = getLocal<OrderNotificationPayload[]>('aura_carat_admin_notifications', []);
    notifs.unshift(payload);
    setLocal('aura_carat_admin_notifications', notifs.slice(0, 50));
  } catch (e) {
    console.error(e);
  }
}

// ---------------- NEWSLETTER SUBSCRIBERS SERVICE ----------------

export async function subscribeNewsletter(
  email: string, 
  source: string = 'footer_newsletter'
): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  // Check local subscribers cache
  const localSubscribers = getLocal<NewsletterSubscriber[]>(LOCAL_SUBSCRIBERS_KEY, []);
  const existing = localSubscribers.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { 
      success: true, 
      message: 'You are already on our private launch invitation list.', 
      alreadySubscribed: true 
    };
  }

  // Safe Firestore document ID
  const sanitizedId = `sub_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const newSubscriber: NewsletterSubscriber = {
    id: sanitizedId,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    source,
    active: true
  };

  // Save to local cache immediately
  localSubscribers.unshift(newSubscriber);
  setLocal(LOCAL_SUBSCRIBERS_KEY, localSubscribers);

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'subscribers', sanitizedId), newSubscriber);
  } catch (error) {
    // If offline or permission issue, handle gracefully
    console.warn('Firestore subscription sync notice:', error);
  }

  return {
    success: true,
    message: 'Welcome to the AURA ADORN Private Salon. You are registered for upcoming product launch previews.'
  };
}

export async function fetchSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const colRef = collection(db, 'subscribers');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: NewsletterSubscriber[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as NewsletterSubscriber);
      });
      setLocal(LOCAL_SUBSCRIBERS_KEY, items);
      return items;
    }
  } catch (error) {
    // In unauthenticated mode, gracefully use local
    console.warn('Subscriber list retrieval note:', error);
  }
  return getLocal<NewsletterSubscriber[]>(LOCAL_SUBSCRIBERS_KEY, []);
}

export async function deleteSubscriber(id: string): Promise<void> {
  const existing = getLocal<NewsletterSubscriber[]>(LOCAL_SUBSCRIBERS_KEY, []);
  setLocal(LOCAL_SUBSCRIBERS_KEY, existing.filter(s => s.id !== id));

  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subscribers/${id}`);
    }
  }
}

