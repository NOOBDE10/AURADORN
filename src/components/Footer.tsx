import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { POLICY_PAGES, policyTitle } from './policyLinks';
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
  const { settings, categories, openTracking, openAdmin } = useStore();

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=Hello%20AA%20JEWELERS`, '_blank');
  };

  return (
    <footer className="bg-[#080706] text-[#A89F91] border-t border-[#26211B] pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter Subscription for Luxury Product Launches */}
        <NewsletterSubscription variant="footer" />

        {/* Brand & Pillars Top Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#241F1A]">
          <div className="space-y-4 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0E0D0B] p-0.5 shadow-[0_0_15px_rgba(201,162,93,0.3)] shrink-0">
                <img loading="lazy" decoding="async" 
                  src="/logo-256.jpg" 
                  alt="Aura Adorn logo" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold tracking-wider text-[#FAF7F2] block leading-tight">
                  {settings.brandName}
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#E5C378] block font-sans font-medium">
                  Timeless Beauty • Refined Elegance
                </span>
              </div>
            </div>
            <p className="text-xs font-sans leading-relaxed text-[#A89F91]">
              Elegant artificial jewellery for weddings, parties and everyday wear. Beautiful designs, honest prices, Cash on Delivery all over Pakistan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={handleWhatsApp}
                className="w-8 h-8 rounded-full bg-[#181613] border border-[#2E2822] hover:bg-[#25D366] hover:text-white text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <a
                href={settings.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-[#181613] border border-[#2E2822] hover:bg-[#E5C378] hover:text-[#0B0A08] text-stone-300 flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-[#181613] border border-[#2E2822] hover:bg-[#E5C378] hover:text-[#0B0A08] text-stone-300 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#FAF7F2]">
              Categories
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              {categories.map(c => (
                <li key={c.id}>
                  <button onClick={() => onSelectCategory(c.slug)} className="hover:text-[#E5C378] transition-colors cursor-pointer">
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#FAF7F2]">
              Help
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => openTracking()} className="hover:text-[#E5C378] transition-colors cursor-pointer">
                  Track Delivery & Status
                </button>
              </li>
              <li>
                <button onClick={handleWhatsApp} className="hover:text-[#E5C378] transition-colors cursor-pointer">
                  Size Help on WhatsApp
                </button>
              </li>
              <li>
                <button onClick={openAdmin} className="hover:text-[#E5C378] transition-colors cursor-pointer text-stone-500 hover:text-[#FAF7F2]">
                  Staff Login
                </button>
              </li>
              <li className="text-stone-500 pt-1">
                COD Available Nationwide
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#FAF7F2]">
              Policies
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              {POLICY_PAGES.map(key => (
                <li key={key}>
                  <Link to={`/policies/${key}`} className="hover:text-[#E5C378] transition-colors">
                    {policyTitle(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#FAF7F2]">
              Contact
            </h4>
            <div className="space-y-2.5 text-xs font-sans text-[#A89F91]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E5C378] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E5C378] shrink-0" />
                <span>{settings.email}</span>
              </p>
              <p className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Artificial (imitation) jewellery</span>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-[#241F1A] text-center text-xs font-sans text-[#C5BDB2]">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-[#E5C378]" />
            <span>Quality-checked before dispatch</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Truck className="w-5 h-5 text-[#E5C378]" />
            <span>Cash on Delivery all over Pakistan</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E5C378]" />
            <span>Easy exchange if damaged on arrival</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-500">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-[#A89F91]">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Delivery Rs {settings.deliveryCharge}</span>
            <span>•</span>
            <span>Tamper-Proof Seal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
