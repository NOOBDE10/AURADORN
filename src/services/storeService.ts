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
  onSnapshot,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Category, Order, OrderStatus, Review, StoreSettings, NewsletterSubscriber } from '../types';
import { INITIAL_CATEGORIES, INITIAL_SETTINGS } from '../data/initialData';

/** Recursively strips `undefined` values, which Firestore rejects. */
export function sanitizeForFirestore<T>(val: T): T {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(item => sanitizeForFirestore(item)) as unknown as T;
  if (typeof val === 'object' && !(val instanceof Date)) {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) res[k] = sanitizeForFirestore(v);
    }
    return res as T;
  }
  return val;
}

// ---------------- ADMIN ----------------

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

// ---------------- PRODUCTS ----------------

export async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'));
  const items: Product[] = [];
  snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() } as Product));
  items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return items;
}

export async function saveProduct(product: Product): Promise<void> {
  await setDoc(
    doc(db, 'products', product.id),
    sanitizeForFirestore({ ...product, updatedAt: new Date().toISOString() })
  );
}

export async function removeProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
}

// ---------------- CATEGORIES ----------------

export async function fetchCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  if (snapshot.empty) return INITIAL_CATEGORIES;
  const items: Category[] = [];
  snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() } as Category));
  items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
  return items;
}

export async function saveCategory(category: Category): Promise<void> {
  await setDoc(doc(db, 'categories', category.id), sanitizeForFirestore(category));
}

export async function removeCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', categoryId));
}

// ---------------- SETTINGS ----------------

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const snapshot = await getDoc(doc(db, 'settings', 'general'));
  if (!snapshot.exists()) return INITIAL_SETTINGS;
  const data = snapshot.data() as Partial<StoreSettings>;
  return {
    ...INITIAL_SETTINGS,
    ...data,
    heroBanner: { ...INITIAL_SETTINGS.heroBanner, ...(data.heroBanner || {}) },
  };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(settings));
}

// ---------------- ORDERS ----------------

export interface PlaceOrderRequest {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number; option?: string }>;
}

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network error. Please check your internet connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again or contact us on WhatsApp.');
  }
  return data as T;
}

/** Order is validated, priced and saved on the server (api/place-order.ts). */
export async function placeOrder(request: PlaceOrderRequest): Promise<Order> {
  const { order } = await callFunction<{ order: Order }>('place-order', request);
  return order;
}

/** Customer order lookup: needs both the order ID and the phone number used at checkout. */
export async function trackOrder(orderId: string, phone: string): Promise<Order | null> {
  const { order } = await callFunction<{ order: Order | null }>('track-order', { orderId, phone });
  return order;
}

/** Admin only: live list of all orders, newest first. */
export function subscribeToOrders(onChange: (orders: Order[]) => void, onError: (e: Error) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    snapshot => {
      const orders: Order[] = [];
      snapshot.forEach(d => orders.push({ id: d.id, ...d.data() } as Order));
      onChange(orders);
    },
    onError
  );
}

const STATUS_TEXT: Record<OrderStatus, { title: string; desc: string }> = {
  pending: { title: 'Order Received', desc: 'We have received your order.' },
  confirmed: { title: 'Order Confirmed', desc: 'Your order has been confirmed.' },
  processing: { title: 'Packed', desc: 'Your jewellery has been packed.' },
  shipped: { title: 'Handed to Courier', desc: 'Your parcel is on its way.' },
  delivered: { title: 'Delivered', desc: 'Delivered and cash collected.' },
  cancelled: { title: 'Order Cancelled', desc: 'This order was cancelled.' },
};

export async function updateOrder(
  orderId: string,
  changes: { status?: OrderStatus; trackingNumber?: string; courierName?: string }
): Promise<void> {
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updatedAt: now };
  if (changes.trackingNumber !== undefined) update.trackingNumber = changes.trackingNumber;
  if (changes.courierName !== undefined) update.courierName = changes.courierName;
  if (changes.status) {
    update.status = changes.status;
    update.trackingUpdates = arrayUnion({
      status: changes.status,
      title: STATUS_TEXT[changes.status].title,
      description: STATUS_TEXT[changes.status].desc,
      timestamp: now,
      completed: true,
    });
  }
  await updateDoc(doc(db, 'orders', orderId), update);
}

// ---------------- REVIEWS ----------------

export async function fetchApprovedReviews(): Promise<Review[]> {
  const snapshot = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'approved')));
  const revs: Review[] = [];
  snapshot.forEach(d => revs.push({ id: d.id, ...d.data() } as Review));
  return revs;
}

export async function fetchAllReviews(): Promise<Review[]> {
  const snapshot = await getDocs(collection(db, 'reviews'));
  const revs: Review[] = [];
  snapshot.forEach(d => revs.push({ id: d.id, ...d.data() } as Review));
  revs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return revs;
}

/** Reviews are saved as pending and only appear after the admin approves them. */
export async function addReview(review: Omit<Review, 'id' | 'createdAt' | 'status' | 'verifiedPurchase'>): Promise<void> {
  const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await setDoc(
    doc(db, 'reviews', id),
    sanitizeForFirestore({
      ...review,
      id,
      status: 'pending',
      verifiedPurchase: false,
      createdAt: new Date().toISOString(),
    })
  );
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'pending'): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { status });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

// ---------------- NEWSLETTER ----------------

export async function subscribeNewsletter(
  email: string,
  source: string = 'footer_newsletter'
): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }
  const id = `sub_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`.slice(0, 128);
  try {
    await setDoc(doc(db, 'subscribers', id), {
      id,
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source,
      active: true,
    });
  } catch {
    // Create-only rule: an existing subscriber cannot be overwritten.
    return { success: true, message: 'You are already subscribed.', alreadySubscribed: true };
  }
  return { success: true, message: 'Thank you for subscribing! We will share new arrivals and offers with you.' };
}

export async function fetchSubscribers(): Promise<NewsletterSubscriber[]> {
  const snapshot = await getDocs(collection(db, 'subscribers'));
  const items: NewsletterSubscriber[] = [];
  snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() } as NewsletterSubscriber));
  return items;
}

export async function deleteSubscriber(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subscribers', id));
}
