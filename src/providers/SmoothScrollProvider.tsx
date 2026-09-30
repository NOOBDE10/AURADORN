import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useStore } from '../context/StoreContext';
import { ArrowUp } from 'lucide-react';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const backToTopVisibleRef = useRef<boolean>(false);

  const {
    isCartOpen,
    isWishlistOpen,
    isCheckoutOpen,
    isTrackingOpen,
    isAdminOpen,
    isAccountOpen,
    isCompareModalOpen,
    selectedProduct,
    quickViewProduct,
  } = useStore();

  const isAnyModalOpen = Boolean(
    isCartOpen ||
    isWishlistOpen ||
    isCheckoutOpen ||
    isTrackingOpen ||
    isAdminOpen ||
    isAccountOpen ||
    isCompareModalOpen ||
    selectedProduct ||
    quickViewProduct
  );

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    // Respect user's prefers-reduced-motion setting
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Quintic ease
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: false,
    });

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    setLenisInstance(lenis);

    // Direct DOM manipulation for top progress bar without triggering React component tree re-renders
    lenis.on('scroll', (e: { progress: number; scroll: number }) => {
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${e.progress})`;
        progressBarRef.current.style.opacity = e.progress > 0.01 ? '1' : '0';
      }

      const shouldShow = e.scroll > 400;
      if (shouldShow !== backToTopVisibleRef.current) {
        backToTopVisibleRef.current = shouldShow;
        setShowBackToTop(shouldShow);
      }
    });

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
    };
  }, []);

  // Pause or resume smooth scrolling when modals/drawers are open
  useEffect(() => {
    if (!lenisInstance) return;

    if (isAnyModalOpen) {
      lenisInstance.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenisInstance.start();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [lenisInstance, isAnyModalOpen]);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number }
  ) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, {
        offset: options?.offset ?? 0,
        duration: options?.duration ?? 1.1,
      });
    } else {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBackToTop = () => {
    scrollTo(0, { duration: 1.1 });
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
      {/* Delicate Champagne Gold Top Scroll Progress Bar */}
      <div 
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C9A25D] via-[#E5C378] to-[#C9A25D] z-50 origin-left pointer-events-none shadow-[0_1px_8px_rgba(201,162,93,0.6)] opacity-0 transition-opacity duration-150 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />

      {children}

      {/* Floating Smooth Back-to-Top Button */}
      <button
        onClick={handleBackToTop}
        aria-label="Scroll back to top"
        style={{
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
          pointerEvents: showBackToTop ? 'auto' : 'none'
        }}
        className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-[#0E0D0B]/90 hover:bg-[#C9A25D] text-[#FAF7F2] hover:text-[#0B0A08] border border-[#C9A25D]/40 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 group"
      >
        <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
      </button>
    </SmoothScrollContext.Provider>
  );
};
