import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products, navigateTo } = useShop();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, products]);

  if (!isOpen) return null;

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigateTo('product-detail', productId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#C5A059]/40 rounded-sm shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative flex items-center border-b border-[#C5A059]/30 pb-4 mb-6">
            <Search className="w-6 h-6 text-[#D4AF37] mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search silk blouses, blazers, tuxedos, gowns, kurtas..."
              autoFocus
              className="w-full bg-transparent text-lg text-white placeholder:text-stone-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-stone-500 hover:text-white text-xs uppercase tracking-wider font-mono mr-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Suggestions when empty */}
          {!query && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Silk Blouse', 'Olympia Blazer', 'Tuxedo', 'Raw Silk Kurta', 'Embroidered Gown', 'Velvet Jacket'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 hover:border-[#D4AF37] text-stone-300 hover:text-[#D4AF37] rounded-xs transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Results */}
          {query && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs uppercase tracking-widest text-stone-400">
                Found {searchResults.length} matching pieces
              </p>

              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-stone-500 space-y-2">
                  <p className="text-sm">No couture garments found for "{query}"</p>
                  <p className="text-xs">Try searching for "blazer", "tuxedo", "silk", or "dress"</p>
                </div>
              ) : (
                searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-4 p-2.5 rounded-xs hover:bg-[#161616] border border-transparent hover:border-[#C5A059]/30 transition-all cursor-pointer group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover object-center rounded-xs bg-stone-900 border border-stone-800 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        {p.category} • {p.colors[0]?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-[#D4AF37] tabular-nums">
                        PKR {p.price.toLocaleString()}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
