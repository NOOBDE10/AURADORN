import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
  ArrowLeft,
  Ruler,
  MessageCircle,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateTo,
    settings,
  } = useShop();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Black | Gold Accent');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'fabric' | 'care' | 'shipping'>('desc');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const variantKey = `${selectedSize}_${selectedColor}`;
  const variantStock = product.variantStock[variantKey] ?? product.stock;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigateTo('checkout');
  };

  const handleWhatsAppInquiry = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello MS.! I am interested in purchasing "${product.name}" (SKU: ${product.sku}) in size ${selectedSize}. Please provide assistance.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back to shop navigation */}
      <button
        onClick={() => navigateTo('shop')}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full bg-[#111111] rounded-xs overflow-hidden border border-[#C5A059]/40 shadow-2xl">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Top Center Logo inside picture view */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1 rounded-full border border-[#C5A059]/30">
              <span className="text-xs font-serif-luxury font-bold text-gold-gradient tracking-widest select-none">
                {settings.brandName || 'MS.'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-xs overflow-hidden border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                      : 'border-stone-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details, Selectors, and Purchase CTA */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                {product.category} • {product.gender.toUpperCase()}
              </span>
              <span className="text-xs text-stone-500 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-[#D4AF37]' : 'text-stone-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-300">{product.rating}</span>
              <span className="text-xs text-stone-500">({product.reviewCount} verified client reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4 py-2 border-y border-[#C5A059]/20">
              <span className="text-2xl sm:text-3xl font-bold text-gold-gradient font-mono tabular-nums">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-stone-500 line-through font-mono tabular-nums">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xs">
                  SAVE {product.discountPercent}%
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Size Selector + Size Guide */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-300">
                  Select Size
                </span>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="flex items-center gap-1 text-[#D4AF37] hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => {
                  const vStock = product.variantStock[`${size}_${selectedColor}`] ?? product.stock;
                  const isAvailable = vStock > 0;
                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] py-2 px-3 text-xs font-semibold uppercase tracking-wider rounded-xs border transition-all ${
                        selectedSize === size
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md font-bold'
                          : isAvailable
                          ? 'bg-black text-stone-300 border-stone-800 hover:border-stone-600'
                          : 'bg-stone-900/60 text-stone-600 border-stone-800 line-through cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-stone-400 pt-1">
                Variant Availability:{' '}
                <strong className={variantStock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {variantStock > 0 ? `${variantStock} pieces in stock` : 'Currently Sold Out'}
                </strong>
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 block">
                Color: <span className="text-[#D4AF37]">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-xs border transition-all ${
                      selectedColor === color.name
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                        : 'border-stone-800 bg-black text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-stone-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-stone-700 rounded-xs bg-black">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-stone-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                    disabled={quantity >= variantStock}
                    className="px-3.5 py-3 text-stone-400 hover:text-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={variantStock <= 0}
                  className={`flex-1 py-3.5 px-6 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xs border transition-all ${
                    justAdded
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : variantStock <= 0
                      ? 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
                      : 'bg-black text-[#D4AF37] border-[#C5A059] hover:bg-[#D4AF37] hover:text-black shadow-md'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Shopping Bag
                    </>
                  ) : variantStock <= 0 ? (
                    'Sold Out'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist toggle"
                  className={`p-3.5 border rounded-xs transition-colors ${
                    inWishlist
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'border-stone-800 bg-black text-stone-300 hover:text-[#D4AF37] hover:border-stone-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-black' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={variantStock <= 0}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] hover:brightness-110 text-black font-bold text-xs uppercase tracking-widest rounded-xs shadow-[0_4px_25px_rgba(212,175,55,0.35)] transition-all"
              >
                Instant Buy (Cash on Delivery)
              </button>

              {/* Ask about this product on WhatsApp */}
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-2.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Inquire About This Garment on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-[#C5A059]/30 pt-6 space-y-4">
            <div className="flex border-b border-stone-800 gap-6 text-xs uppercase tracking-wider font-semibold">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'desc'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                Fabrication & Fit
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'care'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                Care Guide
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                Shipping & COD
              </button>
            </div>

            <div className="text-xs text-stone-300 leading-relaxed min-h-[80px]">
              {activeTab === 'desc' && (
                <div className="space-y-1.5">
                  <p><strong>Material:</strong> {product.material}</p>
                  <p><strong>Fabric Construction:</strong> {product.fabric}</p>
                  <p><strong>Silhouetted Fit:</strong> {product.fit}</p>
                </div>
              )}
              {activeTab === 'care' && (
                <ul className="list-disc list-inside space-y-1 text-stone-300">
                  {product.careInstructions?.map((c, i) => (
                    <li key={i}>{c}</li>
                  )) || (
                    <>
                      <li>Specialist dry cleaning strongly recommended</li>
                      <li>Steam iron with cloth barrier; do not iron metallic embellishments directly</li>
                      <li>Store in provided breathable luxury garment bag on structured hanger</li>
                    </>
                  )}
                </ul>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-[#D4AF37] font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    Complimentary White-Glove Delivery
                  </p>
                  <p>
                    All orders exceeding PKR {settings.freeShippingThreshold.toLocaleString()} qualify for free express shipping. Cash on Delivery is available nationwide across Karachi, Lahore, Islamabad, Faisalabad, and 200+ cities in Pakistan. Delivery within 2-4 business days.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products / Complete Your Look */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[#C5A059]/20 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
              Curated Recommendations
            </span>
            <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide">
              COMPLETE YOUR LOOK
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSizeModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative bg-[#0D0D0D] border border-[#C5A059]/50 rounded-xs p-6 max-w-lg w-full z-10 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                MS. Standard Haute Couture Size Matrix (Inches)
              </h4>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <table className="w-full text-xs text-left text-stone-300">
              <thead className="bg-stone-900 text-[#D4AF37]">
                <tr>
                  <th className="p-2">Size</th>
                  <th className="p-2">Chest</th>
                  <th className="p-2">Waist</th>
                  <th className="p-2">Hip</th>
                  <th className="p-2">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                <tr><td className="p-2 font-semibold">XS</td><td className="p-2">34"</td><td className="p-2">26"</td><td className="p-2">36"</td><td className="p-2">26"</td></tr>
                <tr><td className="p-2 font-semibold">S</td><td className="p-2">36"</td><td className="p-2">28"</td><td className="p-2">38"</td><td className="p-2">27"</td></tr>
                <tr><td className="p-2 font-semibold">M</td><td className="p-2">38"</td><td className="p-2">30"</td><td className="p-2">40"</td><td className="p-2">28"</td></tr>
                <tr><td className="p-2 font-semibold">L</td><td className="p-2">40"</td><td className="p-2">32"</td><td className="p-2">42"</td><td className="p-2">29"</td></tr>
                <tr><td className="p-2 font-semibold">XL</td><td className="p-2">43"</td><td className="p-2">35"</td><td className="p-2">45"</td><td className="p-2">30"</td></tr>
                <tr><td className="p-2 font-semibold">XXL</td><td className="p-2">46"</td><td className="p-2">38"</td><td className="p-2">48"</td><td className="p-2">31"</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-stone-500">
              Tailored fit guidelines: For relaxed wear, choose one size up. Contact our concierge for bespoke body measurement tailoring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
