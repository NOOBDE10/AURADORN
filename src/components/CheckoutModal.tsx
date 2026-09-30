import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format';
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
    settings,
    user,
    customerProfile,
    openAccount
  } = useStore();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    postalCode: '',
    notes: '',
    website: '' // honeypot, hidden from real users
  });

  const [saveAddress, setSaveAddress] = useState(true);

  // Logged-in customers: prefill empty fields from their account.
  useEffect(() => {
    if (!user) return;
    const a = customerProfile?.defaultAddress;
    setFormData(prev => ({
      ...prev,
      customerName: prev.customerName || a?.name || customerProfile?.name || user.displayName || '',
      phone: prev.phone || a?.phone || customerProfile?.phone || '',
      email: prev.email || user.email || '',
      address: prev.address || a?.address || '',
      city: prev.city || a?.city || '',
      area: prev.area || a?.area || '',
      postalCode: prev.postalCode || a?.postalCode || '',
    }));
  }, [user, customerProfile]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (formData.customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^(0|92)?3\d{9}$/.test(phoneDigits)) {
      setErrorMsg('Please enter a valid mobile number, e.g. 0300 1234567.');
      return;
    }
    if (formData.address.trim().length < 5) {
      setErrorMsg('Please enter your complete delivery address.');
      return;
    }
    if (formData.city.trim().length < 2) {
      setErrorMsg('Please enter your city.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
        website: formData.website,
        saveAddress: Boolean(user) && saveAddress,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          ...(item.selectedSize ? { option: item.selectedSize } : {})
        }))
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
              <img loading="lazy" decoding="async" 
                src="/logo-256.jpg" 
                alt={`${settings.brandName} logo`} 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#FAF7F2] leading-tight">
                Checkout • Cash on Delivery
              </h2>
              <span className="text-[10px] text-[#A89F91] font-sans block">Pay cash when your parcel arrives</span>
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
                    No advance payment. Pay the courier in cash when your order is delivered.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {/* Account prompt / status */}
              {user ? (
                <p className="text-xs text-[#A89F91]">
                  Ordering as <span className="text-[#E5C378]">{user.email}</span>. This order will appear in My Account.
                </p>
              ) : (
                <p className="text-xs text-[#A89F91]">
                  Have an account?{' '}
                  <button type="button" onClick={openAccount} className="text-[#E5C378] font-semibold hover:underline cursor-pointer">
                    Log in
                  </button>{' '}
                  to fill in your details and track orders in one place, or simply continue as a guest.
                </p>
              )}

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#E5C378] font-semibold border-b border-[#26211B] pb-1.5 font-sans">
                  1. Recipient Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Ayesha Khan"
                    required
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0300 1234567"
                      required
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ayesha@example.com"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#E5C378] font-semibold border-b border-[#26211B] pb-1.5 font-sans">
                  2. Delivery Address
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Complete Address (house, street, block) *
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
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
                    Order Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Call before delivery, nearest landmark"
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
                {user && (
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input type="checkbox" className="accent-[#C9A25D]" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                    Save this address to my account for next time
                  </label>
                )}
              </div>
            </div>

            {/* Right: Order Summary & Place Order CTA (5 cols) */}
            <div className="lg:col-span-5 bg-[#14120F] p-6 rounded-3xl border border-[#26211B] shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#FAF7F2] pb-3 border-b border-[#241F1A]">
                  Order Summary ({cartSummary.itemCount} items)
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-[#241F1A] max-h-56 overflow-y-auto py-2">
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.selectedSize || ''}`} className="py-2.5 flex items-center gap-3">
                      <img loading="lazy" decoding="async"
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-[#26211B] bg-[#181613] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-medium text-[#FAF7F2] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#A89F91] font-sans">
                          Qty: {item.quantity}{item.selectedSize ? ` • ${item.selectedSize}` : ''}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-[#E5C378] shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Financial breakdown */}
                <div className="pt-4 border-t border-[#241F1A] space-y-2 text-xs font-sans text-[#A89F91]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#FAF7F2] font-medium">{formatPrice(cartSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-[#FAF7F2] font-medium">
                      {cartSummary.delivery === 0 ? (
                        <span className="text-emerald-400 font-semibold">Free</span>
                      ) : (
                        formatPrice(cartSummary.delivery)
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#26211B] flex justify-between text-lg font-serif font-semibold text-[#E5C378]">
                    <span>Total (pay on delivery)</span>
                    <span>{formatPrice(cartSummary.total)}</span>
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
                      Placing your order...
                    </span>
                  ) : (
                    <>
                      <span>Place Order (Cash on Delivery)</span>
                      <ArrowRight className="w-4 h-4 text-[#0B0A08]" />
                    </>
                  )}
                </button>

                <div className="space-y-1 text-[11px] font-sans text-stone-500 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[#A89F91]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E5C378]" />
                    We will call or WhatsApp you to confirm your order
                  </p>
                  <p>
                    By placing your order you agree to our{' '}
                    <Link to="/policies/terms" onClick={closeCheckout} className="underline hover:text-[#E5C378]">Terms</Link> and{' '}
                    <Link to="/policies/returns" onClick={closeCheckout} className="underline hover:text-[#E5C378]">Returns & Exchange</Link> policy.
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
