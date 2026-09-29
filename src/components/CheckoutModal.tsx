import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  Lock, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';

interface CheckoutModalProps {
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderSuccess }) => {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    cart, 
    cartSummary, 
    handlePlaceOrder, 
    user, 
    settings,
    appliedCoupon
  } = useStore();

  const [formData, setFormData] = useState({
    customerName: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: 'Lahore',
    area: '',
    postalCode: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter your full recipient name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMsg('Please enter a valid reachable phone number for delivery verification.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please enter your complete physical delivery address.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please specify your city.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        ...(user?.uid ? { customerId: user.uid } : {}),
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'guest.patron@aajewelers.com',
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim() || 'Central District',
        postalCode: formData.postalCode.trim() || '54000',
        notes: formData.notes.trim() || 'Standard white-glove packaging requested',
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          metal: item.selectedMetal || item.product.details?.metal || '18K Solid Gold',
          size: item.selectedSize || 'Standard'
        })),
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        deliveryCharge: cartSummary.delivery,
        totalAmount: cartSummary.total,
        paymentMethod: 'Cash on Delivery' as const
      };

      const completedOrder = await handlePlaceOrder(orderPayload);
      closeCheckout();
      onOrderSuccess(completedOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Unable to place order at this moment. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-4xl my-auto rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#241F1A] bg-[#0A0908] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0E0D0B] shrink-0 p-0.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="AA JEWELLERS" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#FAF7F2] leading-tight">
                AA JEWELLERS • Cash on Delivery
              </h2>
              <span className="text-[10px] text-[#A89F91] font-sans block">Encrypted Armoured Courier Dispatch</span>
            </div>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form data-lenis-prevent onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Address Information (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Method Badge */}
              <div className="p-4 bg-[#14120F] rounded-2xl border border-[#C9A25D]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A25D]/20 border border-[#C9A25D]/30 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-[#E5C378]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#FAF7F2]">
                    Payment Mode: Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs font-sans text-[#E5C378]">
                    No advance card charges. Inspect your authentic velvet jewelry box and pay the courier directly.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#E5C378] font-semibold border-b border-[#26211B] pb-1.5 font-sans">
                  1. Recipient Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance-Sterling"
                    required
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Phone Number (For Courier Verification) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +92 300 1234567"
                      required
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Email Address (For Invoice & Tracking)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. eleanor@example.com"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#E5C378] font-semibold border-b border-[#26211B] pb-1.5 font-sans">
                  2. Insured Delivery Destination
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Complete Street Address / House / Villa / Apartment *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. House 42, Street 18, Block F"
                    required
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Lahore / Karachi"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Area / Town
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g. Gulberg / DHA"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 54000"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Special Delivery Instructions / Gate Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Ring doorbell twice, deliver between 2 PM - 6 PM, gift packaging requested"
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Place Order CTA (5 cols) */}
            <div className="lg:col-span-5 bg-[#14120F] p-6 rounded-3xl border border-[#26211B] shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#FAF7F2] pb-3 border-b border-[#241F1A]">
                  Order Summary ({cart.length} creations)
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-[#241F1A] max-h-56 overflow-y-auto py-2">
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.selectedMetal}`} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-[#26211B] bg-[#181613] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-medium text-[#FAF7F2] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#A89F91] font-sans">
                          Qty: {item.quantity} • {item.selectedMetal || item.product.details.metal}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-[#E5C378] shrink-0">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Financial breakdown */}
                <div className="pt-4 border-t border-[#241F1A] space-y-2 text-xs font-sans text-[#A89F91]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#FAF7F2] font-medium">${cartSummary.subtotal.toLocaleString()}</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Privilege Code ({appliedCoupon?.code})</span>
                      <span>-${cartSummary.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>White-Glove Insured Delivery</span>
                    <span className="text-[#FAF7F2] font-medium">
                      {cartSummary.delivery === 0 ? (
                        <span className="text-emerald-400 font-semibold">Complimentary</span>
                      ) : (
                        `$${cartSummary.delivery}`
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#26211B] flex justify-between text-lg font-serif font-semibold text-[#E5C378]">
                    <span>Total Cash to Pay</span>
                    <span>${cartSummary.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-2xl shadow-[0_4px_25px_rgba(201,162,93,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 text-[#0B0A08]">
                      <Sparkles className="w-4 h-4 animate-spin text-[#0B0A08]" />
                      Logging Vault Order...
                    </span>
                  ) : (
                    <>
                      <span>Place Cash on Delivery Order</span>
                      <ArrowRight className="w-4 h-4 text-[#0B0A08]" />
                    </>
                  )}
                </button>

                <div className="space-y-1 text-[11px] font-sans text-stone-500 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[#A89F91]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E5C378]" />
                    Insured shipment with tamper-evident vault seal
                  </p>
                  <p>Store owner automatically notified: auraadornjewellers@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
