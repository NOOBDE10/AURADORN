import React from 'react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface CategoryListProps {
  onSelectCategory: (categorySlug: string) => void;
  activeCategory?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, activeCategory }) => {
  const { categories } = useStore();

  // Nothing to show until the owner creates categories in Admin.
  if (categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE3D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C9A25D] font-semibold">
            Shop by Category
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1815] font-normal tracking-tight">
            Our Collections
          </h2>
          <p className="text-sm font-sans text-[#8C7662]">
            Find the perfect piece for every occasion.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat: Category) => {
            const isActive = activeCategory === cat.slug;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group cursor-pointer rounded-2xl p-3 bg-white border transition-all duration-300 flex flex-col items-center text-center shadow-xs hover:shadow-xl ${
                  isActive 
                    ? 'border-[#C9A25D] ring-2 ring-[#C9A25D]/30 shadow-md' 
                    : 'border-[#EAE3D8] hover:border-[#C9A25D]/60'
                }`}
              >
                {/* Circular / Rounded Image with hover zoom */}
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#F3EFEA] relative">
                  {cat.image && <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs rounded-full p-1 text-[#1C1815] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A25D]" />
                  </div>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-medium text-[#1C1815] group-hover:text-[#C9A25D] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] font-sans text-[#8C7662] mt-0.5">
                  {cat.itemCount} {cat.itemCount === 1 ? 'Design' : 'Designs'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
