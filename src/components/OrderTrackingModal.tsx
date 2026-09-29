import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
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
  const { isTrackingOpen, closeTracking, trackingOrderId, trackingPhone, fetchOrder, settings } = useStore();

  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const runSearch = async (orderId: string, phoneNumber: string) => {
    setErrorMsg('');
    if (!orderId.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please enter your order number and phone number.');
      return;
    }
    setIsSearching(true);
    try {
      setSearchedOrder(await fetchOrder(orderId.trim(), phoneNumber.trim()));
      setHasSearched(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not look up the order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset (and auto-search when opened from the order confirmation) each time the modal opens.
  useEffect(() => {
    if (!isTrackingOpen) return;
    setQuery(trackingOrderId || '');
    setPhone(trackingPhone || '');
    setSearchedOrder(null);
    setHasSearched(false);
    setErrorMsg('');
    if (trackingOrderId && trackingPhone) runSearch(trackingOrderId, trackingPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrackingOpen, trackingOrderId, trackingPhone]);

  if (!isTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query, phone);
  };

  const steps = [
    { title: 'Order Received', desc: 'We have received your order', status: 'pending' },
    { title: 'Confirmed', desc: 'We have confirmed your order by phone / WhatsApp', status: 'confirmed' },
    { title: 'Packed', desc: 'Your jewellery is packed and ready', status: 'processing' },
    { title: 'Handed to Courier', desc: 'Your parcel is on its way', status: 'shipped' },
    { title: 'Delivered', desc: 'Delivered and cash collected', status: 'delivered' }
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
            <h2 className="font-serif text-xl font-medium text-[#FAF7F2]">Track Your Order</h2>
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
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Order number, e.g. AA-260929-XXXXX"
                  aria-label="Order number"
                  className="w-full bg-[#14120F] border border-[#26211B] rounded-xl py-3 pl-10 pr-4 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone used at checkout"
                aria-label="Phone number"
                className="w-full bg-[#14120F] border border-[#26211B] rounded-xl py-3 px-4 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full px-5 py-3 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isSearching ? 'Searching...' : 'Track Order'}
            </button>
            {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
          </form>

          {/* Result Area */}
          {hasSearched && !searchedOrder && !isSearching && (
            <div className="p-8 text-center bg-[#14120F] rounded-2xl border border-[#26211B] space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-serif text-lg text-[#FAF7F2]">No order found</h3>
              <p className="text-xs font-sans text-[#A89F91] max-w-sm mx-auto">
                Please check the order number and use the same phone number you entered at checkout. Need help? Message us on WhatsApp: {settings.phone}
              </p>
            </div>
          )}

          {searchedOrder && (
            <div className="space-y-6 animate-in fade-in">
              {/* Order Meta Header */}
              <div className="p-4 bg-[#14120F] rounded-2xl border border-[#26211B] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order Number</span>
                  <p className="font-mono text-base font-bold text-[#E5C378]">{searchedOrder.id}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Recipient</span>
                  <p className="font-sans text-xs font-medium text-stone-300">{searchedOrder.customerName} ({searchedOrder.city})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Status</span>
                  <p className="font-sans text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 inline-block">
                    {searchedOrder.status}
                  </p>
                </div>
              </div>

              {searchedOrder.status === 'cancelled' && (
                <p className="text-xs text-rose-400">This order was cancelled. Contact us on WhatsApp if you have questions.</p>
              )}
              {(searchedOrder.courierName || searchedOrder.trackingNumber) && (
                <p className="text-xs font-sans text-[#C5BDB2]">
                  Courier: <span className="text-[#FAF7F2] font-medium">{searchedOrder.courierName || '—'}</span>
                  {searchedOrder.trackingNumber && <> · Tracking no: <span className="font-mono text-[#E5C378]">{searchedOrder.trackingNumber}</span></>}
                </p>
              )}

              {/* Visual Timeline */}
              <div className="bg-[#14120F] rounded-2xl border border-[#26211B] p-6 space-y-6">
                <h4 className="font-serif text-base font-medium text-[#FAF7F2] border-b border-[#241F1A] pb-3">
                  Order Progress
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#26211B]">
                  {steps.map((step, idx) => {
                    const currentStatus = searchedOrder.status;
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
                  Items ({searchedOrder.items.length})
                </span>
                <div className="divide-y divide-[#241F1A]">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded border border-[#26211B] bg-[#181613]" />
                        <div>
                          <p className="font-serif font-medium text-[#FAF7F2]">{item.productName}</p>
                          <p className="text-[10px] text-[#A89F91]">Qty: {item.quantity}{item.size ? ` • ${item.size}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[#E5C378]">{formatPrice(item.total)}</span>
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
