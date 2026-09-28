import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { X, Check, ShoppingBag, Star } from 'lucide-react';

interface QuickViewContentProps {
  product: Product;
  onClose: () => void;
}

const QuickViewContent: React.FC<QuickViewContentProps> = ({ product, onClose }) => {
  const { addToCart, navigateTo, settings } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Black | Gold Accent');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const variantKey = `${selectedSize}_${selectedColor}`;
  const variantStock = product.variantStock[variantKey] ?? product.stock;

  const handleAdd = () => {
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleFullDetails = () => {
    const id = product.id;
    onClose();
    navigateTo('product-detail', id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[#0D0D0D] border border-[#C5A059]/50 rounded-sm shadow-2xl p-6 md:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Image Preview */}
            <div className="relative aspect-[3/4] bg-[#141414] rounded-xs overflow-hidden border border-[#C5A059]/20">
              <img
                src={product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 bg-[#0A0A0A]/90 border border-[#C5A059]/40 px-2 py-0.5 rounded-xs">
                <span className="text-[10px] font-serif-luxury font-bold text-gold-gradient tracking-widest">
                  {settings.brandName || 'MS.'}
                </span>
              </div>
            </div>

            {/* Info and Selectors */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] mb-1">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-stone-500">({product.reviewCount} reviews)</span>
                </div>

                <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                  {product.name}
                </h3>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xl font-bold text-[#D4AF37] font-mono tabular-nums">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-stone-500 line-through font-mono tabular-nums">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-300 mt-3 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-stone-300">Select Size</span>
                  <span className="text-[11px] text-stone-400">
                    Stock: <strong className={variantStock > 0 ? 'text-emerald-400' : 'text-red-400'}>{variantStock > 0 ? `${variantStock} available` : 'Out of Stock'}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs border transition-all ${
                        selectedSize === size
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                          : 'bg-black text-stone-300 border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 block">
                  Color: <span className="text-[#D4AF37]">{selectedColor}</span>
                </span>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-xs border transition-all ${
                        selectedColor === color.name
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                          : 'border-stone-800 bg-black text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-stone-600" style={{ backgroundColor: color.hex }} />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <div className="flex items-center border border-stone-700 rounded-xs bg-black">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-stone-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-mono text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                      disabled={quantity >= variantStock}
                      className="px-3 py-2 text-stone-400 hover:text-white disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={variantStock <= 0}
                    className={`flex-1 py-3 px-4 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xs border transition-all ${
                      justAdded
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : variantStock <= 0
                        ? 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA8222] text-black border-[#D4AF37] hover:brightness-110 shadow-lg'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Bag
                      </>
                    ) : variantStock <= 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleFullDetails}
                  className="w-full py-2 text-xs uppercase tracking-wider text-stone-400 hover:text-[#D4AF37] border border-stone-800 hover:border-[#D4AF37]/50 rounded-xs transition-colors"
                >
                  View Complete Product Specifications →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct } = useShop();

  if (!quickViewProduct) return null;

  return (
    <QuickViewContent
      key={quickViewProduct.id}
      product={quickViewProduct}
      onClose={() => setQuickViewProduct(null)}
    />
  );
};
