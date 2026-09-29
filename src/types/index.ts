export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductDetails {
  metal: string; // Material & finish, e.g. "Gold-plated brass", "Oxidised silver-tone alloy"
  stone?: string; // e.g. "Kundan & pearls", "AD / cubic zirconia"
  color?: string;
  weight?: string;
  dimensions?: string;
  includes?: string; // e.g. "Necklace + earrings + tikka"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPrice?: number;
  discountPercentage: number;
  category: string;
  subCategory?: string;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  /** Luxury Patron & Loyalty tier classification */
  loyaltyBadge?: {
    type: 'vault_exclusive' | 'limited_edition' | 'patron_reserve' | 'atelier_private' | 'connoisseur';
    label?: string;
    editionNumber?: string; // e.g. "No. 07 of 50" or "1 of 25"
    pointsMultiplier?: number; // e.g. 2x or 3x Patron Points
    perkNote?: string;
  };
  isLimitedEdition?: boolean;
  limitedPiecesCount?: number;
  /** Size / colour choices shown to the customer, e.g. ["2.4", "2.6", "2.8"]. Empty = no choice. */
  options?: string[];
  optionLabel?: string; // e.g. "Bangle size", "Colour"
  images: string[];
  rating: number;
  reviewCount: number;
  details: ProductDetails;
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
  itemCount: number;
  featured?: boolean;
  order?: number;
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
  customerId?: string;
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
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery';
  couponCode?: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
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
  email: string;
  address: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  currency: string;
  currencySymbol: string;
  /** Email address that receives a notification for every new order. */
  orderAlertEmail?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  heroBanner: HeroBannerConfig;
  announcementText: string;
  returnPolicy: string;
  shippingPolicy: string;
  warrantyPolicy: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  savedAddresses?: Array<{
    address: string;
    city: string;
    area: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  wishlist: string[]; // product IDs
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
  active: boolean;
}
