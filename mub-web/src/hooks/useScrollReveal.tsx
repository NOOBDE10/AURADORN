import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight, high-performance scroll reveal hook using IntersectionObserver.
 * GPU-friendly and automatically respects prefers-reduced-motion.
 */
export function useScrollReveal(options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(node);
      }
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const RevealOnScroll: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const { ref, isVisible } = useScrollReveal();

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'translate-y-8 opacity-0';
        case 'down':
          return '-translate-y-8 opacity-0';
        case 'left':
          return 'translate-x-8 opacity-0';
        case 'right':
          return '-translate-x-8 opacity-0';
        case 'none':
          return 'opacity-0 scale-95';
        default:
          return 'translate-y-8 opacity-0';
      }
    }
    return 'translate-y-0 translate-x-0 scale-100 opacity-100';
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
      }}
      className={`transition-all duration-700 ease-out ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};
