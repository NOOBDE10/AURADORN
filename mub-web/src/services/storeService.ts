import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  AppliedCoupon,
  CartItem,
  Category,
  Coupon,
  CustomerProfile,
  NewsletterSubscriber,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
  TrackingStep,
} from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../data/initialData';
import { computeCartSummary } from '../utils/pricing';
import { sendNewOrderEmail } from './emailService';

type OnError = (error: Error) => void;

function withId<T>(snap: { id: string; data: () => unknown }): T {
  return { ...(snap.data() as object), id: snap.id } as T;
}

function logError(label: string): OnError {
  return (error) => console.error(`[Firestore] ${label}:`, error);
}

// ---------------- PUBLIC LIVE DATA ----------------

export function subscribeProducts(onData: (items: Product[]) => void, onError: OnError = logError('products')): Unsubscribe {
  return onSnapshot(
    collection(db, 'products'),
    snap => {
      const items = snap.docs.map(d => {
        const p = withId<Product>(d);
        return {
          ...p,
          images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
          details: p.details || { metal: '' },
          stock: Number(p.stock) || 0,
          price: Number(p.price) || 0,
          originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
          rating: 0,
          reviewCount: 0,
        };
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    onError
  );
}

export function subscribeCategories(onData: (items: Category[]) => void, onError: OnError = logError('categories')): Unsubscribe {
  return onSnapshot(
    collection(db, 'categories'),
    snap => {
      const items = snap.docs.map(d => ({ ...withId<Category>(d), itemCount: 0 }));
      items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.name.localeCompare(b.name));
      onData(items);
    },
    onError
  );
}

export function normalizeSettings(data: Partial<StoreSettings> | undefined): StoreSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
  return {
    ...merged,
    heroBanner: { ...DEFAULT_SETTINGS.heroBanner, ...(data?.heroBanner || {}) },
    highlights: Array.isArray(data?.highlights) && data!.highlights.length > 0
      ? data!.highlights
      : DEFAULT_SETTINGS.highlights,
    deliveryCharge: Number(merged.deliveryCharge) || 0,
    freeDeliveryThreshold: Number(merged.freeDeliveryThreshold) || 0,
  };
}

export function subscribeSettings(onData: (s: StoreSettings) => void, onError: OnError = logError('settings')): Unsubscribe {
  return onSnapshot(
    doc(db, 'settings', 'general'),
    snap => onData(normalizeSettings(snap.exists() ? (snap.data() as Partial<StoreSettings>) : undefined)),
    onError
  );
}

export function subscribeApprovedReviews(onData: (items: Review[]) => void, onError: OnError = logError('reviews')): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'reviews'), where('status', '==', 'approved')),
    snap => onData(sortNewest(snap.docs.map(d => withId<Review>(d)))),
    onError
  );
}

function sortNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ---------------- ADMIN ----------------

/** True when the signed-in user has a document in the `admins` collection. */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch (e) {
    console.warn('Admin check failed:', e);
    return false;
  }
}

export function subscribeAllOrders(onData: (items: Order[]) => void, onError: OnError = logError('orders')): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    snap => onData(snap.docs.map(d => normalizeOrder(withId<Order>(d)))),
    onError
  );
}

export function subscribeAllReviews(onData: (items: Review[]) => void, onError: OnError = logError('all reviews')): Unsubscribe {
  return onSnapshot(collection(db, 'reviews'), snap => onData(sortNewest(snap.docs.map(d => withId<Review>(d)))), onError);
}

export function subscribeCoupons(onData: (items: Coupon[]) => void, onError: OnError = logError('coupons')): Unsubscribe {
  return onSnapshot(collection(db, 'coupons'), snap => onData(sortNewest(snap.docs.map(d => withId<Coupon>(d)))), onError);
}

export function subscribeSubscribers(onData: (items: NewsletterSubscriber[]) => void, onError: OnError = logError('subscribers')): Unsubscribe {
  return onSnapshot(
    collection(db, 'subscribers'),
    snap => onData(
      snap.docs
        .map(d => withId<NewsletterSubscriber>(d))
        .sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''))
    ),
    onError
  );
}

// ---------------- PRODUCTS ----------------

export async function saveProduct(product: Product): Promise<void> {
  // rating & reviewCount are derived from reviews, never stored
  const { rating: _r, reviewCount: _c, ...data } = product;
  await setDoc(doc(db, 'products', product.id), { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
}

// ---------------- CATEGORIES ----------------

export async function saveCategory(category: Omit<Category, 'itemCount'> & { itemCount?: number }): Promise<void> {
  const { itemCount: _i, ...data } = category;
  await setDoc(doc(db, 'categories', category.id), data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', categoryId));
}

export async function createDefaultCategories(): Promise<void> {
  const batch = writeBatch(db);
  DEFAULT_CATEGORIES.forEach(c => batch.set(doc(db, 'categories', c.id), c));
  await batch.commit();
}

// ---------------- SETTINGS ----------------

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'general'), settings);
}

