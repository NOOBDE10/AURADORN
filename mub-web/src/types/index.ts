export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductDetails {
  metal: string; // e.g. "18K Yellow Gold", "Silver 925"
  karat?: string;
  weight?: string; // e.g. "4.85 grams"
  stone?: string;
  gemstoneWeight?: string;
  certification?: string;
  dimensions?: string;
  purity?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  category: string;
  subCategory?: string;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  /** Optional prestige badge, set by the admin */
  loyaltyBadge?: {
    type: 'vault_exclusive' | 'limited_edition' | 'patron_reserve' | 'atelier_private' | 'connoisseur';
    label?: string;
    editionNumber?: string;
    pointsMultiplier?: number;
    perkNote?: string;
  };
  isLimitedEdition?: boolean;
  limitedPiecesCount?: number;
  images: string[];
  /** Derived at runtime from approved reviews — not stored */
  rating: number;
  /** Derived at runtime from approved reviews — not stored */
  reviewCount: number;
  details: ProductDetails;
  /** Finish / metal choices shown to the customer. Empty = only details.metal */
  metalOptions?: string[];
  /** Size choices shown to the customer. Empty = no size selector */
  sizeOptions?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  bannerImage?: string;
  /** Derived at runtime from products — not stored */
  itemCount: number;
  featured?: boolean;
  sortOrder?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedMetal?: string;
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  metal?: string;
  size?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  customerId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery';
  status: OrderStatus;
  /** Legacy alias of status kept for old documents */
  orderStatus?: OrderStatus;
  /** True once stock has been subtracted for this order (on confirmation) */
  stockDeducted?: boolean;
  /** Private note visible only in admin */
  adminNote?: string;
  trackingUpdates: TrackingStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending';
  createdAt: string;
}

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  /** Document id — always the upper-case code */
  id: string;
  code: string;
  type: CouponType;
  /** Percent (1-100) or fixed rupee amount */
  value: number;
  /** Minimum cart subtotal in PKR (0 = no minimum) */
  minOrder: number;
  /** Maximum total uses (0 = unlimited) */
  maxUses: number;
  usedCount: number;
  active: boolean;
  /** ISO date (yyyy-mm-dd) after which the code stops working; empty = never */
  expiresAt?: string;
  description?: string;
  createdAt: string;
}

export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
}

export interface HeroBannerConfig {
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsappNumber: string;
  /** Public contact email shown on the site */
  email: string;
  address: string;
  /** Delivery charge in PKR */
  deliveryCharge: number;
  /** Orders at or above this subtotal (PKR) ship free. 0 = never free */
  freeDeliveryThreshold: number;
  heroBanner: HeroBannerConfig;
  announcementText: string;
  aboutText: string;
  /** Three short trust points shown in the hero and footer */
  highlights: string[];
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  returnPolicy: string;
  shippingPolicy: string;
  warrantyPolicy: string;
  privacyPolicy: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
  active: boolean;
}
