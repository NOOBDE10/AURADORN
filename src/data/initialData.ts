import { Product, Category, StoreSettings, Review } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'AA JEWELERS',
  tagline: 'Maison de Haute Joaillerie',
  logo: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80',
  phone: '+92 333 8282369',
  whatsappNumber: '+923338282369',
  email: 'auraadornjewellers@gmail.com',
  address: 'Suite 401, The Diamond Pavilion, Gulberg III, Lahore, Pakistan',
  deliveryCharge: 15,
  freeDeliveryThreshold: 200,
  currency: 'USD',
  currencySymbol: '$',
  announcementText: '✨ Complimentary Insured Delivery on orders over $200 | Use Code: AA10 for 10% OFF',
  heroBanner: {
    tag: 'Haute Joaillerie 2026 Collection',
    title: 'Timeless Elegance, Handcrafted in Pure Brilliance',
    subtitle: 'Discover artisanal 18K & 22K gold, conflict-free solitaire diamonds, and rare gemstones curated for generations of glamour.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=85',
    ctaText: 'Explore Collection',
    ctaLink: '#products'
  },
  returnPolicy: 'We offer 30-day complimentary insured returns or exchanges on all unworn fine jewellery with original certificates and tamper-proof security tags intact.',
  shippingPolicy: 'Orders are hand-packaged in velvet presentation boxes and delivered via insured express courier within 2-4 business days. Signature required upon delivery.',
  warrantyPolicy: 'Every piece comes with a lifetime authenticity guarantee, complimentary annual polishing, and GIA / IGI grading certificates for natural diamonds.'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Solitaire diamonds, bridal bands, and statement cocktail rings in 18K gold and platinum.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    itemCount: 18,
    featured: true
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Cascading diamond pendants, emerald chokers, and delicate yellow gold chains.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    itemCount: 14,
    featured: true
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Chandelier drops, diamond huggies, pearl studs, and heirloom filigree earrings.',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
    itemCount: 16,
    featured: true
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Tennis bracelets with brilliant-cut diamonds and flexible woven 18K gold links.',
    image: 'https://images.unsplash.com/photo-1611591475841-455b80e556e4?w=800&auto=format&fit=crop&q=80',
    itemCount: 10,
    featured: true
  },
  {
    id: 'bangles',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Traditional handcrafted bridal kadas and sleek contemporary open-cuff bangles.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    itemCount: 8,
    featured: true
  },
  {
    id: 'sets',
    name: 'Bridal Sets',
    slug: 'sets',
    description: 'Opulent multi-piece bridal jewellery sets crafted in 22K gold with precious stones.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
    itemCount: 6,
    featured: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'The Celeste Solitaire Diamond Ring',
    description: 'An ethereal 1.50-carat round brilliant-cut solitaire diamond held securely in a six-prong platinum crown, set along an 18K yellow gold knife-edge band. Hand-finished with micro-pavé bridge diamonds that shimmer from every angle.',
    price: 1850,
    originalPrice: 2200,
    discountPrice: 1850,
    discountPercentage: 16,
    category: 'rings',
    subCategory: 'Solitaire Rings',
    stock: 7,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    loyaltyBadge: {
      type: 'limited_edition',
      label: 'Limited Edition',
      editionNumber: 'Edition 12 of 50',
      pointsMultiplier: 2,
      perkNote: 'GIA Laser Inscription & Velvet Case'
    },
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 28,
    details: {
      metal: '18K Yellow Gold & Platinum 950',
      karat: '18 Karat',
      weight: '4.65 grams',
      stone: 'VVS1 Colorless Natural Diamond (F Color)',
      gemstoneWeight: '1.50 Carat Center + 0.15 Carat Pavé',
      certification: 'GIA Diamond Report #24819472',
      dimensions: 'Band width 2.1mm'
    },
    tags: ['Ring', 'Solitaire', 'Engagement', 'Diamond', '18K Gold'],
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'prod-002',
    name: 'L’Aura Royal Emerald Cascade Necklace',
    description: 'Inspired by Renaissance palace vaults, this masterwork showcases 3.20 carats of pear-cut Zambian emeralds framed by halo diamonds cascading down a dual-strand 18K solid yellow gold chain.',
    price: 3450,
    originalPrice: 4200,
    discountPrice: 3450,
    discountPercentage: 18,
    category: 'necklaces',
    subCategory: 'Statement Necklaces',
    stock: 4,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    loyaltyBadge: {
      type: 'vault_exclusive',
      label: 'Vault Exclusive',
      editionNumber: 'Piece 2 of 5 Worldwide',
      pointsMultiplier: 3,
      perkNote: 'Vault Concierge & White-Glove Hand Delivery'
    },
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475841-455b80e556e4?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 14,
    details: {
      metal: '18K Solid Warm Yellow Gold',
      karat: '18 Karat',
      weight: '16.80 grams',
      stone: 'Natural Zambian Emeralds & VS1 Diamonds',
      gemstoneWeight: '3.20 Carat Emeralds, 1.80 Carat Diamonds',
      certification: 'GRS Swiss Gem Lab Report #2026-8912',
      dimensions: 'Adjustable length 16 to 18 inches'
    },
    tags: ['Necklace', 'Emerald', 'Haute Joaillerie', 'Gold', 'Pendant'],
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'prod-003',
    name: 'Seraphina Diamond Chandelier Earrings',
    description: 'Graceful articulated drop earrings featuring marquise and round brilliant-cut diamonds that sway rhythmically with your every movement, capturing light like morning dew on petals.',
    price: 1290,
    originalPrice: 1550,
    discountPrice: 1290,
    discountPercentage: 17,
    category: 'earrings',
    subCategory: 'Drop & Dangle',
    stock: 9,
    status: 'active',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 32,
    details: {
      metal: '18K White Gold with Rhodium Finish',
      karat: '18 Karat',
      weight: '8.40 grams',
      stone: 'VS-SI Clarity Round & Marquise Diamonds',
      gemstoneWeight: '2.10 Carat Total Diamond Weight',
      certification: 'IGI Jewellery Appraisal Card',
      dimensions: '42mm drop length'
    },
    tags: ['Earrings', 'Diamond', 'Chandelier', 'White Gold', 'Party'],
    createdAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 'prod-004',
    name: 'Elysian Eternity Tennis Bracelet',
    description: 'A classic silhouette elevated to supreme luxury: 58 perfectly calibrated round brilliant diamonds set in a seamless four-prong 18K yellow gold setting with a hidden dual-latch safety clasp.',
    price: 2650,
    originalPrice: 3100,
    discountPrice: 2650,
    discountPercentage: 15,
    category: 'bracelets',
    subCategory: 'Tennis Bracelets',
    stock: 5,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    loyaltyBadge: {
      type: 'limited_edition',
      label: 'Limited Edition',
      editionNumber: 'Numbered 08 of 25',
      pointsMultiplier: 2,
      perkNote: 'Master Certificate & Velvet Pouch'
    },
    images: [
      'https://images.unsplash.com/photo-1611591475841-455b80e556e4?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 19,
    details: {
      metal: '18K Yellow Gold',
      karat: '18 Karat',
      weight: '12.20 grams',
      stone: 'Natural Brilliant-Cut Diamonds (G-H Color)',
      gemstoneWeight: '4.50 Carats Total Diamond Weight',
      certification: 'AA JEWELERS Master Certificate of Authenticity',
      dimensions: '7.0 inches standard length (customizable)'
    },
    tags: ['Bracelet', 'Tennis Bracelet', 'Diamonds', '18K Gold'],
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'prod-005',
    name: 'Noor-e-Kashmir Filigree Gold Bangle',
    description: 'An ode to centuries of artisan craft. Hand-chiseled 22K yellow gold bangle featuring floral lattice filigree, ruby cabochon highlights, and a smooth contoured interior for all-day comfort.',
    price: 2150,
    originalPrice: 2500,
    discountPrice: 2150,
    discountPercentage: 14,
    category: 'bangles',
    subCategory: 'Heritage Bangles',
    stock: 6,
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    loyaltyBadge: {
      type: 'atelier_private',
      label: 'Atelier Private',
      editionNumber: 'Artisan Batch No. 04',
      pointsMultiplier: 2,
      perkNote: 'Cast by Master Goldsmith with 22K Purity Stamp'
    },
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 22,
    details: {
      metal: '22K Hallmarked Yellow Gold',
      karat: '22 Karat (916 Purity)',
      weight: '24.50 grams',
      stone: 'Natural Burmese Ruby Cabochons',
      gemstoneWeight: '1.10 Carats Total Rubies',
      certification: 'Hallmarked 916 BIS Certified',
      dimensions: 'Size 2.6 (Inner diameter 60.3mm)'
    },
    tags: ['Bangle', '22K Gold', 'Bridal', 'Heritage', 'Filigree'],
    createdAt: '2026-02-10T16:00:00Z'
  },
  {
    id: 'prod-006',
    name: 'Sultana Diamond & Pearl Bridal Set',
    description: 'A breathtaking five-piece bridal trousseau including a magnificent bib collar necklace, matching statement jhumka earrings, a maang tikka, and twin diamond-accented bangles. Designed for the unforgettable modern bride.',
    price: 5800,
    originalPrice: 6900,
    discountPrice: 5800,
    discountPercentage: 16,
    category: 'sets',
    subCategory: 'Grand Bridal Trousseau',
    stock: 3,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    loyaltyBadge: {
      type: 'limited_edition',
      label: 'Limited Edition',
      editionNumber: 'Numbered Edition 1 of 3 Worldwide',
      pointsMultiplier: 3,
      perkNote: 'Includes Velvet Heirloom Chest & Master Trousseau Certificate'
    },
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 9,
    details: {
      metal: '22K & 18K Yellow Gold with Antique Polki finish',
      karat: '22 Karat Gold with 18K settings',
      weight: '98.50 grams Total Gold Weight',
      stone: 'Uncut Syndicate Polki Diamonds & Basra Seed Pearls',
      gemstoneWeight: '14.80 Carats Polki Diamonds',
      certification: 'Comprehensive IGI Bridal Trousseau Vault Certificate',
      dimensions: 'Includes custom luxury velvet trousseau chest'
    },
    tags: ['Bridal Set', 'Polki', 'Pearls', 'Wedding', 'Trousseau', 'Royal'],
    createdAt: '2026-01-05T11:00:00Z'
  },
  {
    id: 'prod-007',
    name: 'Aethel Solitaire Pear Diamond Pendant',
    description: 'A 1.00-carat teardrop pear-cut natural diamond suspended from a tapered diamond bail on an ultra-fine 18K rose gold cable chain. Subtle, hypnotic, and endlessly wearable.',
    price: 980,
    originalPrice: 1200,
    discountPrice: 980,
    discountPercentage: 18,
    category: 'necklaces',
    subCategory: 'Pendants',
    stock: 12,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 17,
    details: {
      metal: '18K Rose Gold',
      karat: '18 Karat',
      weight: '3.80 grams',
      stone: 'Natural Pear-Cut Diamond (G Color, VS2)',
      gemstoneWeight: '1.00 Carat Center Diamond',
      certification: 'GIA Dossier #59102482',
      dimensions: '18-inch chain with 16-inch jump ring'
    },
    tags: ['Necklace', 'Pendant', 'Rose Gold', 'Pear Diamond', 'Gift'],
    createdAt: '2026-02-14T08:00:00Z'
  },
  {
    id: 'prod-008',
    name: 'Vesper Sapphire & Diamond Halo Ring',
    description: 'An intense 2.40-carat Royal Blue Ceylon sapphire embraced by a shimmering halo of sixteen micropavé brilliant diamonds on an 18K white gold cathedral band.',
    price: 1950,
    originalPrice: 2350,
    discountPrice: 1950,
    discountPercentage: 17,
    category: 'rings',
    subCategory: 'Gemstone Rings',
    stock: 5,
    status: 'active',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    loyaltyBadge: {
      type: 'patron_reserve',
      label: 'Patron Reserve',
      editionNumber: 'VIP Allocation · 5 Pieces Only',
      pointsMultiplier: 2,
      perkNote: 'SSEF Swiss Gem Lab Report Included'
    },
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 21,
    details: {
      metal: '18K Solid White Gold',
      karat: '18 Karat',
      weight: '5.20 grams',
      stone: 'Unheated Ceylon Royal Blue Sapphire & Natural Diamonds',
      gemstoneWeight: '2.40 Carat Sapphire, 0.45 Carat Diamonds',
      certification: 'SSEF Swiss Gemmological Institute Report',
      dimensions: 'Crown width 11mm x 9mm'
    },
    tags: ['Ring', 'Sapphire', 'Royal Blue', 'Gemstone', 'Cocktail'],
    createdAt: '2026-01-25T13:15:00Z'
  },
  {
    id: 'prod-009',
    name: 'AA Royal Cuban Sovereign Link Chain',
    description: 'The definitive statement piece: Heavyweight 8mm bevel-cut Cuban curb chain forged from aerospace-grade 316L Stainless Steel with 18K triple PVD gold plating. 100% waterproof, sweatproof, hypoallergenic, with lifetime tarnish-free resilience.',
    price: 399,
    originalPrice: 750,
    discountPrice: 399,
    discountPercentage: 47,
    category: 'necklaces',
    subCategory: 'Chains & Necklaces',
    stock: 6,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    loyaltyBadge: {
      type: 'limited_edition',
      label: 'Flash Deal • 47% OFF',
      editionNumber: 'Numbered Batch #14',
      pointsMultiplier: 2,
      perkNote: 'Lifetime Tarnish-Proof Guarantee & Luxury Box'
    },
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475841-455b80e556e4?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 42,
    details: {
      metal: '316L Stainless Steel (18K Triple PVD Gold Plated)',
      karat: '18K PVD Gold Layer',
      weight: '48.50 grams',
      stone: 'VVS Micro-Pavé Cubic Zirconia Clasp Accent',
      gemstoneWeight: '0.35 Carat Clasp Accent',
      certification: 'AA JEWELLERS Stainless Steel Lifetime Authenticity Card',
      dimensions: '8mm width, 22-inch length'
    },
    tags: ['Necklace', 'Cuban Chain', 'Stainless Steel', 'Tarnish-Free', '18K Gold'],
    createdAt: '2026-03-05T10:00:00Z'
  },
  {
    id: 'prod-010',
    name: 'AA Imperial Roman Numeral Solitaire Bangle',
    description: 'An iconic tribute to timeless beauty and refined elegance. Hand-polished surgical 316L Stainless Steel with precision-engraved Roman numerals, accented with a brilliant-cut center solitaire stone and dual concealed safety spring-hinge.',
    price: 299,
    originalPrice: 580,
    discountPrice: 299,
    discountPercentage: 48,
    category: 'bangles',
    subCategory: 'Cuff & Bangles',
    stock: 4,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    loyaltyBadge: {
      type: 'vault_exclusive',
      label: 'Special Deal • 48% OFF',
      editionNumber: 'Artisan Batch #08',
      pointsMultiplier: 2,
      perkNote: 'Waterproof & Scratch-Resistant'
    },
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 38,
    details: {
      metal: '316L Surgical Stainless Steel (18K Mirror Gold)',
      karat: '18K Gold Mirror PVD',
      weight: '22.40 grams',
      stone: 'High-Brilliance Faceted Solitaire Gem',
      gemstoneWeight: '0.75 Carat Solitaire Center',
      certification: 'AA JEWELLERS Hallmark Certificate',
      dimensions: '6.5cm oval diameter'
    },
    tags: ['Bangle', 'Stainless Steel', 'Roman Numeral', 'Gold', 'Waterproof'],
    createdAt: '2026-03-08T11:20:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    productName: 'The Celeste Solitaire Diamond Ring',
    customerName: 'Eleanor Vance-Sterling',
    customerEmail: 'eleanor.vance@example.com',
    rating: 5,
    title: 'Exceeded every single expectation',
    comment: 'The fire and brilliance of this solitaire diamond is otherworldly. The packaging arrived sealed in a gorgeous lacquer box with all GIA papers. The customer concierge on WhatsApp also helped size my finger accurately.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-02-18T14:22:00Z'
  },
  {
    id: 'rev-002',
    productId: 'prod-002',
    productName: 'L’Aura Royal Emerald Cascade Necklace',
    customerName: 'Sophia Al-Mansoor',
    customerEmail: 'sophia.mansoor@example.com',
    rating: 5,
    title: 'A true heirloom masterpiece',
    comment: 'Wore this for our anniversary gala in Dubai and received compliments throughout the entire evening. The deep green hue of the Zambian emeralds is breathtaking.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-02-22T09:15:00Z'
  },
  {
    id: 'rev-003',
    productId: 'prod-004',
    productName: 'Elysian Eternity Tennis Bracelet',
    customerName: 'Camilla Dupont',
    customerEmail: 'camilla.d@example.com',
    rating: 5,
    title: 'Flawless clasp and unmatched sparkle',
    comment: 'I wear this every day. The security lock gives complete peace of mind, and the diamonds are noticeably whiter and clearer than standard retail jewelers.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-03-01T18:40:00Z'
  }
];
