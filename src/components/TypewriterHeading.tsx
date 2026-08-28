import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/**
 * One run of text within a heading, optionally carrying its own style/className
 * (e.g. the outlined italic "DIGITAL" or the orange "MEAN BUSINESS." on Home's
 * hero). `br` inserts a real line break between segments.
 */
export type HeadingSegment =
  | { text: string; className?: string; style?: CSSProperties }
  | { br: true };

/**
 * Reveals a multi-line, mixed-style headline character by character — fast
 * enough to read as motion, not as waiting (~10ms/char; a 40-char headline
 * finishes in ~400ms).
 *
 * Unlike `Typewriter` (used for the small eyebrow labels), this never grows
 * the box as it types: every character's real span is in the DOM at full
 * size from first paint, just `visibility: hidden`, and the reveal only
 * flips visibility on already-laid-out characters. Layout is therefore final
 * before a single character is visible — no reflow, no CLS — which is what
 * makes it safe to use on headings instead of the reserved-width-span trick.
 *
 * No caret: at this speed a caret never resolves as a distinct element.
 */
export default function TypewriterHeading({
  segments,
  as: Tag = 'span',
  className = '',
  style,
  speedMs = 10,
  startDelayMs = 0,
  startOnMount = false,
}: {
  segments: HeadingSegment[];
  as?: 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
  style?: CSSProperties;
  speedMs?: number;
  startDelayMs?: number;
  /** Reveal immediately on mount instead of waiting to scroll into view — for above-the-fold headlines. */
  startOnMount?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inViewResult = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: '-40px' });
  const inView = startOnMount || inViewResult;
  const reduceMotion = useReducedMotion();

  const totalChars = segments.reduce((n, seg) => n + ('text' in seg ? seg.text.length : 0), 0);
  const [revealCount, setRevealCount] = useState(reduceMotion ? totalChars : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    let timeoutId: number;
    const startTimer = window.setTimeout(() => {
      let i = 0;
      const tick = () => {
        i++;
        setRevealCount(i);
        if (i < totalChars) timeoutId = window.setTimeout(tick, speedMs);
      };
      tick();
    }, startDelayMs);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, totalChars, speedMs, startDelayMs]);

  if (reduceMotion) {
    const content: ReactNode[] = segments.map((seg, i) =>
      'br' in seg ? <br key={i} /> : (
        <span key={i} className={seg.className} style={seg.style}>{seg.text}</span>
      )
    );
    return (
      <Tag ref={ref as React.Ref<never>} className={className} style={style}>
        {content}
      </Tag>
    );
  }

  let seen = 0;
  const content: ReactNode[] = segments.map((seg, i) => {
    if ('br' in seg) return <br key={i} />;
    const start = seen;
    seen += seg.text.length;
    return (
      <span key={i} className={seg.className} style={seg.style}>
        {seg.text.split('').map((ch, j) => (
          <span key={j} style={{ visibility: start + j < revealCount ? 'visible' : 'hidden' }}>
            {ch}
          </span>
        ))}
      </span>
    );
  });

  return (
    <Tag ref={ref as React.Ref<never>} className={className} style={style}>
      {content}
    </Tag>
  );
}
