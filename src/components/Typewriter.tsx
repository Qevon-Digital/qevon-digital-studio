import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Types `text` character by character the first time it scrolls into view,
 * with a blinking caret. Used for the small orange eyebrow labels only —
 * never headlines, which would reflow as they typed.
 *
 * The full string is always rendered (in a `visibility: hidden` span) to
 * reserve its exact box up front; the animated text sits absolutely
 * positioned over it. That's what guarantees zero layout shift regardless
 * of how far through typing the label currently is.
 */
export default function Typewriter({
  text,
  className = '',
  style,
  speedMs = 26,
  startDelayMs = 0,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  speedMs?: number;
  startDelayMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    let timeoutId: number;
    const startTimer = window.setTimeout(() => {
      let i = 0;
      const tick = () => {
        i++;
        setCount(i);
        if (i < text.length) timeoutId = window.setTimeout(tick, speedMs);
        else setDone(true);
      };
      tick();
    }, startDelayMs);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(timeoutId);
    };
  }, [inView, reduceMotion, text, speedMs, startDelayMs]);

  if (reduceMotion) {
    return (
      <span ref={ref} className={className} style={style}>
        {text}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ visibility: 'hidden' }}>{text}</span>
      <span style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap' }}>
        {text.slice(0, count)}
        {inView && (
          <motion.span
            aria-hidden="true"
            animate={{ opacity: done ? 0 : [1, 1, 0, 0] }}
            transition={done ? { duration: 0.3 } : { duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            style={{ marginLeft: 1 }}
          >
            |
          </motion.span>
        )}
      </span>
    </span>
  );
}
