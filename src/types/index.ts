export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductDetails {
  metal: string; // e.g. "18K Yellow Gold", "Platinum 950", "Rose Gold"
  karat?: string;
  weight?: string; // e.g. "4.85 grams"
  stone?: string; // e.g. "VVS1 Natural Diamond", "Ceylon Sapphire"
  gemstoneWeight?: string; // e.g. "1.20 Carat"
  certification?: string; // e.g. "GIA Certified", "IGI Certified"
  dimensions?: string;
  purity?: string;
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
  status: OrderStatus;
  orderStatus?: OrderStatus;
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
