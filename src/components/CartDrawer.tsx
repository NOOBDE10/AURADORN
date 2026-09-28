import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartItemQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    freeShippingProgress,
    amountUntilFreeShipping,
    settings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    navigateTo,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0C0C0C] border-l border-[#C5A059]/40 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#C5A059]/20 flex items-center justify-between bg-[#111111]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white">
                Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-stone-400 hover:text-white p-1 rounded-sm hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#141414] px-5 py-3 border-b border-[#C5A059]/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                {amountUntilFreeShipping === 0 ? (
                  <span className="text-[#D4AF37] font-semibold">
                    Congratulations! You unlocked FREE DELIVERY.
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#D4AF37]">PKR {amountUntilFreeShipping.toLocaleString()}</strong> more for FREE DELIVERY
                  </span>
                )}
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#C5A059]/40 mb-2 stroke-[1.5]" />
                <p className="text-sm uppercase tracking-wider text-stone-300 font-medium">
                  Your bag is currently empty
                </p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Discover our exclusive black & gold haute couture pieces and elevate your wardrobe.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="mt-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-black bg-[#D4AF37] hover:bg-[#F3E5AB] transition-colors rounded-xs shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#121212] border border-[#C5A059]/20 rounded-xs hover:border-[#C5A059]/50 transition-colors"
                >
                  <img
                    src={item.product.images[0] || '/src/assets/images/fashion_gold_blazer_1790533633560.jpg'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover object-center rounded-xs bg-stone-900 border border-stone-800 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-500 hover:text-red-400 p-0.5 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                        <span>Size: <strong className="text-stone-200">{item.size}</strong></span>
                        <span>•</span>
                        <span>{item.color}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-stone-700 rounded-xs bg-black/60">
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-xs font-mono font-semibold text-[#D4AF37] tabular-nums">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#111111] border-t border-[#C5A059]/30 space-y-3">
              {/* Coupon section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-xs bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-xs">
                  <div className="flex items-center gap-1.5 text-[#D4AF37]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-PKR {discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-red-400 font-semibold uppercase text-[10px] ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon (e.g. MS10)"
                    className="flex-1 bg-black border border-stone-700 focus:border-[#D4AF37] text-xs px-3 py-2 text-white uppercase placeholder:text-stone-500 rounded-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-stone-800 hover:bg-[#D4AF37] hover:text-black text-stone-200 transition-colors rounded-xs border border-stone-700"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p className={`text-[11px] ${couponFeedback.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-300 pt-1 border-t border-stone-800 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white tabular-nums">PKR {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-mono tabular-nums">-PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-[#D4AF37] font-semibold">FREE</span>
                    ) : (
                      `PKR ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-stone-800">
                  <span className="uppercase tracking-wider">Estimated Total</span>
                  <span className="font-mono text-[#D4AF37] tabular-nums text-base">
                    PKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xs shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
