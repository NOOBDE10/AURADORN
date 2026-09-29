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
        <div className="mb-3 w-80 sm:w-96 bg-[#0E0D0B] text-[#FAF7F2] rounded-3xl border border-[#2E2822] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#0A0908] text-[#FAF7F2] p-4 flex items-center justify-between border-b border-[#241F1A]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0A0908] rounded-full" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-medium text-[#FAF7F2]">Boutique Concierge</h4>
                <p className="text-[10px] font-sans text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E5C378]" />
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
          <div className="p-4 bg-[#0E0D0B] space-y-3">
            <div className="bg-[#14120F] p-3 rounded-2xl border border-[#26211B] text-xs font-sans text-stone-300 shadow-2xs">
              <p className="font-medium text-[#FAF7F2] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                Welcome to AA JEWELERS
              </p>
              <p className="text-[#A89F91] text-[11px] leading-relaxed">
                Connect directly with our senior gemmologist for custom sizing, valuation reports, or Cash on Delivery assistance.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#E5C378] font-semibold block px-1">
                Instant Topics:
              </span>
              {quickInquiries.map((inquiry, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCustom(inquiry)}
                  className="w-full text-left p-2.5 bg-[#14120F] hover:bg-[#1C1814] rounded-xl border border-[#26211B] hover:border-[#C9A25D]/60 text-xs font-sans text-[#FAF7F2] transition-all flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="truncate">{inquiry}</span>
                  <Send className="w-3 h-3 text-stone-400 group-hover:text-[#E5C378] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="p-3 bg-[#0A0908] border-t border-[#241F1A] text-center">
            <button
              onClick={() => handleSendCustom('Hello, I would like to speak with a jewellery specialist.')}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Start WhatsApp Conversation</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button - Authentic WhatsApp Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="WhatsApp Concierge"
        title="Chat on WhatsApp"
      >
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-35 group-hover:opacity-75 animate-ping -z-10" />
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </button>
    </div>
  );
};
