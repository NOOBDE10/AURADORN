import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, X, Send, Sparkles, Phone, ShieldCheck, Clock } from 'lucide-react';

export const WhatsAppConcierge: React.FC = () => {
  const { settings, openTracking } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const quickInquiries = [
    'I would like to inquire about bespoke bridal solitaires.',
    'Can I receive guidance on ring sizing & GIA certification?',
    'I would like to request live video inspection of a design.',
    'I have a question regarding Cash on Delivery dispatch.'
  ];

  const handleSendCustom = (text: string) => {
    const encoded = encodeURIComponent(`Hello ${settings.brandName},\n\n${text}`);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#1C1815] text-[#FAF8F5] p-4 flex items-center justify-between border-b border-[#C9A25D]/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1C1815] rounded-full" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-white">Boutique Concierge</h4>
                <p className="text-[10px] font-sans text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C9A25D]" />
                  <span>Typically replies within 5 minutes</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#FAF8F5] space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-[#EAE3D8] text-xs font-sans text-stone-700 shadow-2xs">
              <p className="font-medium text-[#1C1815] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A25D]" />
                Welcome to Aura & Carat
              </p>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                Connect directly with our senior gemmologist for custom sizing, valuation reports, or Cash on Delivery assistance.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C7662] font-semibold block px-1">
                Instant Topics:
              </span>
              {quickInquiries.map((inquiry, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCustom(inquiry)}
                  className="w-full text-left p-2.5 bg-white hover:bg-[#FAF6ED] rounded-xl border border-[#EAE3D8] hover:border-[#C9A25D] text-xs font-sans text-[#1C1815] transition-all flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="truncate">{inquiry}</span>
                  <Send className="w-3 h-3 text-stone-400 group-hover:text-[#C9A25D] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="p-3 bg-white border-t border-[#EAE3D8] text-center">
            <button
              onClick={() => handleSendCustom('Hello, I would like to speak with a jewellery specialist.')}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start WhatsApp Conversation</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer"
        aria-label="Open WhatsApp Concierge"
      >
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-40 group-hover:opacity-75 animate-ping -z-10" />
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="font-sans text-xs font-semibold tracking-wider uppercase hidden sm:inline">
          WhatsApp Concierge
        </span>
      </button>
    </div>
  );
};
