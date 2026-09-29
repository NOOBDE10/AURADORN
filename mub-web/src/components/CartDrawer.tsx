import React, { useState } from 'react';
import { cartLineKey, useStore } from '../context/StoreContext';
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
import { formatPKR } from '../utils/format';
import { describeCoupon } from '../utils/pricing';

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
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim() || isApplying) return;
    setIsApplying(true);
    if (await applyCouponCode(couponInput)) {
      setCouponInput('');
    }
    setIsApplying(false);
  };

  const hasFreeDeliveryOffer = settings.freeDeliveryThreshold > 0;
  const freeDeliveryProgress = hasFreeDeliveryOffer
    ? Math.min(100, Math.round((cartSummary.subtotal / settings.freeDeliveryThreshold) * 100))
    : 0;
  const amountNeededForFree = cartSummary.amountToFreeDelivery;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-[#EAE3D8] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAE3D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">Shopping Bag</h2>
            <span className="text-xs font-sans bg-[#F3EFEA] text-[#8C7662] px-2 py-0.5 rounded-full font-medium">
              {cartSummary.itemCount} items
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {hasFreeDeliveryOffer && cart.length > 0 && (
        <div className="bg-[#FAF6ED] px-6 py-3 border-b border-[#E6D4AF]/50">
          <div className="flex items-center justify-between text-xs font-sans mb-1.5">
            <span className="flex items-center gap-1.5 text-[#5F4116] font-medium">
              <Truck className="w-3.5 h-3.5 text-[#C9A25D]" />
              {amountNeededForFree === 0
                ? '✨ You qualify for free delivery!'
                : `Add ${formatPKR(amountNeededForFree)} more for free delivery`}
            </span>
          </div>
          <div className="w-full bg-[#EAE3D8] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C9A25D] h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F3EFEA] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#8C7662]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1815]">Your shopping bag is empty</h3>
              <p className="text-xs font-sans text-[#8C7662] max-w-xs">
                Browse our collection and add your favourite pieces.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-[#C9A25D] hover:bg-[#B88E3E] text-[#181412] font-sans text-xs font-semibold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={cartLineKey(item)}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs"
              >
                {/* Thumbnail */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl border border-[#EAE3D8] bg-[#F5EFEB] shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-sm font-medium text-[#1C1815] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(cartLineKey(item))}
                        className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedMetal && (
                      <p className="text-[11px] font-sans text-stone-500 truncate mt-0.5">{item.selectedMetal}</p>
                    )}
                    {item.selectedSize && (
                      <p className="text-[10px] font-sans text-stone-400">Size: {item.selectedSize}</p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#EAE3D8] rounded-lg bg-[#FAF8F5]">
                      <button
                        onClick={() => updateCartQuantity(cartLineKey(item), -1)}
                        className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-sans text-xs font-semibold text-[#1C1815]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(cartLineKey(item), 1)}
                        className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-base font-semibold text-[#1C1815]">
                      {formatPKR((item.product.price * item.quantity))}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#EAE3D8] space-y-4 shadow-lg">
            {/* Coupon Code Form */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl py-2 pl-9 pr-3 text-xs font-sans uppercase placeholder:normal-case focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-[#F3EFEA] hover:bg-[#EAE3D8] text-[#1C1815] font-sans text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {isApplying ? '…' : 'Apply'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] rounded-xl border border-[#C9A25D]/40 text-xs font-sans">
                <span className="flex items-center gap-1.5 text-[#7D591F] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A25D]" />
                  Code {appliedCoupon.code} ({describeCoupon(appliedCoupon)})
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-rose-600 text-xs font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {cartSummary.couponBelowMinimum && appliedCoupon && (
              <p className="text-[11px] text-amber-700 -mt-2">
                Add {formatPKR(appliedCoupon.minOrder - cartSummary.subtotal)} more to use code {appliedCoupon.code}.
              </p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs font-sans text-[#4A3E38]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1815]">{formatPKR(cartSummary.subtotal)}</span>
              </div>
              {cartSummary.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount</span>
                  <span>-{formatPKR(cartSummary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-medium text-[#1C1815]">
                  {cartSummary.delivery === 0 ? (
                    <span className="text-emerald-700 font-semibold">Free</span>
                  ) : (
                    formatPKR(cartSummary.delivery)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#F3EFEA] flex justify-between text-base font-serif font-semibold text-[#1C1815]">
                <span>Total (Cash on Delivery)</span>
                <span>{formatPKR(cartSummary.total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                closeCart();
                openCheckout();
              }}
              className="w-full py-4 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Checkout — Cash on Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A25D]" />
              <span>No advance payment • Pay when you receive</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
