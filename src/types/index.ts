export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number; // In PKR
  originalPrice: number;
  discountPercent: number;
  category: string;
  subcategory?: string;
  gender: 'women' | 'men' | 'child' | 'unisex';
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  variantStock: Record<string, number>; // key: "size_color" => stock
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  material: string;
  fabric: string;
  fit: string;
  careInstructions?: string[];
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface TrackingStep {
  status: OrderStatus;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  area: string;
  postalCode?: string;
  orderNotes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'Cash on Delivery';
  status: OrderStatus;
  createdAt: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  maxDiscount?: number;
  minOrderAmount: number;
  isActive: boolean;
  usageCount: number;
  expiresAt: string;
}

export interface StoreSettings {
  brandName: string;
  logoUrl?: string;
  announcementText: string;
  isAnnouncementActive: boolean;
  heroHeadline: string;
  heroSubtext: string;
  freeShippingThreshold: number;
  baseDeliveryDistanceKm: number;
  baseDeliveryRate: number;
  perKmDeliveryRate: number;
  storeBaseLocation: string;
  standardDeliveryFee: number;
  whatsappNumber: string;
  notificationEmail: string;
  storeStatus: 'open' | 'maintenance';
  currency: string;
}

export interface MonthlyArchive {
  id: string;
  monthName: string;
  year: number;
  archivedAt: string;
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  orders: Order[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address?: string;
  city?: string;
  area?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface AdminCredentials {
  name?: string;
  email: string;
  password: string;
  gatewayPasscode: string;
  isConfigured: boolean;
  recoveryKey?: string;
  lastUpdated: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  action:
    | 'GATEWAY_UNLOCKED'
    | 'GATEWAY_FAILED'
    | 'ADMIN_CREATED'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'DEVICE_LOCKED'
    | 'LOCKOUT_RESET'
    | 'CREDENTIALS_CHANGED';
  details: string;
  status: 'success' | 'warning' | 'danger';
}
