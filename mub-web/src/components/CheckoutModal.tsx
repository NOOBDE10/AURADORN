import React, { useEffect, useState } from 'react';
import { cartLineKey, useStore } from '../context/StoreContext';
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
import { friendlyFirebaseError } from '../firebase/config';
import { formatPKR, isValidPakistaniMobile, PAKISTAN_CITIES } from '../utils/format';

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
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    postalCode: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill from the signed-in customer's account.
  useEffect(() => {
    if (isCheckoutOpen && user) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [isCheckoutOpen, user]);

  if (!isCheckoutOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!isValidPakistaniMobile(formData.phone)) {
      setErrorMsg('Please enter a valid mobile number, e.g. 0300 1234567. We call to confirm every order.');
      return;
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address, or leave it empty.');
      return;
    }
    if (formData.address.trim().length < 8) {
      setErrorMsg('Please enter your complete delivery address (house, street, block).');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const completedOrder = await handlePlaceOrder({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
      });
      setFormData(prev => ({ ...prev, notes: '' }));
      closeCheckout();
      onOrderSuccess(completedOrder);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMsg(friendlyFirebaseError(err));
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
                    No advance payment. We will call you to confirm, then you pay the courier in cash when your parcel arrives.
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Ayesha Khan"
                    autoComplete="name"
                    required
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0300 1234567"
                      autoComplete="tel"
                      required
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#8C7662] font-semibold border-b border-[#EAE3D8] pb-1.5 font-sans">
                  2. Delivery Address
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    House / Street / Block *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. House 42, Street 18, Block F"
                    autoComplete="street-address"
                    required
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <datalist id="pk-cities">
                  {PAKISTAN_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      list="pk-cities"
                      autoComplete="address-level2"
                      placeholder="e.g. Lahore"
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
                    Order Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Call before delivery, gift wrapping, nearest landmark"
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm text-[#1C1815] focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Place Order CTA (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#EAE3D8] shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1C1815] pb-3 border-b border-[#F3EFEA]">
                  Order Summary ({cartSummary.itemCount} items)
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-[#F3EFEA] max-h-56 overflow-y-auto py-2">
                  {cart.map(item => (
                    <div key={cartLineKey(item)} className="py-2.5 flex items-center gap-3">
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
                          Qty: {item.quantity}{[item.selectedMetal, item.selectedSize].filter(Boolean).map(v => ` • ${v}`).join('')}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-[#1C1815] shrink-0">
                        {formatPKR((item.product.price * item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Financial breakdown */}
                <div className="pt-4 border-t border-[#F3EFEA] space-y-2 text-xs font-sans text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1C1815] font-medium">{formatPKR(cartSummary.subtotal)}</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPKR(cartSummary.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-[#1C1815] font-medium">
                      {cartSummary.delivery === 0 ? (
                        <span className="text-emerald-700 font-semibold">Free</span>
                      ) : (
                        formatPKR(cartSummary.delivery)
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#EAE3D8] flex justify-between text-lg font-serif font-semibold text-[#1C1815]">
                    <span>Pay on Delivery</span>
                    <span>{formatPKR(cartSummary.total)}</span>
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
                      Placing your order...
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
                    We will call you to confirm before dispatch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
