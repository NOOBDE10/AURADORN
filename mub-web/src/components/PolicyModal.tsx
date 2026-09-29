import React from 'react';
import { FileText, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PolicyModal: React.FC = () => {
  const { isPolicyOpen, closePolicies, settings } = useStore();
  if (!isPolicyOpen) return null;

  const sections = [
    { title: 'Delivery', body: settings.shippingPolicy },
    { title: 'Returns & Exchanges', body: settings.returnPolicy },
    { title: 'Jewellery Care', body: settings.warrantyPolicy },
    { title: 'Privacy', body: settings.privacyPolicy },
  ].filter(s => s.body?.trim());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closePolicies}>
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">Shop Policies</h2>
          </div>
          <button onClick={closePolicies} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 text-sm font-sans text-[#4A3E38]">
          {sections.map(s => (
            <section key={s.title} className="space-y-1.5">
              <h3 className="font-serif text-lg text-[#1C1815]">{s.title}</h3>
              <p className="leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
          <section className="space-y-1.5">
            <h3 className="font-serif text-lg text-[#1C1815]">Payment</h3>
            <p className="leading-relaxed">
              All orders are Cash on Delivery. We confirm every order by phone before dispatch, and you pay the courier in cash when your parcel arrives.
            </p>
          </section>
          {(settings.phone || settings.email) && (
            <p className="text-xs text-stone-500 pt-4 border-t border-[#EAE3D8]">
              Questions? Contact {settings.brandName}
              {settings.phone && <> at <a className="underline" href={`tel:${settings.phone}`}>{settings.phone}</a></>}
              {settings.email && <> or <a className="underline" href={`mailto:${settings.email}`}>{settings.email}</a></>}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
