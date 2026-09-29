import React from 'react';
import { useStore } from '../context/StoreContext';
import { Award, Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone, ShieldCheck, Truck } from 'lucide-react';
import { NewsletterSubscription } from './NewsletterSubscription';
import { whatsappLink } from '../utils/format';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
}

const socialCls =
  'w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A25D] hover:text-[#14100E] text-stone-300 flex items-center justify-center transition-colors';

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const { settings, categories, openTracking, openAdmin, openAccount, openPolicies } = useStore();
  const chatUrl = whatsappLink(settings.whatsappNumber, `Assalam o Alaikum ${settings.brandName}`);
  const sizeHelpUrl = whatsappLink(settings.whatsappNumber, `Assalam o Alaikum ${settings.brandName}, I need help choosing the right size.`);

  const socials = [
    { url: settings.instagramUrl, label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { url: settings.facebookUrl, label: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { url: settings.tiktokUrl, label: 'TikTok', icon: <Music2 className="w-4 h-4" /> },
  ].filter(s => /^https?:\/\//.test(s.url || ''));

  return (
    <footer className="bg-[#14100E] text-[#D8CDC0] border-t border-[#C9A25D]/20 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <NewsletterSubscription variant="footer" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="space-y-4">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-white block">
              {settings.brandName.toUpperCase()}
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9A25D] block -mt-2 font-sans font-medium">
              {settings.tagline}
            </span>
            {settings.aboutText && <p className="text-xs font-sans leading-relaxed text-stone-400">{settings.aboutText}</p>}
            <div className="flex items-center gap-3 pt-2">
              {chatUrl && (
                <a href={chatUrl} target="_blank" rel="noopener noreferrer" className={`${socialCls} hover:bg-[#25D366]! hover:text-white!`} title="WhatsApp">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {socials.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={socialCls} title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">Shop</h4>
              <ul className="space-y-2 text-xs font-sans">
                {categories.map(c => (
                  <li key={c.id}>
                    <button onClick={() => onSelectCategory(c.slug)} className="hover:text-[#C9A25D] transition-colors cursor-pointer">
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">Help</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => openTracking()} className="hover:text-[#C9A25D] transition-colors cursor-pointer">Track your order</button>
              </li>
              <li>
                <button onClick={openAccount} className="hover:text-[#C9A25D] transition-colors cursor-pointer">My account</button>
              </li>
              {sizeHelpUrl && (
                <li>
                  <a href={sizeHelpUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A25D] transition-colors">Size help on WhatsApp</a>
                </li>
              )}
              <li>
                <button onClick={openPolicies} className="hover:text-[#C9A25D] transition-colors cursor-pointer">Delivery, returns & privacy</button>
              </li>
            </ul>
          </div>

          {(settings.address || settings.phone || settings.email) && (
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-white">Contact</h4>
              <div className="space-y-2.5 text-xs font-sans text-stone-400">
                {settings.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#C9A25D] shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </p>
                )}
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white">
                    <Phone className="w-4 h-4 text-[#C9A25D] shrink-0" />
                    <span>{settings.phone}</span>
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white">
                    <Mail className="w-4 h-4 text-[#C9A25D] shrink-0" />
                    <span>{settings.email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {settings.highlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2 border-b border-white/10 pb-8 text-center text-xs font-sans">
            {settings.highlights.map((text, i) => {
              const Icon = [Truck, ShieldCheck, Award][i % 3];
              return (
                <div key={text} className="flex items-center justify-center gap-2">
                  <Icon className="w-5 h-5 text-[#C9A25D]" />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-500">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={openPolicies} className="hover:text-stone-300 cursor-pointer">Policies</button>
            <span>•</span>
            <span>Cash on Delivery</span>
            <span>•</span>
            <button onClick={openAdmin} className="hover:text-stone-300 cursor-pointer">Staff login</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
