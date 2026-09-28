import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus } from '../types';
import { Search, CheckCircle2, Circle, Clock, Truck, Package, ArrowRight, ShieldCheck } from 'lucide-react';

export const TrackOrderView: React.FC = () => {
  const { orders, lastPlacedOrder, navigateTo } = useShop();

  const [searchQuery, setSearchQuery] = useState(lastPlacedOrder?.orderNumber || '');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(lastPlacedOrder || orders[0] || null);
  const [errorMessage, setErrorMessage] = useState('');

  const statusMilestones: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedOrder = searchQuery.trim().toUpperCase();
    const trimmedPhone = phoneQuery.trim().replace(/[^0-9]/g, '');

    const found = orders.find((o) => {
      const matchOrder = trimmedOrder ? o.orderNumber.toUpperCase() === trimmedOrder : false;
      const cleanOrderPhone = o.customerPhone.replace(/[^0-9]/g, '');
      const matchPhone = trimmedPhone ? cleanOrderPhone.includes(trimmedPhone) : false;

      if (trimmedOrder && trimmedPhone) return matchOrder && matchPhone;
      if (trimmedOrder) return matchOrder;
      if (trimmedPhone) return matchPhone;
      return false;
    });

    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorMessage(`No consignment found matching "${searchQuery || phoneQuery}". Please check your order details or contact concierge.`);
    }
  };

  const getStepState = (milestone: OrderStatus, currentStatus: OrderStatus) => {
    const currentIndex = statusMilestones.indexOf(currentStatus);
    const milestoneIndex = statusMilestones.indexOf(milestone);

    if (currentStatus === 'Cancelled') {
      return { isCompleted: false, isCurrent: false, isCancelled: true };
    }

    if (milestoneIndex < currentIndex) {
      return { isCompleted: true, isCurrent: false, isCancelled: false };
    } else if (milestoneIndex === currentIndex) {
      return { isCompleted: true, isCurrent: true, isCancelled: false };
    } else {
      return { isCompleted: false, isCurrent: false, isCancelled: false };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
          Haute Logistics Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
          LIVE CONSIGNMENT TRACKING
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
          Enter your official MS. Order Number or contact telephone to track status in real-time.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-[#0C0C0C] border border-[#C5A059]/40 rounded-xs p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-300 mb-1">
              Order ID (e.g. ORD-98745)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ORD-XXXXX"
              className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2 text-white font-mono uppercase rounded-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              placeholder="0300XXXXXXX"
              className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2 text-white rounded-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Locate Consignment</span>
        </button>
      </form>

      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 bg-red-950/30 border border-red-800 text-red-300 text-xs text-center rounded-xs">
          {errorMessage}
        </div>
      )}

      {/* Tracking Results Card */}
      {searchedOrder && (
        <div className="bg-[#0C0C0C] border border-[#C5A059]/40 rounded-xs p-6 md:p-8 space-y-8 shadow-2xl">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-800 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C5A059] block">
                Tracking Details For
              </span>
              <h3 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
                {searchedOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Client: {searchedOrder.customerName} • {searchedOrder.city}, Pakistan
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider">Current Status</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest rounded-xs shadow-md mt-1">
                <Truck className="w-3.5 h-3.5" />
                {searchedOrder.status}
              </span>
            </div>
          </div>

          {/* Interactive Visual Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              Consignment Milestones
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
              {statusMilestones.map((milestone, idx) => {
                const state = getStepState(milestone, searchedOrder.status);
                const matchingHistory = searchedOrder.trackingHistory.find(
                  (h) => h.status === milestone
                );

                return (
                  <div key={milestone} className="relative flex items-start gap-4">
                    {/* Milestone indicator dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        state.isCurrent
                          ? 'bg-[#D4AF37] border-white text-black ring-4 ring-[#D4AF37]/20 shadow-lg'
                          : state.isCompleted
                          ? 'bg-[#161616] border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-black border-stone-800 text-stone-700'
                      }`}
                    >
                      {state.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-2.5 h-2.5 fill-current" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`text-xs uppercase tracking-wider font-semibold ${
                            state.isCurrent
                              ? 'text-[#D4AF37] text-sm'
                              : state.isCompleted
                              ? 'text-white'
                              : 'text-stone-600'
                          }`}
                        >
                          {milestone}
                        </span>

                        {matchingHistory && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            {new Date(matchingHistory.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs mt-1 ${
                          state.isCompleted ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {matchingHistory
                          ? matchingHistory.note
                          : `Pending milestone completion.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Garments Summary */}
          <div className="border-t border-stone-800 pt-6 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-300">
              Consignment Items ({searchedOrder.items.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-stone-950 border border-stone-800 rounded-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-xs bg-stone-900 border border-stone-800 shrink-0"
                  />
                  <div className="text-xs">
                    <h5 className="font-semibold text-white uppercase tracking-wider line-clamp-1">
                      {item.product.name}
                    </h5>
                    <p className="text-stone-400 text-[11px]">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-[#D4AF37] font-mono mt-1">
                      Qty: {item.quantity} (PKR {(item.price * item.quantity).toLocaleString()})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
