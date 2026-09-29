import { AppliedCoupon, CartItem, Product, StoreSettings } from '../types';
import { formatPKR } from './format';

export interface CartSummary {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  itemCount: number;
  /** Rupees still needed to reach free delivery (0 when free or no threshold) */
  amountToFreeDelivery: number;
  /** Set when a coupon is applied but the cart is below its minimum */
  couponBelowMinimum: boolean;
}

/** Discount in PKR that a coupon gives on the given subtotal. */
export function couponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon || subtotal <= 0 || subtotal < (coupon.minOrder || 0)) return 0;
  const raw = coupon.type === 'percent'
    ? Math.round((subtotal * coupon.value) / 100)
    : Math.round(coupon.value);
  return Math.min(subtotal, Math.max(0, raw));
}

export function describeCoupon(coupon: Pick<AppliedCoupon, 'type' | 'value'>): string {
  return coupon.type === 'percent' ? `${coupon.value}% off` : `${formatPKR(coupon.value)} off`;
}

/** Single source of truth for cart totals — used by the cart, checkout and order creation. */
export function computeCartSummary(
  cart: CartItem[],
  coupon: AppliedCoupon | null,
  settings: Pick<StoreSettings, 'deliveryCharge' | 'freeDeliveryThreshold'>
): CartSummary {
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = couponDiscount(coupon, subtotal);
  const threshold = Number(settings.freeDeliveryThreshold) || 0;
  const qualifiesForFree = threshold > 0 && subtotal >= threshold;
  const delivery = subtotal === 0 || qualifiesForFree ? 0 : Math.max(0, Number(settings.deliveryCharge) || 0);
  const total = Math.max(0, subtotal - discount + delivery);

  return {
    subtotal,
    discount,
    delivery,
    total,
    itemCount,
    amountToFreeDelivery: threshold > 0 && !qualifiesForFree ? threshold - subtotal : 0,
    couponBelowMinimum: Boolean(coupon && subtotal > 0 && subtotal < (coupon.minOrder || 0)),
  };
}

/** Price slider range that fits the current catalogue, rounded to friendly rupee steps. */
export function priceSliderBounds(products: Pick<Product, 'price'>[]): { max: number; step: number } {
  const highest = products.reduce((m, p) => Math.max(m, p.price), 0);
  if (highest <= 0) return { max: 10000, step: 500 };
  const magnitude = Math.pow(10, Math.floor(Math.log10(highest)));
  const step = Math.max(100, magnitude / 10);
  return { max: Math.ceil(highest / step) * step, step };
}

/** Pieces with a size or finish choice must be chosen on the product page before adding to the bag. */
export function needsOptionChoice(product: Pick<Product, 'sizeOptions' | 'metalOptions'>): boolean {
  return (product.sizeOptions?.length || 0) > 0 || (product.metalOptions?.length || 0) > 1;
}

/** A product can be bought when it is published and has stock. */
export function isPurchasable(product: Product): boolean {
  return product.status === 'active' && product.stock > 0;
}
