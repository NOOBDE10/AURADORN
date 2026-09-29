import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Truck,
  Sparkles
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    closeCart, 
    cart, 
    cartSummary, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    openCheckout,
    applyCouponCode,
    removeCoupon,
    appliedCoupon,
    settings
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    if (applyCouponCode(couponInput)) {
      setCouponInput('');
    }
  };

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((cartSummary.subtotal / settings.freeDeliveryThreshold) * 100)
  );

  const amountNeededForFree = Math.max(0, settings.freeDeliveryThreshold - cartSummary.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0B0A08] h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col border-l border-[#26211B] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#241F1A] bg-[#0E0D0B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0B0A08] shrink-0 p-0.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="AA JEWELLERS" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#FAF7F2] leading-tight">Your Vault Bag</h2>
              <span className="text-[10px] text-[#A89F91] font-sans block">{cartSummary.itemCount} Fine Jewel{cartSummary.itemCount === 1 ? '' : 's'} Selected</span>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#14120F] px-6 py-3.5 border-b border-[#26211B]">
          <div className="flex items-center justify-between text-xs font-sans mb-1.5">
            <span className="flex items-center gap-1.5 text-[#E5C378] font-medium">
              <Truck className="w-3.5 h-3.5 text-[#E5C378]" />
              {amountNeededForFree === 0
                ? '✨ You qualify for Complimentary Insured Express Delivery!'
                : `Add $${amountNeededForFree.toLocaleString()} more for Free Express Delivery`}
            </span>
          </div>
          <div className="w-full bg-[#241F1A] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C9A25D] to-[#E5C378] h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#14120F] border border-[#26211B] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#E5C378]" />
              </div>
              <h3 className="font-serif text-xl text-[#FAF7F2]">Your shopping bag is empty</h3>
              <p className="text-xs font-sans text-[#A89F91] max-w-xs">
                Browse our bespoke solitaires, necklaces, and bangles to begin your collection.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer"
              >
                Explore Portfolios
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={`${item.product.id}-${item.selectedMetal}-${item.selectedSize}`}
                className="flex gap-4 p-4 bg-[#14120F] rounded-2xl border border-[#26211B] shadow-sm hover:border-[#C9A25D]/40 transition-colors"
              >
                {/* Thumbnail */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl border border-[#2E2822] bg-[#181613] shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-sm font-medium text-[#FAF7F2] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] font-sans text-[#A89F91] truncate mt-0.5">
                      {item.selectedMetal || item.product.details.metal}
                    </p>
                    {item.selectedSize && item.selectedSize !== 'Standard' && (
                      <p className="text-[10px] font-sans text-stone-500">Size: {item.selectedSize}</p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#2A241E] rounded-lg bg-[#0E0D0B]">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="p-1 text-stone-400 hover:text-[#FAF7F2] cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-sans text-xs font-semibold text-[#FAF7F2]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="p-1 text-stone-400 hover:text-[#FAF7F2] cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-base font-semibold text-[#E5C378]">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#0E0D0B] border-t border-[#241F1A] space-y-4 shadow-xl">
            {/* Coupon Code Form */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. LUXE10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-[#14120F] border border-[#2A241E] rounded-xl py-2 pl-9 pr-3 text-xs font-sans text-[#FAF7F2] uppercase placeholder:normal-case placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1814] hover:bg-[#28231C] text-[#E5C378] border border-[#C9A25D]/40 font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-[#1C1814] rounded-xl border border-[#C9A25D]/50 text-xs font-sans">
                <span className="flex items-center gap-1.5 text-[#E5C378] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                  Code {appliedCoupon.code} (-{appliedCoupon.percent}%)
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-rose-400 text-xs font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs font-sans text-[#A89F91]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#FAF7F2]">${cartSummary.subtotal.toLocaleString()}</span>
              </div>
              {cartSummary.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Privilege Discount</span>
                  <span>-${cartSummary.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured White Glove Courier</span>
                <span className="font-medium text-[#FAF7F2]">
                  {cartSummary.delivery === 0 ? (
                    <span className="text-emerald-400 font-semibold">Complimentary</span>
                  ) : (
                    `$${cartSummary.delivery}`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#241F1A] flex justify-between text-base font-serif font-semibold text-[#E5C378]">
                <span>Estimated Total (Cash on Delivery)</span>
                <span>${cartSummary.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                closeCart();
                openCheckout();
              }}
              className="w-full py-4 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-2xl shadow-[0_4px_20px_rgba(201,162,93,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Proceed to Cash on Delivery Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#0B0A08]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#A89F91] font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Zero Advance Payment • Pay upon physical inspection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
