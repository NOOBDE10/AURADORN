import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Truck, Sparkles, MessageCircle, Mail, MapPin, Phone, HelpCircle } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { navigateTo, settings } = useShop();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
          The Haute Couture House
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-gold-gradient tracking-wide">
          ABOUT {settings.brandName || 'MS.'}
        </h1>
        <p className="text-sm md:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
          {settings.brandName || 'MS.'} is a modern luxury clothing brand created for individuals who believe personal style should feel effortless, confident, and timeless.
        </p>
      </div>

      <div className="relative aspect-video rounded-xs overflow-hidden border border-[#C5A059]/40 shadow-2xl">
        <img
          src="/src/assets/images/hero_model_black_gold_1790533620187.jpg"
          alt="MS. Atelier"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-sm uppercase tracking-widest text-[#D4AF37] font-semibold">
            Handcrafted with Gilded Wire & Pure Mulberry Silk
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-[#0E0E0E] border border-stone-800 rounded-xs space-y-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Bespoke Heritage</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Our atelier brings decades of classical subcontinental zardozi, tilla, and dabka wire craftsmanship to modern European runway silhouettes.
          </p>
        </div>

        <div className="p-6 bg-[#0E0E0E] border border-stone-800 rounded-xs space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Uncompromising Fabrics</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            We exclusively source 22 Momme silk charmeuse, Mongolian cashmere, Super 150s wool, and Japanese raw selvedge denim.
          </p>
        </div>

        <div className="p-6 bg-[#0E0E0E] border border-stone-800 rounded-xs space-y-2">
          <Truck className="w-6 h-6 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">White-Glove Delivery</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Every garment arrives in custom gold-stamped preservation boxes with complimentary nationwide Cash on Delivery above PKR 5,000.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <button
          onClick={() => navigateTo('shop')}
          className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-widest rounded-xs"
        >
          Explore Ready-to-Wear Catalog
        </button>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { settings } = useShop();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
          Client Services & Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white tracking-wide">
          CONNECT WITH MS.
        </h1>
        <p className="text-sm text-stone-400 max-w-md mx-auto">
          For bespoke tailoring consultations, wedding inquiries, and order concierge support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6 bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 md:p-8">
          <h2 className="text-base font-serif-luxury font-bold text-[#D4AF37] tracking-wider uppercase border-b border-stone-800 pb-3">
            Atelier Flagship Locations
          </h2>

          <div className="space-y-4 text-xs text-stone-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Lahore Atelier</strong>
                <span>Plot 22, MM Alam Road, Gulberg III, Lahore, Pakistan</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Telephone Concierge</strong>
                <span>{settings.whatsappNumber} (Monday - Saturday, 10 AM - 8 PM PKT)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">VIP Launch Roster Email</strong>
                <span className="text-[#D4AF37] font-semibold">{settings.notificationEmail}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">WhatsApp Direct Response</strong>
                <span>Instant client support: {settings.whatsappNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 md:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <span className="text-2xl">✨</span>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
                Inquiry Received
              </h3>
              <p className="text-xs text-stone-300">
                Our head concierge will contact you within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sofia Martinez"
                  className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sofia@email.com"
                  className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1">Inquiry Type</label>
                <select className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none">
                  <option>Bespoke Bridal / Groom Tailoring</option>
                  <option>Order Status Assistance</option>
                  <option>Private Launch Roster Allocation</option>
                  <option>Corporate Gifting</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-stone-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide measurement preferences, date of occasion, or specific questions..."
                  className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] px-3 py-2 text-white rounded-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold uppercase tracking-widest rounded-xs transition-colors"
              >
                Send Concierge Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQView: React.FC = () => {
  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'We offer hassle-free Cash on Delivery across all cities in Pakistan. Simply place your order without entering credit card details. When our courier partner arrives at your address, you pay the exact order amount in cash.',
    },
    {
      q: 'When do I qualify for Free Delivery?',
      a: 'All orders with a subtotal of PKR 5,000 or above automatically receive complimentary white-glove express delivery. Orders below PKR 5,000 carry a nominal PKR 250 standard delivery charge.',
    },
    {
      q: 'How can I track my order?',
      a: 'Once your order is confirmed, you receive an official Order Number (e.g. ORD-98745). You can use our real-time "Track Order" page at any time to monitor dispatch status from our atelier to your door.',
    },
    {
      q: 'What is your size exchange policy?',
      a: 'We provide a 7-day white-glove exchange policy. If the garment does not fit flawlessly, notify our concierge on WhatsApp, and we will dispatch a replacement size with courier doorstep exchange.',
    },
    {
      q: 'Are the gold embroideries real metallic threads?',
      a: 'Yes. Our haute couture collection utilizes genuine gold lurex, zardozi tilla wire, and bullion metallic embellishments crafted by master subcontinental artisans.',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
          Assistance & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
          FREQUENTLY ASKED QUESTIONS
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-[#0C0C0C] border border-stone-800 rounded-xs p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              {f.q}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light pl-6">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
