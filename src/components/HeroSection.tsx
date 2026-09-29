import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Award, ShieldCheck, Sparkles, Truck, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onShopNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  const { settings } = useStore();

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${settings.brandName}, I am interested in viewing your haute joaillerie collection and would like to consult with a jewellery specialist.`
  )}`;

  return (
    <section className="relative overflow-hidden bg-[#0B0A08] text-white">
      {/* Background Hero Image with refined gradient overlay & subtle slow pan */}
      <motion.div 
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        <img
          src={settings.heroBanner.image}
          alt="Aura Adorn artificial jewellery collection"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0A08] via-[#0B0A08]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-transparent to-black/50" />
      </motion.div>

      {/* Subtle ambient golden light glow */}
      <div 
        aria-hidden="true" 
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#C9A25D]/20 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 min-h-[85vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.14,
                  delayChildren: 0.1,
                }
              }
            }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Logo Medallion Tag */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#181613]/90 border border-[#C9A25D]/60 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E5C378] shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Aura Adorn logo" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-xs font-sans font-bold tracking-[0.22em] uppercase text-[#E5C378]">
                {settings.brandName} • {settings.heroBanner.tag}
              </span>
            </motion.div>

            {/* Majestic Serif Headline */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-[#FAF7F2]"
            >
              {settings.heroBanner.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-base sm:text-lg text-[#C5BDB2] font-sans font-light leading-relaxed max-w-xl"
            >
              {settings.heroBanner.subtitle}
            </motion.p>

            {/* Action CTAs with micro-interactions */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="pt-4 flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onShopNow}
                className="px-8 py-4 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans font-bold text-sm tracking-wider uppercase rounded-full shadow-[0_8px_25px_rgba(201,162,93,0.3)] transition-all duration-300 flex items-center gap-3 cursor-pointer group"
              >
                <span>{settings.heroBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 text-[#0B0A08]" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-[#14120F]/90 hover:bg-[#1C1915] text-[#FAF7F2] border border-[#C9A25D]/40 font-sans font-medium text-sm tracking-wider rounded-full backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-lg hover:border-[#C9A25D]"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp</span>
              </motion.a>
            </motion.div>

            {/* Value Micro-Pillars */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#26211B] text-xs font-sans text-[#A89F91]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>Delivery all over Pakistan</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Floating Luxury Brand Medallion */}
          <div className="hidden lg:flex lg:col-span-5 justify-center relative">
            <motion.div 
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative"
            >
              {/* Golden circular glow halo */}
              <div className="absolute inset-0 rounded-full bg-[#C9A25D]/25 blur-2xl transform scale-110 pointer-events-none" />

              {/* Medallion Card */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-tr from-[#C9A25D] via-[#E5C378] to-[#996515] shadow-[0_15px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(201,162,93,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0A08] p-1.5 flex items-center justify-center relative">
                  <img
                    src="/logo.png"
                    alt="Aura Adorn logo"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }}
                    className="w-full h-full object-cover rounded-full"
                  />
                  {/* Subtle shine glint */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Quality Seal Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#0E0D0B]/95 border border-[#C9A25D]/70 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#E5C378]" />
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] text-[#E5C378] uppercase">
                  Timeless Beauty • Refined Elegance
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
