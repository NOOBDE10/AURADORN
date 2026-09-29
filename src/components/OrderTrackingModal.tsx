import React, { useState } from 'react';
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

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingOpen, closeTracking, trackingOrderId, orders, fetchOrder } = useStore();

  const [query, setQuery] = useState(trackingOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    trackingOrderId ? orders.find(o => o.id === trackingOrderId) || null : null
  );
  const [hasSearched, setHasSearched] = useState(Boolean(trackingOrderId));
  const [isSearching, setIsSearching] = useState(false);

  if (!isTrackingOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    setIsSearching(true);
    const localFound = orders.find(o => 
      o.id.toUpperCase() === cleanQuery || 
      o.phone.includes(query.trim()) ||
      (o.email && o.email.toLowerCase() === query.trim().toLowerCase())
    );

    if (localFound) {
      setSearchedOrder(localFound);
      setHasSearched(true);
      setIsSearching(false);
      return;
    }

    // Attempt lookup by order identifier from boutique vault
    const remoteFound = await fetchOrder(cleanQuery);
    setSearchedOrder(remoteFound);
    setHasSearched(true);
    setIsSearching(false);
  };

  const steps = [
    { title: 'Order Commissioned', desc: 'Received into AA JEWELERS vault registry', status: 'pending' },
    { title: 'Boutique Confirmation', desc: 'Call verification & hallmark seal confirmed', status: 'confirmed' },
    { title: 'Vault Polish & Assembly', desc: 'Hand-buffed and packed into velvet case', status: 'processing' },
    { title: 'Insured White-Glove Dispatch', desc: 'Handed over to secure armoured courier', status: 'shipped' },
    { title: 'Delivered & Cash Received', desc: 'Inspected and signed by patron', status: 'delivered' }
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
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#241F1A] bg-[#0A0908] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#E5C378]" />
            <h2 className="font-serif text-xl font-medium text-[#FAF7F2]">Track Commission Status</h2>
          </div>
          <button
            onClick={closeTracking}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div data-lenis-prevent className="p-6 overflow-y-auto space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. AC-2026-...) or Phone number"
                className="w-full bg-[#14120F] border border-[#26211B] rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Track
            </button>
          </form>

          {/* Result Area */}
          {hasSearched && !searchedOrder && (
            <div className="p-8 text-center bg-[#14120F] rounded-2xl border border-[#26211B] space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-serif text-lg text-[#FAF7F2]">No Registry Match Found</h3>
              <p className="text-xs font-sans text-[#A89F91] max-w-sm mx-auto">
                Please verify your Order reference format (e.g. AC-2026-XXXX) or the registered phone number.
              </p>
            </div>
          )}

          {searchedOrder && (
            <div className="space-y-6 animate-in fade-in">
              {/* Order Meta Header */}
              <div className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order Reference</span>
                  <p className="font-mono text-base font-bold text-[#E5C378]">{searchedOrder.id}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Recipient</span>
                  <p className="font-sans text-xs font-medium text-stone-300">{searchedOrder.customerName} ({searchedOrder.city})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Status</span>
                  <p className="font-sans text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 inline-block">
                    {searchedOrder.status || searchedOrder.orderStatus}
                  </p>
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="bg-[#14120F] rounded-2xl border border-[#26211B] p-6 space-y-6">
                <h4 className="font-serif text-base font-medium text-[#FAF7F2] border-b border-[#241F1A] pb-3">
                  Vault Logistics Timeline
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#26211B]">
                  {steps.map((step, idx) => {
                    const currentStatus = searchedOrder.status || searchedOrder.orderStatus;
                    const state = getStepState(step.status, currentStatus);
                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'current'
                            ? 'bg-[#E5C378] text-[#0B0A08] ring-4 ring-[#E5C378]/30 animate-pulse'
                            : 'bg-[#26211B] text-stone-500'
                        }`}>
                          {state === 'completed' ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-serif text-sm font-medium ${
                            state === 'current' ? 'text-[#E5C378] font-semibold' : 'text-[#FAF7F2]'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs font-sans text-[#A89F91]">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this order */}
              <div className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-2">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#E5C378] block">
                  Ordered Jewels ({searchedOrder.items.length})
                </span>
                <div className="divide-y divide-[#241F1A]">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded border border-[#26211B] bg-[#181613]" />
                        <div>
                          <p className="font-serif font-medium text-[#FAF7F2]">{item.productName}</p>
                          <p className="text-[10px] text-[#A89F91]">Qty: {item.quantity} • {item.metal || '18K Gold'}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[#E5C378]">${item.total.toLocaleString()}</span>
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
