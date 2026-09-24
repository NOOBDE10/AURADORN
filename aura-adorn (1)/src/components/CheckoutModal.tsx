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
        customerId: user?.uid,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'guest.patron@auracarat.com',
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim() || 'Central District',
        postalCode: formData.postalCode.trim() || '54000',
        notes: formData.notes.trim(),
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          metal: item.selectedMetal,
          size: item.selectedSize
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-4xl my-auto rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">
              Cash on Delivery Checkout
            </h2>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Address Information (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Method Badge */}
              <div className="p-4 bg-[#FAF6ED] rounded-2xl border border-[#C9A25D]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A25D]/20 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-[#9B732B]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1C1815]">
                    Payment Mode: Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs font-sans text-[#7D591F]">
                    No advance card charges. Inspect your authentic velvet jewelry box and pay the courier directly.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#8C7662] font-semibold border-b border-[#EAE3D8] pb-1.5 font-sans">
                  1. Recipient Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance-Sterling"
                    required
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Phone Number (For Courier Verification) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +92 300 1234567"
                      required
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email Address (For Invoice & Tracking)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. eleanor@example.com"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#8C7662] font-semibold border-b border-[#EAE3D8] pb-1.5 font-sans">
                  2. Insured Delivery Destination
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Complete Street Address / House / Villa / Apartment *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. House 42, Street 18, Block F"
                    required
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Lahore / Karachi"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Area / Town
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g. Gulberg / DHA"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 54000"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Special Delivery Instructions / Gate Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Ring doorbell twice, deliver between 2 PM - 6 PM, gift packaging requested"
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Place Order CTA (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#EAE3D8] shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1C1815] pb-3 border-b border-[#F3EFEA]">
                  Order Summary ({cart.length} creations)
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-[#F3EFEA] max-h-56 overflow-y-auto py-2">
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.selectedMetal}`} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-[#EAE3D8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-medium text-[#1C1815] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-stone-400 font-sans">
                          Qty: {item.quantity} • {item.selectedMetal || item.product.details.metal}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-[#1C1815] shrink-0">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Financial breakdown */}
                <div className="pt-4 border-t border-[#F3EFEA] space-y-2 text-xs font-sans text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1C1815] font-medium">${cartSummary.subtotal.toLocaleString()}</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Privilege Code ({appliedCoupon?.code})</span>
                      <span>-${cartSummary.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>White-Glove Insured Delivery</span>
                    <span className="text-[#1C1815] font-medium">
                      {cartSummary.delivery === 0 ? (
                        <span className="text-emerald-700 font-semibold">Complimentary</span>
                      ) : (
                        `$${cartSummary.delivery}`
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#EAE3D8] flex justify-between text-lg font-serif font-semibold text-[#1C1815]">
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
                  className="w-full py-4 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Logging Vault Order...
                    </span>
                  ) : (
                    <>
                      <span>Place Cash on Delivery Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="space-y-1 text-[11px] font-sans text-stone-400 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-stone-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A25D]" />
                    Insured shipment with tamper-evident vault seal
                  </p>
                  <p>Store owner automatically notified: nirbanmubashirzubair@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
