import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Award, ShieldCheck, Sparkles, Truck, MessageCircle } from 'lucide-react';

interface HeroSectionProps {
  onShopNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  const { settings } = useStore();

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${settings.brandName}, I am interested in viewing your haute joaillerie collection and would like to consult with a jewellery specialist.`
  )}`;

  return (
    <section className="relative overflow-hidden bg-[#181412] text-white">
      {/* Background Hero Image with refined gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroBanner.image}
          alt="AURA ADORN Luxury Jewellery Lifestyle"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center opacity-40 scale-100 hover:scale-105 transition-transform duration-10000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14100E] via-[#14100E]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40 flex flex-col justify-center min-h-[85vh]">
        <div className="max-w-2xl space-y-6">
          {/* Subtle luxury badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5]/10 border border-[#C9A25D]/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A25D]" />
            <span className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-[#E6D4AF]">
              {settings.heroBanner.tag}
            </span>
          </div>

          {/* Majestic Serif Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-[#FAF8F5]">
            {settings.heroBanner.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#D8CDC0] font-sans font-light leading-relaxed max-w-xl">
            {settings.heroBanner.subtitle}
          </p>

          {/* Action CTAs with micro-interactions */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onShopNow}
              className="px-8 py-4 bg-[#C9A25D] hover:bg-[#D8BD86] text-[#181412] font-sans font-semibold text-sm tracking-wider uppercase rounded-full shadow-lg shadow-[#C9A25D]/20 transition-all duration-300 flex items-center gap-3 cursor-pointer group active:scale-95"
            >
              <span>{settings.heroBanner.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-[#E6D4AF]/30 font-sans font-medium text-sm tracking-wider rounded-full backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>

          {/* Value Micro-Pillars */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs font-sans text-[#D8CDC0]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A25D] shrink-0" />
              <span>GIA / IGI Certified Diamonds</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A25D] shrink-0" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <Award className="w-4 h-4 text-[#C9A25D] shrink-0" />
              <span>100% Solid 18K/22K Gold</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
