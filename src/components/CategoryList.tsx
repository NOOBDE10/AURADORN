import React from 'react';
import { useStore } from '../context/StoreContext';
import { safeImageUrl } from '../lib/urls';
import { Category } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface CategoryListProps {
  onSelectCategory: (categorySlug: string) => void;
  activeCategory?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, activeCategory }) => {
  const { categories } = useStore();
  const { scrollTo } = useSmoothScroll();

  return (
    <section className="py-16 sm:py-24 bg-[#0B0A08] border-b border-[#241F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-12 space-y-3"
        >
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#E5C378] font-semibold">
            Shop by Category
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2] font-normal tracking-tight">
            Curated Jewellery Categories
          </h2>
          <p className="text-sm font-sans text-[#A89F91]">
            Explore handcrafted pieces cast in noble metals, adorned with master-cut stones.
          </p>
        </motion.div>

        {/* Categories Grid with stagger entrance */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat: Category, index: number) => {
            const isActive = activeCategory === cat.slug;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.07, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  scrollTo('#products-section', { offset: -60, duration: 1.2 });
                }}
                className={`group cursor-pointer rounded-2xl p-3 bg-[#14120F] border transition-all duration-300 flex flex-col items-center text-center shadow-md hover:shadow-[0_12px_30px_rgba(201,162,93,0.18)] ${
                  isActive 
                    ? 'border-[#E5C378] ring-2 ring-[#C9A25D]/30 shadow-[0_0_20px_rgba(201,162,93,0.25)]' 
                    : 'border-[#26211B] hover:border-[#C9A25D]/70'
                }`}
              >
                {/* Circular / Rounded Image with hover zoom */}
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#1A1714] relative">
                  <motion.img
                    src={safeImageUrl(cat.image, '/logo-256.jpg')}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-[#0B0A08]/90 backdrop-blur-xs rounded-full p-1 text-[#E5C378] opacity-0 group-hover:opacity-100 transition-opacity border border-[#C9A25D]/40">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#E5C378]" />
                  </div>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-medium text-[#FAF7F2] group-hover:text-[#E5C378] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] font-sans text-[#A89F91] mt-0.5">
                  {cat.itemCount} Designs
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
