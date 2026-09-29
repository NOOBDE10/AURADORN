import { Category, StoreSettings } from '../types';

/**
 * Used until the owner saves settings from Admin > Settings.
 * Contact details are intentionally blank so nothing fake is shown publicly.
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'AURA ADORN',
  tagline: 'Fine Jewellery',
  logo: '',
  phone: '',
  whatsappNumber: '',
  email: '',
  address: '',
  deliveryCharge: 250,
  freeDeliveryThreshold: 5000,
  announcementText: 'Cash on Delivery available all over Pakistan',
  heroBanner: {
    tag: 'New Collection',
    title: 'Timeless Elegance, Crafted for You',
    subtitle: 'Discover our handpicked collection of rings, necklaces, earrings and bridal sets — delivered to your door with Cash on Delivery.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=85',
    ctaText: 'Shop the Collection',
    ctaLink: '#products',
  },
  aboutText: 'Handpicked jewellery for every occasion, delivered across Pakistan with Cash on Delivery.',
  highlights: ['Cash on Delivery Nationwide', 'Secure Packaging', 'WhatsApp Support'],
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  returnPolicy: 'Please check your parcel at the time of delivery. If an item arrives damaged or incorrect, contact us on WhatsApp within 3 days of delivery with photos and we will arrange an exchange.',
  shippingPolicy: 'Orders are confirmed by phone and dispatched within 1-2 working days. Delivery usually takes 3-5 working days across Pakistan. You pay in cash when the parcel arrives.',
  warrantyPolicy: 'Keep your jewellery away from water, perfume and chemicals, and store each piece separately in its pouch or box to keep it shining.',
  privacyPolicy: 'We only use your name, phone number, email and address to process and deliver your order and to contact you about it. We never sell or share your details with third parties other than our delivery partner.',
};

/** Starter categories the owner can create with one click from Admin > Categories. */
export const DEFAULT_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Solitaires, bands and statement rings.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Pendants, chokers and chains.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Studs, drops, jhumkas and hoops.',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 3,
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Tennis bracelets and link bracelets.',
    image: 'https://images.unsplash.com/photo-1611591475841-455b80e556e4?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'bangles',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Traditional kadas and modern cuffs.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 5,
  },
  {
    id: 'sets',
    name: 'Bridal Sets',
    slug: 'sets',
    description: 'Complete bridal and party jewellery sets.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
    featured: true,
    sortOrder: 6,
  },
];
