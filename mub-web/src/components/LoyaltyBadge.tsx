import React, { useState } from 'react';
import { Crown, Gem, Sparkles, Award, Lock, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

export interface LoyaltyBadgeProps {
  product: Product;
  /** Display variant: 'card' for product grids, 'detailed' for product modal, 'compact' for tables */
  variant?: 'card' | 'compact' | 'detailed';
  showTooltip?: boolean;
  className?: string;
  forceLabel?: 'Limited Edition' | 'Exclusive';
}

export type LoyaltyBadgeType = 
  | 'limited_edition' 
  | 'exclusive' 
  | 'vault_exclusive' 
  | 'patron_reserve' 
  | 'atelier_private' 
  | 'connoisseur';

export interface ResolvedLoyaltyTier {
  displayLabel: 'Limited Edition' | 'Exclusive';
  fullTitle: string;
  tagline: string;
  description: string;
  editionText?: string;
  perkText?: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Determines whether a product qualifies for a Loyalty Badge on premium cards
 * and returns the appropriate 'Limited Edition' or 'Exclusive' configuration.
 */
export function getProductLoyaltyTier(product: Product): ResolvedLoyaltyTier | null {
  // 1. Explicitly configured badge from admin or data
  if (product.loyaltyBadge) {
    const type = product.loyaltyBadge.type;
    const isLimited = type === 'limited_edition' || product.isLimitedEdition;
    
    return {
      displayLabel: isLimited ? 'Limited Edition' : 'Exclusive',
      fullTitle: product.loyaltyBadge.label || (isLimited ? 'Limited Edition' : 'Exclusive'),
      tagline: isLimited ? 'Limited quantity' : 'Exclusive design',
      description: isLimited
        ? 'Available in limited quantity only.'
        : 'An exclusive design from our collection.',
      editionText: product.loyaltyBadge.editionNumber,
      perkText: product.loyaltyBadge.perkNote,
      icon: isLimited ? Gem : Crown,
    };
  }

  // 2. Explicit isLimitedEdition boolean flag
  if (product.isLimitedEdition) {
    const pieces = product.limitedPiecesCount ? `Limited run of ${product.limitedPiecesCount}` : undefined;
    return {
      displayLabel: 'Limited Edition',
      fullTitle: 'Limited Edition',
      tagline: 'Limited quantity',
      description: 'Available in limited quantity only.',
      editionText: pieces,
      perkText: undefined,
      icon: Gem,
    };
  }

  return null;
}

/**
 * 'Loyalty Badge' Component
 * 
 * Displays 'Limited Edition' or 'Exclusive' labels on premium product cards in the ProductGrid.
 * Features a subtle, gold-foil metallic appearance with reflective specular gleam,
 * micro-embossed borders, and deep gilded typography.
 */
export const LoyaltyBadge: React.FC<LoyaltyBadgeProps> = ({
  product,
  variant = 'card',
  showTooltip = true,
  className = '',
  forceLabel,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const tier = getProductLoyaltyTier(product);
  if (!tier) return null;

  const label = forceLabel || tier.displayLabel;
  const Icon = tier.icon;

  // ─────────────────────────────────────────────────────────────
  // VARIANT: 'card' (Featured on ProductGrid Product Cards)
  // Subtle, gold-foil metallic appearance with authentic hot-stamped feel
  // ─────────────────────────────────────────────────────────────
  if (variant === 'card') {
    return (
      <div 
        className={`relative inline-flex items-center group/loyalty select-none ${className}`}
        onMouseEnter={() => showTooltip && setIsHovered(true)}
        onMouseLeave={() => showTooltip && setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Gold-Foil Metallic Badge */}
        <div
          className="gold-foil-badge gold-foil-gleam flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider uppercase cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          title={`${tier.fullTitle} — ${tier.tagline}`}
        >
          {/* Subtle Gilded Icon */}
          <span className="relative flex items-center justify-center shrink-0">
            <Icon className="w-3 h-3 text-[#5A3E09] drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.8)]" />
          </span>

          {/* Gold-foil stamped typography */}
          <span className="tracking-[0.12em] font-serif font-semibold text-[10px] leading-tight text-[#2B1B04]">
            {label}
          </span>

          {/* Optional Edition Number if present */}
          {tier.editionText && (
            <span className="hidden sm:inline-block pl-1 text-[9px] font-sans font-medium text-[#4A3207]/80 border-l border-[#8C6514]/30">
              {tier.editionText.replace('Limited run of ', '')}
            </span>
          )}
        </div>

        {/* Micro-Interaction Luxury Tooltip on Hover */}
        {showTooltip && isHovered && (
          <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 rounded-2xl bg-[#1C1815] text-[#FAF8F5] border border-[#C9A25D]/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),0_0_15px_rgba(201,162,93,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#C9A25D]/15 border border-[#C9A25D]/40 text-[#E6D4AF] shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#C9A25D]" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-serif text-xs font-semibold text-[#E6D4AF] tracking-wide truncate">
                    {tier.fullTitle}
                  </h4>
                  <span className="shrink-0 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C9A25D]/20 text-[#E6D4AF] font-sans font-bold border border-[#C9A25D]/40">
                    Prestige
                  </span>
                </div>
                <p className="text-[11px] font-sans text-stone-300 leading-relaxed">
                  {tier.description}
                </p>
                {tier.editionText && (
                  <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[10px] font-sans text-stone-400">
                    <span>Edition:</span>
                    <span className="text-[#C9A25D] font-medium">{tier.editionText}</span>
                  </div>
                )}
                {tier.perkText && (
                  <div className="text-[10px] font-sans text-amber-200/90 flex items-center gap-1 pt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-[#C9A25D] shrink-0" />
                    <span className="truncate">{tier.perkText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT: 'compact' (Minimalist foil tag for admin or lists)
  // ─────────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <span
        className={`gold-foil-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-sans font-semibold tracking-wider uppercase ${className}`}
        title={`${tier.fullTitle} — ${tier.description}`}
      >
        <Icon className="w-2.5 h-2.5 text-[#5A3E09]" />
        <span>{label}</span>
      </span>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT: 'detailed' (Prominent Banner in Product Details Modal)
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-2xl p-4 bg-gradient-to-r from-[#1C1815] via-[#2A221A] to-[#181411] border border-[#C9A25D]/50 text-[#FAF8F5] shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient background shimmer */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-[#C9A25D]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start gap-3.5">
        <div className="gold-foil-badge p-2.5 rounded-xl text-[#3A2606] shrink-0 shadow-md">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="gold-foil-badge px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-widest uppercase">
                {label}
              </span>
              <span className="text-stone-600">·</span>
              <h4 className="font-serif text-sm font-medium text-[#FAF8F5]">
                {tier.fullTitle}
              </h4>
            </div>
            {tier.editionText && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-[#C9A25D]/40 text-[10px] font-mono text-[#E6D4AF] font-medium">
                {tier.editionText}
              </span>
            )}
          </div>

          <p className="text-xs font-sans text-stone-300 leading-relaxed">
            {tier.description}
          </p>

        </div>
      </div>
    </div>
  );
};
