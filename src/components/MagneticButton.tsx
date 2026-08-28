import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode, type MouseEvent } from 'react';

/**
 * Wraps a CTA in three complementary motions:
 *
 * - A magnetic pull toward the cursor. Fine-pointer only (a finger has no
 *   hover position to follow), gated on matchMedia at interaction time.
 * - A press dip that springs back past its resting size on release. Driven by
 *   pointer events, so it covers mouse and touch through one path — this is
 *   what gives touch devices any tap feedback at all, since the magnetic pull
 *   above can never fire for them.
 * - A heat glow that blooms while held (mouse or touch) and cools on release
 *   — same idea as the background constellation's press-and-hold bloom
 *   (see ConstellationGrid.tsx), so a held CTA warms up the same way the
 *   background under a held finger does.
 *
 * Fully inert when reduced motion is requested — the child renders with zero
 * transform and no glow in that case.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const heat = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  // Deliberately underdamped compared to the magnetic springs above: the
  // overshoot on release is what reads as "bouncy" rather than merely smooth.
  const springScale = useSpring(scale, { stiffness: 400, damping: 14, mass: 0.6 });
  // No overshoot wanted here — opacity going past 1 just clips, so this is a
  // smooth damped ease rather than a bounce. Stiffness raised (was 120) so
  // the glow appears essentially on press rather than easing in over ~200ms,
  // matching the constellation's instant heat floor.
  const springHeat = useSpring(heat, { stiffness: 300, damping: 22 });

  const isFinePointer = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !isFinePointer() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePointerDown = () => {
    if (reduceMotion) return;
    scale.set(0.94);
    heat.set(1);
  };

  // Covers a normal release, the pointer sliding off the button while still
  // down, and the browser cancelling the gesture (e.g. it decided this was a
  // scroll instead) — every path that ends the press needs to release the
  // dip and cool the glow, or a cancelled tap would leave the button stuck
  // small and warm.
  const handlePointerEnd = () => {
    if (reduceMotion) return;
    scale.set(1);
    heat.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      style={
        reduceMotion
          ? { position: 'relative', touchAction: 'manipulation' }
          : { position: 'relative', x: springX, y: springY, scale: springScale, touchAction: 'manipulation' }
      }
      className={className}
    >
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: 'inherit',
            background: 'radial-gradient(circle, rgba(255,90,31,0.55) 0%, rgba(255,90,31,0) 70%)',
            filter: 'blur(6px)',
            opacity: springHeat,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
