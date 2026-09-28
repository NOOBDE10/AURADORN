import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle, Truck, Package, MessageCircle, ArrowRight, Printer } from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { lastPlacedOrder, navigateTo, settings } = useShop();

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-stone-300">No recent order found.</p>
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleConciergeWhatsApp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello MS.! I just placed order #${lastPlacedOrder.orderNumber} for PKR ${lastPlacedOrder.total.toLocaleString()}. Please confirm dispatch.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Top Success Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37] mb-2 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-gold-gradient tracking-wide">
          ORDER CONFIRMED
        </h1>
        <p className="text-sm text-stone-300 max-w-md mx-auto">
          Thank you for choosing <strong className="text-white">MS. Haute Couture</strong>,{' '}
          <span className="text-[#D4AF37]">{lastPlacedOrder.customerName}</span>. Your garments have been allocated in our private launch roster.
        </p>
      </div>

      {/* Order Highlights Box */}
      <div className="bg-[#0C0C0C] border border-[#C5A059]/40 rounded-xs p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#C5A059] block">
              Official Consignment ID
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {lastPlacedOrder.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-900 border border-stone-700 hover:border-[#D4AF37] text-stone-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 rounded-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={() => navigateTo('track-order')}
              className="px-4 py-1.5 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#F3E5AB] transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Status</span>
            </button>
          </div>
        </div>

        {/* Customer & Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-300 border-b border-stone-800 pb-6">
          <div>
            <h4 className="font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">Recipient</h4>
            <p className="text-white font-medium">{lastPlacedOrder.customerName}</p>
            <p>{lastPlacedOrder.customerPhone}</p>
            <p>{lastPlacedOrder.customerEmail}</p>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">Destination</h4>
            <p className="text-white">{lastPlacedOrder.address}</p>
            <p>{lastPlacedOrder.area}, {lastPlacedOrder.city}</p>
            <p>Pakistan {lastPlacedOrder.postalCode ? `(${lastPlacedOrder.postalCode})` : ''}</p>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">Payment</h4>
            <p className="text-white font-medium">{lastPlacedOrder.paymentMethod}</p>
            <p className="text-emerald-400">Payment on Unboxing</p>
            <p className="text-stone-500 mt-1">Status: Initial Verification</p>
          </div>
        </div>

        {/* Garments Table */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
            Allocated Garments ({lastPlacedOrder.items.length})
          </h4>
          <div className="divide-y divide-stone-800">
            {lastPlacedOrder.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover object-center rounded-xs bg-stone-900 border border-stone-800 shrink-0"
                  />
                  <div>
                    <h5 className="font-semibold text-white uppercase tracking-wider">
                      {item.product.name}
                    </h5>
                    <p className="text-stone-400 text-[11px]">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono font-semibold text-[#D4AF37] tabular-nums">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-stone-800 pt-4 space-y-2 text-xs text-stone-300 font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-white tabular-nums">PKR {lastPlacedOrder.subtotal.toLocaleString()}</span>
          </div>

          {lastPlacedOrder.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Promotional Privilege Discount</span>
              <span className="font-mono tabular-nums">-PKR {lastPlacedOrder.discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-mono tabular-nums">
              {lastPlacedOrder.deliveryFee === 0 ? (
                <span className="text-[#D4AF37] font-semibold">FREE (White-Glove Privilege)</span>
              ) : (
                `PKR ${lastPlacedOrder.deliveryFee.toLocaleString()}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-3 border-t border-[#C5A059]/30">
            <span className="uppercase tracking-wider">Total Cash on Delivery</span>
            <span className="font-mono text-[#D4AF37] tabular-nums text-lg">
              PKR {lastPlacedOrder.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Post-order Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => navigateTo('track-order')}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-widest rounded-xs shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Real-Time Consignment Tracker</span>
        </button>

        <button
          onClick={handleConciergeWhatsApp}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-950/60 border border-emerald-600/50 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Notify Concierge on WhatsApp</span>
        </button>

        <button
          onClick={() => navigateTo('shop')}
          className="w-full sm:w-auto px-6 py-3.5 bg-black border border-stone-800 hover:border-stone-600 text-stone-300 font-semibold text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
