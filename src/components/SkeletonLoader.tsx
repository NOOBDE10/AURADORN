import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#14120F] rounded-2xl border border-[#26211B] overflow-hidden flex flex-col shadow-lg animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-gradient-to-r from-[#181613] via-[#26211A] to-[#181613] bg-[length:200%_100%] animate-[luxuryShimmer_1.8s_infinite]" />
      
      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 bg-[#26211B] rounded-full" />
            <div className="h-2.5 w-10 bg-[#26211B] rounded-full" />
          </div>
          {/* Title */}
          <div className="h-4 w-4/5 bg-[#26211B] rounded-md" />
          {/* Specs */}
          <div className="h-3 w-1/2 bg-[#1C1814] rounded-md" />
        </div>

        {/* Price & Actions */}
        <div className="pt-2 border-t border-[#241F1A] space-y-3">
          <div className="h-5 w-24 bg-[#26211B] rounded-md" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 bg-[#1C1814] rounded-xl" />
            <div className="h-9 bg-[#C9A25D]/20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl p-3 bg-[#14120F] border border-[#26211B] flex flex-col items-center shadow-lg animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-gradient-to-r from-[#181613] via-[#26211A] to-[#181613] mb-3 animate-[luxuryShimmer_1.8s_infinite]" />
      <div className="h-4 w-20 bg-[#26211B] rounded-md mb-1.5" />
      <div className="h-2.5 w-12 bg-[#1C1814] rounded-full" />
    </div>
  );
};
