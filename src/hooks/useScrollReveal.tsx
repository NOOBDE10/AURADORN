import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
}

export const RevealOnScroll: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 32,
  duration = 0.8,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffsets = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0, opacity: 0, scale: 0.98 };
      case 'down':
        return { y: -distance, x: 0, opacity: 0, scale: 0.98 };
      case 'left':
        return { x: distance, y: 0, opacity: 0, scale: 0.98 };
      case 'right':
        return { x: -distance, y: 0, opacity: 0, scale: 0.98 };
      case 'none':
        return { x: 0, y: 0, opacity: 0, scale: 0.95 };
      default:
        return { y: distance, x: 0, opacity: 0, scale: 0.98 };
    }
  };

  return (
    <motion.div
      initial={getInitialOffsets()}
      whileInView={{
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
      }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1], // Custom luxury cubic-bezier ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