// ---------------- COUPONS ----------------

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  const code = normalizeCouponCode(coupon.code);
  if (!code) throw new Error('Please enter a coupon code (letters and numbers only).');
  await setDoc(doc(db, 'coupons', code), { ...coupon, id: code, code });
}

export async function deleteCoupon(code: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', code));
}

/** Looks up a coupon and checks it can be used on this subtotal. Throws a customer-friendly error. */
export async function validateCoupon(rawCode: string, subtotal: number): Promise<AppliedCoupon> {
  const code = normalizeCouponCode(rawCode);
  if (!code) throw new Error('Please enter a coupon code.');

  const snap = await getDoc(doc(db, 'coupons', code));
  if (!snap.exists()) throw new Error(`"${code}" is not a valid coupon code.`);

  const c = withId<Coupon>(snap);
  if (!c.active) throw new Error(`Coupon "${code}" is no longer active.`);
  if (c.expiresAt && new Date(`${c.expiresAt}T23:59:59`) < new Date()) {
    throw new Error(`Coupon "${code}" has expired.`);
  }
  if (c.maxUses > 0 && c.usedCount >= c.maxUses) {
    throw new Error(`Coupon "${code}" has reached its usage limit.`);
  }
  if (c.minOrder > 0 && subtotal < c.minOrder) {
    throw new Error(`Coupon "${code}" needs a minimum order of Rs. ${c.minOrder.toLocaleString('en-PK')}.`);
  }
  return { code, type: c.type, value: Number(c.value) || 0, minOrder: Number(c.minOrder) || 0 };
}

// ---------------- ORDERS ----------------

const ORDER_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Hard-to-guess order id, e.g. "AA-7K3M9QX2" — the id is what customers use to track. */
export function generateOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const suffix = Array.from(bytes, b => ORDER_ID_ALPHABET[b % ORDER_ID_ALPHABET.length]).join('');
  return `AA-${suffix}`;
}

const STATUS_TEXT: Record<OrderStatus, { title: string; desc: string }> = {
  pending: { title: 'Order Placed', desc: 'We have received your order and will call you to confirm it.' },
  confirmed: { title: 'Order Confirmed', desc: 'Your order has been confirmed by phone.' },
  processing: { title: 'Packing', desc: 'Your jewellery is being checked and packed.' },
  shipped: { title: 'Dispatched', desc: 'Your parcel has been handed to the courier.' },
  delivered: { title: 'Delivered', desc: 'Parcel delivered and cash payment received. Thank you!' },
  cancelled: { title: 'Order Cancelled', desc: 'This order was cancelled.' },
};

/** Statuses at which the ordered quantity is held out of stock. */
const STOCK_HOLDING: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];

function normalizeOrder(o: Order): Order {
  return { ...o, status: o.status || o.orderStatus || 'pending', trackingUpdates: o.trackingUpdates || [] };
}

export interface PlaceOrderInput {
  customerId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode?: string;
  notes?: string;
  cart: CartItem[];
  coupon: AppliedCoupon | null;
  settings: StoreSettings;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const { cart, settings } = input;
  if (cart.length === 0) throw new Error('Your bag is empty.');

