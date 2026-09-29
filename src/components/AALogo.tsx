import React, { useState } from 'react';

interface AALogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AALogo: React.FC<AALogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  onClick
}) => {
  const [imgSrc, setImgSrc] = useState('/logo.png');

  // Dimension mapping for the circular logo badge
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl'
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Golden Medallion Badge */}
      <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden border border-[#C9A25D]/70 bg-[#0B0A08] p-0.5 shadow-[0_2px_15px_rgba(201,162,93,0.35),0_0_20px_rgba(0,0,0,0.8)] shrink-0 transition-transform duration-300 hover:scale-105`}>
        <img
          src={imgSrc}
          alt="Aura Adorn logo"
          onError={() => setImgSrc('/icon.svg')}
          className="w-full h-full object-cover rounded-full"
        />
        {/* Subtle radial sheen overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#FAF7F2]/10 to-transparent pointer-events-none" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="text-left flex flex-col justify-center">
          <span className={`font-serif ${textSizes[size]} font-semibold tracking-wider text-[#FAF7F2] leading-tight block drop-shadow-xs`}>
            Aura Adorn
          </span>
          {showTagline && (
            <span className="text-[9px] sm:text-[10px] tracking-[0.28em] uppercase text-[#E5C378] font-sans font-medium block">
              Timeless Beauty • Refined Elegance
            </span>
          )}
        </div>
      )}
    </div>
  );
};
