import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { absoluteUrl, productPath } from '../lib/urls';
import { Product, Review } from '../types';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Zap, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Award, 
  Star, 
  Plus, 
  Minus,
  CheckCircle2,
  Send,
  ChevronRight,
  Share2
} from 'lucide-react';
import { addReview } from '../services/storeService';
import { LoyaltyBadge } from './LoyaltyBadge';

export const ProductDetailsModal: React.FC = () => {
  const { 
    selectedProduct, 
    openProductDetails,
    closeProductDetails, 
    addToCart, 
    openCheckout, 
    toggleWishlist, 
    isInWishlist, 
    settings,
    products,
    reviews,
    showToast,
    refreshData: _refreshData
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'care' | 'delivery'>('specs');
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reset per-product choices whenever a different product is opened.
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedSize('');
    setActiveTab('specs');
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const productOptions = selectedProduct.options || [];
  const optionLabel = selectedProduct.optionLabel || 'Size';
  const needsOption = productOptions.length > 0 && !selectedSize;
  const outOfStock = selectedProduct.stock <= 0 || selectedProduct.status === 'out_of_stock';

  const isWishlisted = isInWishlist(selectedProduct.id);

  // Related products
  const relatedProducts = products
    .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 3);

  // Product reviews
  const productReviews = reviews.filter(r => r.productId === selectedProduct.id && r.status === 'approved');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddToCart = () => {
    if (needsOption) {
      showToast(`Please choose a ${optionLabel.toLowerCase()}.`, 'info');
      return;
    }
    addToCart(selectedProduct, quantity, undefined, selectedSize || undefined);
  };

  const handleBuyNow = () => {
    if (needsOption) {
      showToast(`Please choose a ${optionLabel.toLowerCase()}.`, 'info');
      return;
    }
    addToCart(selectedProduct, quantity, undefined, selectedSize || undefined);
    closeProductDetails();
    openCheckout();
  };

  const handleShare = async () => {
    const url = absoluteUrl(productPath(selectedProduct));
    const title = `${selectedProduct.name} | ${settings.brandName}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${selectedProduct.name}: ${formatPrice(selectedProduct.price)}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('Link copied. Paste it in WhatsApp or Instagram to share.', 'gold');
    } catch {
      // user cancelled the share sheet
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `Hello ${settings.brandName}, I would like to order:

*Product:* ${selectedProduct.name}
*Link:* ${absoluteUrl(productPath(selectedProduct))}
*Quantity:* ${quantity}
*Price:* ${formatPrice(selectedProduct.price * quantity)}${selectedSize ? `\n*${optionLabel}:* ${selectedSize}` : ''}

Please confirm availability for Cash on Delivery.`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) {
      showToast('Please provide your name and review remarks.', 'info');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        customerName: reviewerName,
        customerEmail: reviewerEmail,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      showToast('Thank you! Your review will appear after it is approved.', 'gold');
      setReviewTitle('');
      setReviewComment('');
      setReviewerName('');
      setReviewerEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-5xl my-auto rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Close Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#241F1A] bg-[#0A0908] sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs font-sans text-[#A89F91]">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0E0D0B] shrink-0 p-0.5 shadow-sm">
              <img loading="lazy" decoding="async" 
                src="/logo-256.jpg" 
                alt="Aura Adorn logo" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-widest text-[#E5C378] font-semibold">{selectedProduct.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium text-[#FAF7F2] truncate max-w-xs">{selectedProduct.name}</span>
            </div>
          </div>
          <button
            onClick={closeProductDetails}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div data-lenis-prevent className="overflow-y-auto p-4 sm:p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image with Zoom on Hover */}
              <div 
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#14120F] border border-[#26211B] cursor-crosshair group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img loading="lazy" decoding="async"
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-175' : 'scale-100'
                  }`}
                  style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                />

                {/* Subtle instruction pill */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-[#E5C378] border border-[#C9A25D]/30 text-[11px] font-sans px-3 py-1 rounded-full pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                  Hover to zoom
                </div>

                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer border ${
                    isWishlisted ? 'bg-rose-950/80 text-rose-400 border-rose-500/40' : 'bg-[#0B0A08]/75 text-stone-300 hover:bg-[#181613] hover:text-[#E5C378] border-[#2A241E]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
                {/* Share button */}
                <button
                  onClick={handleShare}
                  aria-label="Share this product"
                  title="Share"
                  className="absolute top-16 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer border bg-[#0B0A08]/75 text-stone-300 hover:bg-[#181613] hover:text-[#E5C378] border-[#2A241E]"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails Row */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#E5C378] shadow-md shadow-[#C9A25D]/20' : 'border-[#26211B] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img loading="lazy" decoding="async" src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust badges row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#26211B] text-center">
                <div className="p-3 bg-[#14120F] rounded-xl border border-[#26211B]">
                  <ShieldCheck className="w-5 h-5 text-[#E5C378] mx-auto mb-1" />
                  <span className="text-[11px] font-sans font-medium text-[#FAF7F2] block">Quality Finish</span>
                  <span className="text-[10px] text-stone-400">Checked before dispatch</span>
                </div>
                <div className="p-3 bg-[#14120F] rounded-xl border border-[#26211B]">
                  <Truck className="w-5 h-5 text-[#E5C378] mx-auto mb-1" />
                  <span className="text-[11px] font-sans font-medium text-[#FAF7F2] block">Cash on Delivery</span>
                  <span className="text-[10px] text-stone-400">All over Pakistan</span>
                </div>
                <div className="p-3 bg-[#14120F] rounded-xl border border-[#26211B]">
                  <Award className="w-5 h-5 text-[#E5C378] mx-auto mb-1" />
                  <span className="text-[11px] font-sans font-medium text-[#FAF7F2] block">Easy Exchange</span>
                  <span className="text-[10px] text-stone-400">If damaged on arrival</span>
                </div>
              </div>
            </div>

            {/* Product Meta & Actions Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Rating & Stock */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-sans font-semibold text-[#FAF7F2]">{selectedProduct.rating}</span>
                    <span className="text-xs text-stone-400">({selectedProduct.reviewCount} reviews)</span>
                  </div>

                  {selectedProduct.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {selectedProduct.stock <= 3 ? `Only ${selectedProduct.stock} left` : 'In stock'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-stone-900 text-stone-400 text-xs font-medium border border-stone-800">
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal leading-tight">
                  {selectedProduct.name}
                </h1>

                {/* Prestige Loyalty Badge Banner */}
                <LoyaltyBadge product={selectedProduct} variant="detailed" />

                {/* Price Display */}
                <div className="flex items-baseline gap-3 py-2 border-y border-[#26211B]">
                  <span className="font-serif text-3xl font-semibold text-[#E5C378]">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <>
                      <span className="font-sans text-base text-stone-500 line-through">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded">
                        Save {selectedProduct.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm font-sans text-[#C5BDB2] leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Customer choice (size / colour), configured per product in admin */}
                {productOptions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5BDB2] font-sans">
                      {optionLabel}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSelectedSize(opt)}
                          className={`px-3 py-2 text-xs font-sans rounded-xl border transition-all cursor-pointer ${
                            selectedSize === opt
                              ? 'border-[#E5C378] bg-[#1C1814] font-semibold text-[#E5C378]'
                              : 'border-[#26211B] bg-[#14120F] text-[#A89F91] hover:border-[#C9A25D]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-sans uppercase tracking-widest text-[#E5C378] font-semibold">
                    Quantity
                  </span>
                  <div className="flex items-center border border-[#26211B] bg-[#14120F] rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-stone-400 hover:text-[#FAF7F2] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-sans font-medium text-sm text-[#FAF7F2]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock || 10, quantity + 1))}
                      className="p-2 text-stone-400 hover:text-[#FAF7F2] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Bag, Buy Now (COD), WhatsApp Order */}
              <div className="space-y-2.5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className="py-3.5 px-4 bg-[#14120F] hover:bg-[#1E1B16] text-[#FAF7F2] border border-[#C9A25D]/50 font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 active:scale-95 hover:text-[#E5C378]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={outOfStock}
                    className="py-3.5 px-4 bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-[#0B0A08]" />
                    <span>{outOfStock ? 'Out of Stock' : 'Buy Now (COD)'}</span>
                  </button>
                </div>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Tabs Section */}
          <div className="pt-6 border-t border-[#26211B]">
            {/* Tabs Header */}
            <div className="flex border-b border-[#26211B] space-x-8 text-xs font-sans uppercase tracking-widest font-medium overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-3 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                  activeTab === 'specs' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                  activeTab === 'reviews' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                }`}
              >
                Reviews ({productReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-3 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                  activeTab === 'care' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                }`}
              >
                Care & Info
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-3 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
                  activeTab === 'delivery' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                }`}
              >
                Cash on Delivery & Returns
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6 text-sm font-sans text-[#A89F91]">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  {([
                    ['Material & finish', selectedProduct.details?.metal],
                    ['Stones', selectedProduct.details?.stone],
                    ['Colour', selectedProduct.details?.color],
                    ['Includes', selectedProduct.details?.includes],
                    ['Size / dimensions', selectedProduct.details?.dimensions],
                    ['Weight', selectedProduct.details?.weight],
                    ['Type', 'Artificial (imitation) jewellery'],
                  ] as const)
                    .filter(([, v]) => Boolean(v))
                    .map(([label, value]) => (
                      <div key={label} className="flex justify-between border-b border-[#26211B] pb-2">
                        <span className="text-[#8C8275]">{label}:</span>
                        <span className="font-medium text-[#FAF7F2] text-right">{value}</span>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {productReviews.length === 0 ? (
                      <p className="text-stone-500 italic">No reviews yet. Be the first to share your experience!</p>
                    ) : (
                      productReviews.map(r => (
                        <div key={r.id} className="p-4 bg-[#14120F] rounded-xl border border-[#26211B] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#FAF7F2]">{r.customerName}</span>
                            <div className="flex text-amber-400">
                              {[...Array(r.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="font-serif font-medium text-[#E5C378]">{r.title}</p>
                          <p className="text-xs text-[#C5BDB2]">{r.comment}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Purchaser</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write a Review Form */}
                  <form onSubmit={handleReviewSubmit} className="bg-[#14120F] p-6 rounded-2xl border border-[#26211B] space-y-4">
                    <h4 className="font-serif text-lg text-[#FAF7F2]">Write a Review</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-400">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        required
                        className="p-2.5 text-xs bg-[#0B0A08] border border-[#26211B] rounded-xl text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        className="p-2.5 text-xs bg-[#0B0A08] border border-[#26211B] rounded-xl text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Headline (e.g., Unmatched radiance)"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#0B0A08] border border-[#26211B] rounded-xl text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                    <textarea
                      placeholder="Detail your appreciation of the stone, setting, and presentation..."
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full p-2.5 text-xs bg-[#0B0A08] border border-[#26211B] rounded-xl text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Publishing...' : 'Publish Review'}</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="bg-[#14120F] p-6 rounded-2xl border border-[#26211B] space-y-3">
                  <p className="text-xs leading-relaxed text-[#C5BDB2]">
                    {settings.warrantyPolicy}
                  </p>
                  <p className="text-xs leading-relaxed text-[#C5BDB2]">
                    Put your jewellery on after perfume and make-up, take it off before bathing or exercise, wipe gently with a soft dry cloth and store it in an airtight pouch to keep the plating bright.
                  </p>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="bg-[#14120F] p-6 rounded-2xl border border-[#26211B] space-y-3">
                  <p className="text-xs leading-relaxed text-[#C5BDB2]">
                    {settings.shippingPolicy}
                  </p>
                  <p className="text-xs leading-relaxed text-[#C5BDB2]">
                    {settings.returnPolicy}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Creations */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#26211B]">
              <h3 className="font-serif text-xl text-[#FAF7F2] mb-4">Complementary Creations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      openProductDetails(p);
                      setActiveImageIndex(0);
                    }}
                    className="p-3 bg-[#14120F] rounded-xl border border-[#26211B] hover:border-[#C9A25D] transition-colors cursor-pointer flex items-center gap-3 group"
                  >
                    <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-[#26211B] bg-[#181613]" />
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#FAF7F2] group-hover:text-[#E5C378] transition-colors line-clamp-1">{p.name}</h4>
                      <p className="text-xs font-sans text-[#E5C378] font-semibold mt-1">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
