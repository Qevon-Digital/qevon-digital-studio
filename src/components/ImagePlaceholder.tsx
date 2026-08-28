/**
 * Stands in for a real screenshot that hasn't been supplied yet. A stock
 * photo captioned as a real product is worse than no image — it reads as a
 * screenshot and isn't one — so every project image slot renders this
 * instead until a real screenshot replaces it (see src/data/projects.ts).
 *
 * Deliberately has no aspect-ratio/height of its own: it fills whatever box
 * the caller already sizes (16/9 gallery cards, the hero's clamp() height),
 * so dropping in a real <img> later at the same box is a zero-layout-shift
 * swap.
 */
export default function ImagePlaceholder({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <span
        className="text-sm font-bold tracking-[0.1em] text-center px-4"
        style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="text-xs tracking-[0.15em]"
        style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}
      >
        SCREENSHOT PENDING
      </span>
    </div>
  );
}
