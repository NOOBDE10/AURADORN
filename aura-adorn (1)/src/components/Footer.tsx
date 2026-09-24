import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Truck, 
  Sparkles, 
  Heart,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { NewsletterSubscription } from './NewsletterSubscription';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const { settings, openTracking, openAdmin, openAccount } = useStore();

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=Hello%20AURA%20ADORN`, '_blank');
  };

  return (
    <footer className="bg-[#14100E] text-[#D8CDC0] border-t border-[#C9A25D]/20 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter Subscription for Luxury Product Launches */}
        <NewsletterSubscription variant="footer" />

        {/* Brand & Pillars Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-white block">
              {settings.brandName.toUpperCase()}
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A25D] block -mt-2 font-sans font-medium">
              {settings.tagline}
            </span>
            <p className="text-xs font-sans leading-relaxed text-stone-400">
              Artisanal fine jewellery crafted with peerless devotion. Solid hallmarked 18K and 22K gold settings paired with certified natural diamonds and vibrant gemstones.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={handleWhatsApp}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#25D366] hover:text-white text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                title="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A25D] hover:text-[#14100E] text-stone-300 flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A25D] hover:text-[#14100E] text-stone-300 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">
              Fine Portfolios
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => onSelectCategory('rings')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Solitaire & Eternity Rings
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('necklaces')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Noble Pendants & Chokers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('earrings')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Diamond Studs & Drops
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bracelets')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Tennis & Charm Bracelets
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bangles')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Handcrafted Gold Bangles
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sets')} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Bridal & Ceremonial Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Patron Services */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">
              Patron Privileges
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => openTracking()} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Track Delivery & Status
                </button>
              </li>
              <li>
                <button onClick={openAccount} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  VIP Patron Lounge
                </button>
              </li>
              <li>
                <button onClick={handleWhatsApp} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                  Bespoke Ring Sizing Guide
                </button>
              </li>
              <li>
                <button onClick={openAccount} className="hover:text-[#C9A25D] transition-colors cursor-pointer text-stone-400">
                  Staff & Owner Access
                </button>
              </li>
              <li className="text-stone-400 pt-1">
                COD Available Nationwide
              </li>
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">
              Flagship Atelier
            </h4>
            <div className="space-y-2.5 text-xs font-sans text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A25D] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A25D] shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9A25D] shrink-0" />
                <span>{settings.email}</span>
              </p>
              <p className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GIA / IGI Certified Authenticity</span>
              </p>
            </div>
          </div>
        </div>

        {/* Hallmark & Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-white/10 text-center text-xs font-sans">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-[#C9A25D]" />
            <span>100% Solid 18K/22K Gold • Certified Purity</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Truck className="w-5 h-5 text-[#C9A25D]" />
            <span>White-Glove Cash on Delivery Courier</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C9A25D]" />
            <span>Lifetime Polish & 30-Day Privilege Return</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-500">
          <p>© {new Date().getFullYear()} {settings.brandName} Haute Joaillerie. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Insured Courier</span>
            <span>•</span>
            <span>Tamper-Proof Seal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
