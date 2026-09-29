import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircle2, 
  Package, 
  MessageCircle, 
  Truck, 
  ArrowRight, 
  Sparkles,
  Printer
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings, openTracking } = useStore();

  if (!order) return null;

  const handleWhatsAppConfirm = () => {
    const text = encodeURIComponent(
      `Hello ${settings.brandName}, I have placed Order #${order.id} for Cash on Delivery ($${order.totalAmount.toLocaleString()}). Please confirm dispatch to ${order.city}.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleTrack = () => {
    onClose();
    openTracking(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top Gold Icon */}
        {/* Brand Medallion Logo */}
        <div className="w-20 h-20 bg-[#0E0D0B] rounded-full flex items-center justify-center mx-auto border-2 border-[#C9A25D] p-1 shadow-[0_0_25px_rgba(201,162,93,0.4)]">
          <img 
            src="/logo.png" 
            alt="AA JEWELLERS" 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.3em] text-[#E5C378] font-semibold font-sans">
            Commission Registered Successfully
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#FAF7F2]">
            Thank You for Choosing AA JEWELLERS
          </h2>
          <p className="text-xs font-sans text-[#A89F91]">
            Our master jeweller has received your commission. Your order is safely secured in our vault.
          </p>
        </div>

        {/* Order ID Banner */}
        <div className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider block">
              Unique Order Reference
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#E5C378]">
              {order.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider block">
              Cash Due at Door
            </span>
            <span className="font-serif text-lg font-bold text-emerald-400">
              ${order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Items Summary preview */}
        <div className="bg-[#14120F] rounded-2xl border border-[#26211B] p-4 text-left space-y-3">
          <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#E5C378] border-b border-[#241F1A] pb-2">
            Reserved Haute Joaillerie ({order.items.length})
          </h4>
          <div className="divide-y divide-[#241F1A] max-h-40 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded border border-[#26211B] bg-[#181613]" />
                  <div>
                    <p className="font-serif font-medium text-[#FAF7F2] line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-[#A89F91]">Qty: {item.quantity} • {item.metal || '18K Gold'}</p>
                  </div>
                </div>
                <span className="font-medium text-[#E5C378]">${item.total.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#241F1A] text-xs font-sans text-[#A89F91] space-y-1">
            <p><span className="font-semibold text-[#FAF7F2]">Deliver To:</span> {order.customerName}, {order.address}, {order.city} ({order.phone})</p>
            <p className="text-emerald-400 font-medium">✓ Admin notification dispatched to auraadornjewellers@gmail.com</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleWhatsAppConfirm}
            className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirm on WhatsApp</span>
          </button>

          <button
            onClick={handleTrack}
            className="py-3 px-4 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Truck className="w-4 h-4 text-[#0B0A08]" />
            <span>Track Delivery</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-sans text-stone-400 hover:text-[#FAF7F2] font-medium cursor-pointer"
        >
          Return to Boutique Home
        </button>
      </div>
    </div>
  );
};
