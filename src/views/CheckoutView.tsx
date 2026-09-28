import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, Tag } from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    appliedCoupon,
    placeOrder,
    navigateTo,
    settings,
    deliveryDistanceKm,
    setDeliveryDistanceKm,
  } = useShop();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    area: '',
    postalCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const majorCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Sialkot',
    'Gujranwala',
    'Quetta',
    'Hyderabad',
    'Other City',
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Valid phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.address.trim()) errs.address = 'Delivery address is required';
    if (!formData.area.trim()) errs.area = 'Area/Sector is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      navigateTo('shop');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder(formData);
      setIsSubmitting(false);
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-stone-300 font-semibold">
          Your shopping bag is currently empty
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button
        onClick={() => navigateTo('shop')}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Continue Shopping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer Information & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-wide">
              EXPRESS CHECKOUT
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Please enter your consignment details for expedited white-glove delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Details */}
            <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37] border-b border-stone-800 pb-2">
                1. Recipient Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className={`w-full bg-black border ${
                      errors.name ? 'border-red-500' : 'border-stone-800'
                    } focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none`}
                  />
                  {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    Phone Number (for Courier & Tracking) *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0300 1234567"
                    className={`w-full bg-black border ${
                      errors.phone ? 'border-red-500' : 'border-stone-800'
                    } focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                  Email Address (for Order Confirmation & Tracking) *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. eleanor@email.com"
                  className={`w-full bg-black border ${
                    errors.email ? 'border-red-500' : 'border-stone-800'
                  } focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none`}
                />
                {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37] border-b border-stone-800 pb-2">
                2. Delivery Destination
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none"
                  >
                    {majorCities.map((c) => (
                      <option key={c} value={c} className="bg-stone-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    Area / Phase / Sector *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. DHA Phase 5 / Gulberg / F-7"
                    className={`w-full bg-black border ${
                      errors.area ? 'border-red-500' : 'border-stone-800'
                    } focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none`}
                  />
                  {errors.area && <p className="text-[11px] text-red-400 mt-1">{errors.area}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                  Complete Street Address / House / Flat / Plaza *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House #14, Street 9, Near Central Mosque"
                  className={`w-full bg-black border ${
                    errors.address ? 'border-red-500' : 'border-stone-800'
                  } focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none`}
                />
                {errors.address && <p className="text-[11px] text-red-400 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="e.g. 54000"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1">
                    Order Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Leave with security guard"
                    className="w-full bg-black border border-stone-800 focus:border-[#D4AF37] text-xs px-3 py-2.5 text-white rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Distance from Base Dispatch Hub / Delivery Fee Calculator */}
              <div className="p-4 bg-[#111111] border border-[#C5A059]/40 rounded-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Delivery Distance & Courier Rate
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    Dispatch Hub: {settings.storeBaseLocation || 'Lahore Hub'}
                  </span>
                </div>

                {/* Distance Selector buttons */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5">
                    Select Distance from Dispatch Hub (کلومیٹر فاصلہ):
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 8].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setDeliveryDistanceKm(km)}
                        className={`py-2 px-1 text-center rounded-xs border text-xs font-mono font-semibold transition-all ${
                          deliveryDistanceKm === km
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm font-bold'
                            : 'bg-black text-stone-300 border-stone-800 hover:border-stone-600'
                        }`}
                      >
                        <div>{km} km</div>
                        <div className="text-[10px] opacity-80">
                          {km === 1 ? 'PKR 200' : km === 2 ? 'PKR 250' : km === 3 ? 'PKR 300' : km === 4 ? 'PKR 350' : km === 5 ? 'PKR 400' : `PKR ${200 + (km - 1) * 50}`}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Distance slider for user flexibility */}
                  <div className="mt-3 flex items-center gap-3 bg-black/60 p-2.5 rounded-xs border border-stone-800">
                    <span className="text-[11px] text-stone-400 shrink-0">Custom Distance:</span>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={deliveryDistanceKm}
                      onChange={(e) => setDeliveryDistanceKm(Number(e.target.value))}
                      className="flex-1 accent-[#D4AF37] cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-[#D4AF37] shrink-0 w-14 text-right">
                      {deliveryDistanceKm} km
                    </span>
                  </div>
                </div>

                {/* Free Shipping Alert vs Standard Fee */}
                {subtotal >= (settings.freeShippingThreshold || 500) ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-600/50 rounded-xs flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      🎉 <strong>Free Delivery Active!</strong> Orders over PKR {(settings.freeShippingThreshold || 500).toLocaleString()} enjoy 100% complimentary courier shipping.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-black/80 border border-stone-800 rounded-xs flex items-center justify-between text-xs text-stone-300">
                    <span>
                      Distance: <strong className="text-white">{deliveryDistanceKm} km</strong> (PKR 200 base for 1 km + PKR 50/km)
                    </span>
                    <span className="text-[#D4AF37] font-mono font-bold">
                      Delivery: PKR {deliveryFee.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method (Cash on Delivery) */}
            <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37] border-b border-stone-800 pb-2">
                3. Payment Method
              </h2>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#D4AF37]/15 to-transparent border border-[#D4AF37]/40 rounded-xs">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Cash on Delivery (COD) Nationwide
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Pay the total balance in Pakistani Rupees directly to the courier rider upon delivery. No upfront payment required.
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold text-sm uppercase tracking-[0.2em] rounded-xs shadow-[0_4px_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>CONFIRMING ROSTER ALLOCATION...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>PLACE ORDER — PKR {total.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#0C0C0C] border border-[#C5A059]/40 rounded-xs p-6 space-y-6 sticky top-28 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white border-b border-[#C5A059]/30 pb-3">
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
            </h3>

            {/* Item Mini Cards */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-stone-800">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 object-cover object-center rounded-xs bg-stone-900 border border-stone-800 shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <h4 className="font-semibold text-white uppercase tracking-wider line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      Size: {item.size} • {item.color}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-stone-300 font-mono">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-semibold text-[#D4AF37] tabular-nums">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 text-xs border-t border-stone-800 pt-4 font-medium">
              <div className="flex justify-between text-stone-300">
                <span>Subtotal</span>
                <span className="font-mono text-white tabular-nums">PKR {subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono tabular-nums">-PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-300">
                <span>Shipping & Courier ({deliveryDistanceKm} km)</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-[#D4AF37] font-semibold">FREE (Over PKR {(settings.freeShippingThreshold || 500).toLocaleString()})</span>
                  ) : (
                    `PKR ${deliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-[#C5A059]/30">
                <span className="uppercase tracking-wider">Total Amount Due</span>
                <span className="font-mono text-[#D4AF37] tabular-nums text-lg">
                  PKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Assurance Trust Badges */}
            <div className="pt-2 border-t border-stone-800 space-y-2 text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Verified authentic MS. couture garment packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Express courier tracking ID will be generated upon confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
