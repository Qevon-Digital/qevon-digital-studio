/**
 * The Qevon mark: a circle cut by a diagonal line (viewBox 0 0 100 100).
 * This is the single source of truth for the shape — LogoIntro imports it
 * rather than keeping its own copy, so "the logo anywhere" and "the loading
 * Qevon" are guaranteed to be the same SVG, not just visually similar ones.
 */
export function LogoMark({ size = 32, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="butt"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="34" />
      <line x1="60" y1="60" x2="84" y2="84" />
    </svg>
  );
}

/**
 * Mark + "evon" lockup, proportioned to match the intro's final resting
 * frame (see LogoIntro.tsx): the wordmark's font-size is half the mark's
 * box, and the mark overlaps the text by 1/8 of its own width. `size` scales
 * both together, so every call site (navbar, footer, anywhere else) stays in
 * the same proportion as the intro rather than needing hand-tuned numbers.
 */
export default function Logo({ size = 32, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end' }} aria-hidden="true">
      <span style={{ display: 'block', width: size, height: size, flex: 'none', marginRight: -size * 0.125 }}>
        <LogoMark size={size} color={color} />
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: size * 0.5,
          lineHeight: 1,
          letterSpacing: '-0.07em',
          color: 'var(--text)',
          paddingBottom: size * 0.03,
        }}
      >
        evon
      </span>
    </span>
  );
}
