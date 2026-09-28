import React, { useState } from 'react';
import { useShop, AppView } from '../context/ShopContext';
import { Instagram, Linkedin, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, settings, isAdminLoggedIn, currentUser, setIsAuthModalOpen } = useShop();
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true); // Matches confirmed state from user screenshot

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-[#C5A059]/30 text-stone-300">
      {/* Privilege Roster Confirmed Section (Reference Image 4) */}
      <section aria-labelledby="privilege-roster-heading" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-b border-[#C5A059]/20 bg-gradient-to-b from-[#080808] to-[#050505]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 id="privilege-roster-heading" className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury text-gold-gradient font-normal tracking-wide">
            Privilege Roster Confirmed
          </h2>

          <div className="space-y-4">
            <p className="text-sm md:text-base text-stone-300 leading-relaxed font-light">
              Thank you for your allegiance. Priority allocations for upcoming haute-couture collections, bespoke private viewings, and limited edition drops will be dispatched to{' '}
              <span className="text-[#D4AF37] font-medium underline underline-offset-4 decoration-[#D4AF37]/50">
                auraadornjewellers@gmail.com
              </span>
              .
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-[#C5A059] font-medium tracking-widest uppercase pt-2">
              <span>First Access to Numbered Drops</span>
              <span className="text-stone-600 font-bold">•</span>
              <span>White-Glove Delivery Privilege</span>
            </div>

            {/* Optional toggle to subscribe another email */}
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Enter VIP email"
                  required
                  className="flex-1 bg-black border border-[#C5A059]/40 px-4 py-2 text-xs text-white rounded-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs"
                >
                  Join
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSubscribed(false)}
                className="text-xs text-stone-500 hover:text-[#D4AF37] underline transition-colors pt-2 block mx-auto"
              >
                Subscribe another email
              </button>
            )}
          </div>

          {/* Social Icons matching Reference Image 4 */}
          <div className="flex items-center justify-center gap-6 pt-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#C5A059] hover:text-white transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="text-[#C5A059] hover:text-white transition-colors"
            >
              {/* Pinterest SVG */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.49.03-3.56.13-.97.87-6.32.87-6.32s-.22-.44-.22-1.1c0-1.03.6-1.8 1.34-1.8.63 0 .94.47.94 1.04 0 .63-.4 1.58-.61 2.46-.17.74.37 1.34 1.1 1.34 1.32 0 2.34-1.39 2.34-3.4 0-1.78-1.28-3.02-3.11-3.02-2.27 0-3.6 1.7-3.6 3.45 0 .68.26 1.42.59 1.82.07.08.08.15.06.23-.06.27-.2.83-.23.94-.04.16-.13.19-.3.12-1.13-.53-1.84-2.18-1.84-3.5 0-2.85 2.07-5.47 5.98-5.47 3.14 0 5.58 2.24 5.58 5.23 0 3.12-1.97 5.63-4.7 5.63-.92 0-1.78-.48-2.07-1.04l-.56 2.15c-.21.79-.77 1.78-1.15 2.39A12 12 0 1 0 12 0z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#C5A059] hover:text-white transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          {/* Links matching Reference Image 4 */}
          <div className="grid grid-cols-3 max-w-lg mx-auto pt-6 text-xs text-stone-300 gap-y-3 font-normal">
            <button
              onClick={() => navigateTo('about')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Bespoke Services
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Collections
            </button>
            <button
              onClick={() => navigateTo('faq')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-[#D4AF37] transition-colors"
            >
              Store Locator
            </button>
          </div>
        </div>
      </section>

      {/* Main Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="text-base font-serif-luxury font-bold text-gold-gradient">
            {settings.brandName || 'MS.'}
          </span>
          <span>© 2026 {settings.brandName || 'MS.'} All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigateTo('track-order')} className="hover:text-stone-300 transition-colors">
            Track Order
          </button>
          <button onClick={() => navigateTo('size-guide')} className="hover:text-stone-300 transition-colors">
            Size Guide
          </button>
          <button
            onClick={() => {
              if (isAdminLoggedIn) {
                navigateTo('admin');
              } else if (currentUser) {
                navigateTo('account');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="text-[#C5A059] hover:underline"
          >
            Client Portal
          </button>
        </div>
      </div>
    </footer>
  );
};
