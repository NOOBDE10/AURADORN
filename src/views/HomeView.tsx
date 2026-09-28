import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, settings, navigateTo } = useShop();

  // Curated hero showcase items (Reference Image 1)
  const heroShowcase = products.slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNew || p.id === 'prod-001' || p.id === 'prod-002').slice(0, 4);

  return (
    <div className="w-full space-y-16 md:space-y-24 pb-16">
      {/* 1. CINEMATIC HERO SECTION (Matching Reference Image 1) */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-black">
        {/* Background Image with Cinematic Luxury Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_model_black_gold_1790533620187.jpg"
            alt="MS. Haute Couture Editorial"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top filter brightness-[0.78] contrast-[1.12]"
          />
          {/* Gradients to blend seamless dark luxury */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.7)_100%)]" />
        </div>

        {/* Hero Center Title & Call to Action (Reference Image 1) */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24 md:pt-36 flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.4em] text-[#C5A059] font-medium mb-3">
            Haute Couture • Autumn / Winter Collection
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif-luxury font-bold tracking-tight text-gold-gradient drop-shadow-2xl">
            {settings.heroHeadline || 'STYLE THAT SPEAKS.'}
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-stone-200 font-light max-w-2xl tracking-wide leading-relaxed drop-shadow-md">
            {settings.heroSubtext || 'Discover refined fashion designed for your everyday moments.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('shop')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xs shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105"
            >
              DISCOVER NOW
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="px-8 py-3.5 bg-black/60 hover:bg-black text-[#D4AF37] border border-[#C5A059]/60 hover:border-[#D4AF37] font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xs backdrop-blur-md transition-all"
            >
              EXPLORE SHOP
            </button>
          </div>
        </div>

        {/* Hero Bottom Deal Cards (Reference Image 1) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-12 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {heroShowcase.map((product) => (
              <div
                key={product.id}
                onClick={() => navigateTo('product-detail', product.id)}
                className="group bg-[#0A0A0A]/85 backdrop-blur-md border border-[#C5A059]/40 hover:border-[#D4AF37] p-3 rounded-xs flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xs mb-2.5 bg-stone-900">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-[11px] sm:text-xs font-semibold text-white uppercase tracking-wider line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs font-mono font-medium text-[#D4AF37] tabular-nums">
                    PKR {product.price.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('product-detail', product.id);
                  }}
                  className="mt-2.5 w-full py-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-black bg-[#D4AF37] hover:bg-[#F3E5AB] rounded-xs transition-colors"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES (WOMEN / MEN / COUTURE / SALE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
            Curated Lines
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
            EXPLORE THE HOUSES OF MS.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Women's Haute Couture */}
          <div
            onClick={() => navigateTo('shop')}
            className="group relative h-96 rounded-xs overflow-hidden border border-[#C5A059]/30 hover:border-[#D4AF37] cursor-pointer transition-all duration-300"
          >
            <img
              src="/src/assets/images/fashion_gold_blazer_1790533633560.jpg"
              alt="Women Haute Couture"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Atelier
                </span>
                <h3 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                  WOMEN'S COUTURE
                </h3>
              </div>
              <span className="p-2 rounded-full bg-[#D4AF37] text-black group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Men's Bespoke Tuxedos & Tailoring */}
          <div
            onClick={() => navigateTo('shop')}
            className="group relative h-96 rounded-xs overflow-hidden border border-[#C5A059]/30 hover:border-[#D4AF37] cursor-pointer transition-all duration-300"
          >
            <img
              src="/src/assets/images/fashion_mens_gold_tuxedo_1790533657236.jpg"
              alt="Men Bespoke"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Sartorial
                </span>
                <h3 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                  MEN'S BESPOKE
                </h3>
              </div>
              <span className="p-2 rounded-full bg-[#D4AF37] text-black group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Evening & Silk Dresses */}
          <div
            onClick={() => navigateTo('shop')}
            className="group relative h-96 rounded-xs overflow-hidden border border-[#C5A059]/30 hover:border-[#D4AF37] cursor-pointer transition-all duration-300"
          >
            <img
              src="/src/assets/images/fashion_black_silk_dress_1790533646472.jpg"
              alt="Evening Dresses"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Eveningwear
                </span>
                <h3 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                  SILK & EVENING DRESSES
                </h3>
              </div>
              <span className="p-2 rounded-full bg-[#D4AF37] text-black group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS GRID (Every card has MS. logo at top center) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-[#C5A059]/20">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
              Most Coveted
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-wide">
              SIGNATURE BEST SELLERS
            </h2>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs uppercase tracking-widest font-semibold text-[#D4AF37] hover:text-white flex items-center gap-1.5 group"
          >
            <span>VIEW ALL 52 PIECES</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. LUXURY CAMPAIGN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xs overflow-hidden border border-[#C5A059]/50 bg-gradient-to-r from-stone-950 via-[#121212] to-stone-950 p-8 md:p-14 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Exclusive Bespoke Ordering
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide leading-tight">
              PRECISION TAILORING. UNCOMPROMISED NOBILITY.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Every MS. garment is hand-inspected in our Lahore & Islamabad design ateliers before being sealed in gold-stamped preservation packaging. Enjoy complimentary Cash on Delivery nationwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigateTo('shop')}
              className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-widest rounded-xs shadow-lg transition-all"
            >
              Shop Collection
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="px-8 py-3.5 bg-black border border-[#C5A059]/60 hover:border-[#D4AF37] text-white font-semibold text-xs uppercase tracking-widest rounded-xs transition-colors"
            >
              Request Consultation
            </button>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
            Just Released
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-wide">
            NEW HAUTE ARRIVALS
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. TRUST INDICATORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 bg-[#0C0C0C] border border-[#C5A059]/25 rounded-xs text-center">
          <div className="space-y-2">
            <Truck className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Cash on Delivery</h4>
            <p className="text-[11px] text-stone-400">Pay safely upon unboxing across Pakistan</p>
          </div>

          <div className="space-y-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Complimentary Delivery</h4>
            <p className="text-[11px] text-stone-400">On all orders above PKR {settings.freeShippingThreshold.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Pure Craftsmanship</h4>
            <p className="text-[11px] text-stone-400">100% genuine silk, cashmere, and wool fabrics</p>
          </div>

          <div className="space-y-2">
            <RefreshCw className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Easy Exchange Policy</h4>
            <p className="text-[11px] text-stone-400">7-day hassle-free size exchange guarantee</p>
          </div>
        </div>
      </section>
    </div>
  );
};
