import { Product, Category, StoreSettings, Review } from '../types';

/**
 * Defaults used until the admin saves settings in Firestore (settings/general).
 * Everything here is editable from Admin → Settings.
 */
export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'Aura Adorn',
  tagline: 'Artificial Jewellery • Luxury Look, Everyday Price',
  logo: '/logo.png',
  phone: '+92 333 8282369',
  whatsappNumber: '+923338282369',
  email: 'auraadornjewellers@gmail.com',
  orderAlertEmail: 'auraadornjewellers@gmail.com',
  address: 'Lahore, Pakistan (online store)',
  deliveryCharge: 200,
  freeDeliveryThreshold: 0,
  currency: 'PKR',
  currencySymbol: 'Rs',
  announcementText: 'Cash on Delivery all over Pakistan • Delivery Rs 200',
  heroBanner: {
    tag: 'New Collection',
    title: 'Elegant Artificial Jewellery for Every Occasion',
    subtitle: 'Bridal sets, jhumkas, bangles, rings and everyday pieces. Beautifully finished, honestly priced, delivered to your door with Cash on Delivery.',
    image: '/logo.png',
    ctaText: 'Shop Now',
    ctaLink: '#products'
  },
  returnPolicy: 'If your item arrives damaged or incorrect, contact us on WhatsApp within 3 days of delivery with photos and we will arrange an exchange.',
  shippingPolicy: 'We deliver all over Pakistan with Cash on Delivery. Orders are usually delivered within 3–5 working days. Delivery charge: Rs 200.',
  warrantyPolicy: 'All our jewellery is high-quality artificial (imitation) jewellery. To keep the finish bright, keep it away from water, perfume and sweat, and store it in a dry box or pouch.'
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'necklace-sets', name: 'Necklace Sets', slug: 'necklace-sets', description: 'Kundan, AD and pearl necklace sets with matching earrings.', image: '', itemCount: 0, featured: true },
  { id: 'earrings', name: 'Earrings', slug: 'earrings', description: 'Jhumkas, studs, tops, drops and chandbalis.', image: '', itemCount: 0, featured: true },
  { id: 'bangles', name: 'Bangles & Kangan', slug: 'bangles', description: 'Bangle sets, kangan, kara and bracelets.', image: '', itemCount: 0, featured: true },
  { id: 'rings', name: 'Rings', slug: 'rings', description: 'Adjustable, cocktail and AD rings.', image: '', itemCount: 0, featured: true },
  { id: 'bridal-sets', name: 'Bridal Sets', slug: 'bridal-sets', description: 'Complete bridal, walima and mehndi jewellery sets.', image: '', itemCount: 0, featured: true },
  { id: 'tikka-matha-patti', name: 'Tikka & Matha Patti', slug: 'tikka-matha-patti', description: 'Maang tikka, matha patti and jhoomar.', image: '', itemCount: 0, featured: true }
];

/** Products are managed from the admin panel; no demo products are shipped. */
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_REVIEWS: Review[] = [];
