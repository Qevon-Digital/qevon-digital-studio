import { useEffect, useRef } from 'react';

/**
 * A single soft orange glow that trails the pointer on desktop.
 * Inert (never mounted-visible) on touch devices and when the user
 * requests reduced motion — checked once and on media-query change,
 * not just at mount.
 */
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let raf = 0;

    const tick = () => {
      if (dotRef.current) {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        dotRef.current.style.transform = `translate3d(${x - 100}px, ${y - 100}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    // Was unconditionally re-scheduling every frame even when disabled
    // (touch devices, reduced motion) — a 60fps main-thread callback doing
    // nothing on exactly the devices this needs to stay off of. Now the loop
    // itself starts/stops with `enabled` instead of ticking forever no-op.
    const updateEnabled = () => {
      enabledRef.current = fine.matches && !reduced.matches;
      if (dotRef.current) dotRef.current.style.opacity = enabledRef.current ? '1' : '0';
      if (enabledRef.current && !raf) {
        raf = requestAnimationFrame(tick);
      } else if (!enabledRef.current && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    updateEnabled();
    fine.addEventListener('change', updateEnabled);
    reduced.addEventListener('change', updateEnabled);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      fine.removeEventListener('change', updateEnabled);
      reduced.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,90,31,0.10) 0%, rgba(255,90,31,0) 70%)',
        pointerEvents: 'none',
        zIndex: 30,
        opacity: 0,
        transition: 'opacity 0.3s ease',
        willChange: 'transform',
      }}
    />
  );
}
