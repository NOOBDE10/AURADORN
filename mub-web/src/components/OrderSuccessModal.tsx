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
import { formatPKR, whatsappLink } from '../utils/format';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings, openTracking } = useStore();

  if (!order) return null;

  const whatsappConfirmUrl = whatsappLink(
    settings.whatsappNumber,
    `Assalam o Alaikum ${settings.brandName}, I have placed order ${order.id} (${formatPKR(order.totalAmount)}, Cash on Delivery). Please confirm delivery to ${order.city}.`
  );

  const handleTrack = () => {
    onClose();
    openTracking(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top Gold Icon */}
        <div className="w-16 h-16 bg-[#FAF6ED] rounded-full flex items-center justify-center mx-auto border border-[#C9A25D]/30 shadow-xs">
          <Sparkles className="w-8 h-8 text-[#C9A25D]" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C9A25D] font-semibold font-sans">
            Order Successfully Placed
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1815]">
            Thank you for your order!
          </h2>
          <p className="text-xs font-sans text-[#8C7662]">
            We will call you on {order.phone} to confirm your order before dispatch. Please save your order number to track it.
          </p>
        </div>

        {/* Order ID Banner */}
        <div className="p-4 bg-white rounded-2xl border border-[#EAE3D8] flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider block">
              Order Number
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#1C1815]">
              {order.id}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider block">
              Pay on Delivery
            </span>
            <span className="font-serif text-lg font-bold text-emerald-800">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Items Summary preview */}
        <div className="bg-white rounded-2xl border border-[#EAE3D8] p-4 text-left space-y-3">
          <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-stone-500 border-b border-[#F3EFEA] pb-2">
            Your Items ({order.items.length})
          </h4>
          <div className="divide-y divide-[#F3EFEA] max-h-40 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                  <div>
                    <p className="font-serif font-medium text-stone-900 line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-stone-500">Qty: {item.quantity}{item.metal ? ` • ${item.metal}` : ''}{item.size ? ` • ${item.size}` : ''}</p>
                  </div>
                </div>
                <span className="font-medium text-stone-800">{formatPKR(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#F3EFEA] text-xs font-sans text-stone-600 space-y-1">
            <p><span className="font-semibold text-stone-800">Deliver To:</span> {order.customerName}, {order.address}, {order.city} ({order.phone})</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {whatsappConfirmUrl && (
            <a
              href={whatsappConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
            </a>
          )}

          <button
            onClick={handleTrack}
            className="py-3 px-4 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Truck className="w-4 h-4 text-[#C9A25D]" />
            <span>Track Order</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-sans text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