  for (const item of cart) {
    if (item.product.status !== 'active' || item.product.stock <= 0) {
      throw new Error(`"${item.product.name}" is currently out of stock. Please remove it from your bag.`);
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Only ${item.product.stock} of "${item.product.name}" available. Please reduce the quantity.`);
    }
  }

  // Re-check the coupon right before ordering (it may have expired or run out).
  let coupon = input.coupon;
  if (coupon) {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    try {
      coupon = await validateCoupon(coupon.code, subtotal);
    } catch {
      coupon = null;
    }
  }

  const summary = computeCartSummary(cart, coupon, settings);
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const order: Order = {
    id: orderId,
    customerId: input.customerId || null,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    area: input.area,
    postalCode: input.postalCode || '',
    notes: input.notes || '',
    items: cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || '',
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
      metal: item.selectedMetal || '',
      size: item.selectedSize || '',
    })),
    subtotal: summary.subtotal,
    discount: summary.discount,
    couponCode: summary.discount > 0 && coupon ? coupon.code : null,
    deliveryCharge: summary.delivery,
    totalAmount: summary.total,
    paymentMethod: 'Cash on Delivery',
    status: 'pending',
    stockDeducted: false,
    trackingUpdates: [
      { status: 'pending', title: STATUS_TEXT.pending.title, description: STATUS_TEXT.pending.desc, timestamp: now, completed: true },
    ],
    createdAt: now,
  };

  await setDoc(doc(db, 'orders', orderId), order);

  if (order.couponCode) {
    updateDoc(doc(db, 'coupons', order.couponCode), { usedCount: increment(1) })
      .catch(e => console.warn('Coupon usage count not updated:', e));
  }

  // Fire-and-forget: the order is saved even if the email fails.
  void sendNewOrderEmail(order, settings.brandName);

  return order;
}

export function subscribeCustomerOrders(uid: string, onData: (items: Order[]) => void, onError: OnError = logError('my orders')): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'orders'), where('customerId', '==', uid)),
    snap => onData(sortNewest(snap.docs.map(d => normalizeOrder(withId<Order>(d))))),
    onError
  );
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const cleanId = orderId.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{4,64}$/.test(cleanId)) return null;
  try {
    const snap = await getDoc(doc(db, 'orders', cleanId));
    return snap.exists() ? normalizeOrder(withId<Order>(snap)) : null;
  } catch (e) {
    console.warn('Order lookup failed:', e);
    return null;
  }
}

/**
 * Changes an order's status and keeps stock in sync:
 * stock is subtracted when an order is first confirmed, and put back if it is
 * cancelled or moved back to pending.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async tx => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error('Order not found.');
    const order = normalizeOrder(withId<Order>(orderSnap));
    if (order.status === newStatus) return;

    const deduct = STOCK_HOLDING.includes(newStatus) && !order.stockDeducted;
    const restore = !STOCK_HOLDING.includes(newStatus) && Boolean(order.stockDeducted);

    // Firestore transactions require all reads before any writes.
    const qtyByProduct = new Map<string, number>();
    if (deduct || restore) {
      order.items.forEach(i => qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) || 0) + i.quantity));
    }
    const productSnaps = await Promise.all(
      [...qtyByProduct.keys()].map(id => tx.get(doc(db, 'products', id)))
    );

    productSnaps.forEach(snap => {
      if (!snap.exists()) return; // product was deleted — nothing to adjust
      const qty = qtyByProduct.get(snap.id) || 0;
      const current = Number(snap.data().stock) || 0;
      const next = deduct ? Math.max(0, current - qty) : current + qty;
      tx.update(snap.ref, { stock: next, updatedAt: new Date().toISOString() });
    });

    const now = new Date().toISOString();
    const step: TrackingStep = {
      status: newStatus,
      title: STATUS_TEXT[newStatus].title,
      description: STATUS_TEXT[newStatus].desc,
      timestamp: now,
      completed: true,
    };
    tx.update(orderRef, {
      status: newStatus,
      updatedAt: now,
      stockDeducted: deduct ? true : restore ? false : Boolean(order.stockDeducted),
      trackingUpdates: [...order.trackingUpdates, step],
    });
  });
}

export async function updateOrderNote(orderId: string, adminNote: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { adminNote, updatedAt: new Date().toISOString() });
}

export async function deleteOrder(orderId: string): Promise<void> {
  await deleteDoc(doc(db, 'orders', orderId));
}

// ---------------- REVIEWS ----------------

export async function submitReview(review: Pick<Review, 'productId' | 'productName' | 'customerName' | 'customerEmail' | 'rating' | 'title' | 'comment'>): Promise<void> {
  const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newReview: Review = {
    ...review,
    id,
    verifiedPurchase: false,
    status: 'pending', // shown on the site after the owner approves it in admin
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'reviews', id), newReview);
}

export async function setReviewStatus(reviewId: string, status: Review['status']): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), { status });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

// ---------------- CUSTOMERS ----------------

export async function saveCustomerProfile(profile: CustomerProfile): Promise<void> {
  await setDoc(doc(db, 'customers', profile.id), profile, { merge: true });
}

// ---------------- NEWSLETTER ----------------

export async function subscribeNewsletter(
  email: string,
  source = 'footer_newsletter'
): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const id = `sub_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`.slice(0, 128);
  const subscriber: NewsletterSubscriber = {
    id,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    source,
    active: true,
  };

  try {
    await setDoc(doc(db, 'subscribers', id), subscriber);
  } catch (e) {
    // Re-subscribing hits an existing document, which the rules treat as an (admin-only) update.
    if ((e as { code?: string }).code === 'permission-denied') {
      return { success: true, message: 'You are already on our list.', alreadySubscribed: true };
    }
    return { success: false, message: 'Could not subscribe right now. Please try again.' };
  }

  return { success: true, message: 'Thank you for subscribing! We will let you know about new arrivals and offers.' };
}

export async function deleteSubscriber(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subscribers', id));
}
