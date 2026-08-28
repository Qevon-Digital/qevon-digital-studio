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

    const updateEnabled = () => {
      enabledRef.current = fine.matches && !reduced.matches;
      if (dotRef.current) dotRef.current.style.opacity = enabledRef.current ? '1' : '0';
    };
    updateEnabled();
    fine.addEventListener('change', updateEnabled);
    reduced.addEventListener('change', updateEnabled);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let raf: number;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      if (enabledRef.current && dotRef.current) {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        dotRef.current.style.transform = `translate3d(${x - 100}px, ${y - 100}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      fine.removeEventListener('change', updateEnabled);
      reduced.removeEventListener('change', updateEnabled);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
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
