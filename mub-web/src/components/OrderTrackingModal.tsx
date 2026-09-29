import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { formatPKR } from '../utils/format';

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingOpen, closeTracking, trackingOrderId, orders, myOrders, fetchOrder } = useStore();

  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const lookup = async (rawId: string) => {
    const id = rawId.trim().toUpperCase();
    if (!id) return;
    setIsSearching(true);
    const known = [...myOrders, ...orders].find(o => o.id.toUpperCase() === id);
    setSearchedOrder(known || (await fetchOrder(id)));
    setHasSearched(true);
    setIsSearching(false);
  };

  // Each time the modal opens (e.g. from "Track order"), start fresh and look up the given id.
  useEffect(() => {
    if (!isTrackingOpen) return;
    setQuery(trackingOrderId || '');
    setSearchedOrder(null);
    setHasSearched(false);
    if (trackingOrderId) lookup(trackingOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrackingOpen, trackingOrderId]);

  // Keep the shown order live if it is one we are already listening to.
  const liveOrder = searchedOrder
    ? [...myOrders, ...orders].find(o => o.id === searchedOrder.id) || searchedOrder
    : null;

  if (!isTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(query);
  };

  const steps = [
    { title: 'Order Placed', desc: 'We have received your order', status: 'pending' },
    { title: 'Confirmed', desc: 'Order confirmed on phone', status: 'confirmed' },
    { title: 'Packing', desc: 'Your jewellery is being checked and packed', status: 'processing' },
    { title: 'Dispatched', desc: 'Handed over to the courier', status: 'shipped' },
    { title: 'Delivered', desc: 'Delivered and paid in cash', status: 'delivered' }
  ];

  const getStepState = (stepKey: string, currentStatus: string) => {
    const sequence = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepKey);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">Track Your Order</h2>
          </div>
          <button
            onClick={closeTracking}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your order number, e.g. AA-7K3M9QX2"
                className="w-full bg-white border border-[#EAE3D8] rounded-xl py-3 pl-10 pr-4 text-xs font-sans focus:outline-none focus:border-[#C9A25D]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isSearching ? '…' : 'Track'}
            </button>
          </form>

          {/* Result Area */}
          {hasSearched && !isSearching && !liveOrder && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE3D8] space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-serif text-lg text-[#1C1815]">Order not found</h3>
              <p className="text-xs font-sans text-stone-500 max-w-sm mx-auto">
                Please check the order number from your confirmation screen or message. If you need help, contact us on WhatsApp.
              </p>
            </div>
          )}

          {liveOrder && (
            <div className="space-y-6 animate-in fade-in">
              {/* Order Meta Header */}
              <div className="p-4 bg-white rounded-2xl border border-[#EAE3D8] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order Number</span>
                  <p className="font-mono text-base font-bold text-[#1C1815]">{liveOrder.id}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Recipient</span>
                  <p className="font-sans text-xs font-medium text-stone-800">{liveOrder.customerName} ({liveOrder.city})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Status</span>
                  <p className="font-sans text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-block">
                    {liveOrder.status || liveOrder.orderStatus}
                  </p>
                </div>
              </div>

              {liveOrder.status === 'cancelled' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                  This order has been cancelled. If you think this is a mistake, please contact us on WhatsApp.
                </div>
              )}

              {/* Visual Timeline */}
              <div className="bg-white rounded-2xl border border-[#EAE3D8] p-6 space-y-6">
                <h4 className="font-serif text-base font-medium text-[#1C1815] border-b border-[#F3EFEA] pb-3">
                  Order Progress
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE3D8]">
                  {steps.map((step, idx) => {
                    const currentStatus = liveOrder.status;
                    const state = getStepState(step.status, currentStatus);
                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'current'
                            ? 'bg-[#C9A25D] text-white ring-4 ring-[#C9A25D]/20 animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}>
                          {state === 'completed' ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-serif text-sm font-medium ${
                            state === 'current' ? 'text-[#C9A25D] font-semibold' : 'text-[#1C1815]'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs font-sans text-stone-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this order */}
              <div className="p-4 bg-white rounded-2xl border border-[#EAE3D8] space-y-2">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-stone-500 block">
                  Items ({liveOrder.items.length})
                </span>
                <div className="divide-y divide-[#F3EFEA]">
                  {liveOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                        <div>
                          <p className="font-serif font-medium">{item.productName}</p>
                          <p className="text-[10px] text-stone-400">Qty: {item.quantity}{item.metal ? ` • ${item.metal}` : ''}{item.size ? ` • ${item.size}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatPKR(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
