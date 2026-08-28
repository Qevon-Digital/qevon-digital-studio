import { useEffect, useRef, useState } from 'react';
import { LogoMark } from './Logo';

// Timing model ported from the source logo-reveal design (numbers only —
// this is a from-scratch React implementation, not a copy of that runtime).
// Retimed so time-to-content lands at ~2500ms measured from navigationStart
// (TOTAL 2050 + EXIT_DUR 450, minus whatever JS boot already consumed — see
// totalRef below). Every phase was scaled by roughly the same factor rather
// than trimming one of them, so the animation reads identically, just
// brisker. This is the single biggest lever on perceived load time: the
// intro is a full-screen overlay, so nothing else on the page matters until
// it leaves.
const LETTERS = 'evon'.split('');
const PER_CHAR = 80; // ms between each letter typing in
const TYPE_END = PER_CHAR * LETTERS.length;
const COLLAPSE_GAP = 380; // pause after typing before collapse starts
const COLLAPSE_STAGGER = 70; // ms between each letter's collapse start (rightmost first)
const COLLAPSE_DUR = 320;
const COLLAPSE_START = TYPE_END + COLLAPSE_GAP;
const COLLAPSE_END = COLLAPSE_START + COLLAPSE_STAGGER * (LETTERS.length - 1) + COLLAPSE_DUR;
const CENTER_GAP = 100;
const CENTER_DUR = 360;
const CENTER_START = COLLAPSE_END + CENTER_GAP;
const CENTER_END = CENTER_START + CENTER_DUR;
const HOLD_AFTER = 360; // brief hold on the centered mark before revealing
const TOTAL = CENTER_END + HOLD_AFTER;
const EXIT_DUR = 450;

const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 3));

// Standard easeOutBack: overshoots past 1 partway through, then settles back
// to exactly 1 at p=1 — reads as a spring landing rather than a smooth stop.
// Used only for the recenter slide (see centerProgress below), never for the
// letter collapse: that drives scaleX(1 - cp), and any p > 1 there would flip
// scaleX negative and mirror the letters.
const easeOutBack = (p: number) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

export default function LogoIntro({ onExitStart }: { onExitStart?: () => void } = {}) {
  const [t, setT] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);
  const [widths, setWidths] = useState<number[] | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  // The 2.5s budget is measured from *navigation start*, not from this
  // component mounting — JS boot happens before it exists and the visitor is
  // waiting through all of it. Naively subtracting boot time from `elapsed`
  // would start the animation mid-collapse on a slow device, so instead the
  // fixed hold at the end absorbs it, down to zero. Past that the intro
  // simply finishes as fast as it can, which is the right trade: the slower
  // the device, the less time it should spend on decoration.
  const totalRef = useRef<number>(TOTAL);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const exitingRef = useRef(false);
  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;

  const triggerExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    // This is the hand-off point Layout uses to un-pause the constellation
    // background and let it zoom into view under the exit transform below —
    // read via a ref so triggerExit doesn't need onExitStart in its own
    // deps (it's called from rAF loops and event listeners set up once).
    onExitStartRef.current?.();
    window.setTimeout(() => setDone(true), EXIT_DUR);
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);

    if (mq.matches) {
      const holdTimer = window.setTimeout(triggerExit, 400);
      return () => window.clearTimeout(holdTimer);
    }

    const measure = () => {
      const w = letterRefs.current.map((el) => (el ? el.offsetWidth : 0));
      if (w.length === LETTERS.length && w.every((x) => x > 0)) setWidths(w);
    };
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    const measureTimer = window.setTimeout(measure, 60);

    // performance.now() is already relative to navigationStart, so this value
    // *is* the boot cost that ran before the component mounted.
    const bootMs = performance.now();
    startRef.current = bootMs;
    totalRef.current = CENTER_END + Math.max(0, HOLD_AFTER - bootMs);

    const loop = (now: number) => {
      const elapsed = now - startRef.current;
      setT(elapsed);
      if (elapsed >= totalRef.current) {
        triggerExit();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(measureTimer);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const skip = () => triggerExit();
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, []);

  if (done) return null;

  const shown = Math.max(0, Math.min(LETTERS.length, Math.floor(t / PER_CHAR)));
  const w = widths || LETTERS.map(() => 88 * 0.6);
  const offsets: number[] = [0];
  for (let i = 0; i < w.length; i++) offsets.push(offsets[i] + w[i]);
  const totalWidth = offsets[LETTERS.length];
  // Rightmost letter collapses first.
  const collapseProgress = (i: number) =>
    ease((t - (COLLAPSE_START + COLLAPSE_STAGGER * (LETTERS.length - 1 - i))) / COLLAPSE_DUR);
  const centerProgress = easeOutBack((t - CENTER_START) / (CENTER_END - CENTER_START));
  // easeOutBack briefly exceeds 1 before settling — reuse that excess as a
  // small scale pop timed to land exactly when the slide does, rather than
  // animating scale on a separate unrelated curve.
  const markScale = 1 + Math.max(0, centerProgress - 1) * 0.5;

  const rowTransform = reduceMotion
    ? 'translateX(0)'
    : `translateX(${(totalWidth / 2) * centerProgress}px) scale(${markScale})`;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        opacity: exiting ? 0 : 1,
        // Zooms in on exit — reads as diving into the mesh coming up behind
        // it rather than just dissolving. Reduced-motion gets a plain fade:
        // scaling this much unconditionally would have been a much bigger,
        // more noticeable motion than the original 1.02 it replaced.
        transform: exiting && !reduceMotion ? 'scale(1.25)' : 'scale(1)',
        transition: `opacity ${EXIT_DUR}ms ease, transform ${EXIT_DUR}ms ease`,
        // Stay interactive (and opaque to hit-testing) for the whole fade —
        // flipping to pointer-events:none mid-gesture would let the same
        // click "pass through" to whatever sits underneath once the overlay
        // stops intercepting it, firing an unintended click on page content.
        // The overlay unmounts outright once the fade finishes anyway.
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', transform: rowTransform, willChange: 'transform' }}>
        <span style={{ display: 'block', width: '96px', height: '96px', flex: 'none', marginRight: '-12px' }}>
          <LogoMark size={96} />
        </span>
        {!reduceMotion && (
          <span
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '48px',
              lineHeight: 1,
              letterSpacing: '-0.07em',
              whiteSpace: 'nowrap',
              paddingBottom: '3px',
            }}
          >
            {LETTERS.map((ch, i) => {
              const cp = collapseProgress(i);
              const visible = i < shown;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    letterRefs.current[i] = el;
                  }}
                  style={{
                    display: 'inline-block',
                    color: 'var(--text)',
                    opacity: visible ? Math.max(0, 1 - cp * 1.3) : 0,
                    transform: visible
                      ? `translateX(${-offsets[i] * cp}px) scaleX(${1 - cp})`
                      : 'translateY(6px)',
                    transformOrigin: 'left center',
                    transition: 'opacity 90ms linear',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        )}
      </div>

      {!reduceMotion && (
        <div style={{ width: '200px', height: '3px', background: 'var(--border)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (t / totalRef.current) * 100)}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
      )}
    </div>
  );
}
