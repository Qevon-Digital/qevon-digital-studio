import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Shared scroll-reveal wrapper used across pages. Respects
 * prefers-reduced-motion by rendering content in its final state
 * immediately instead of animating in.
 */
export default function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      // Content starts mostly-visible (0.6, not 0) rather than fully
      // invisible: a first-time visitor or a slow device shouldn't have to
      // wait on JS/scroll for text that's already there — the animation is
      // a subtle lift-in, not a full reveal-from-nothing.
      initial={{ opacity: 0.6, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
