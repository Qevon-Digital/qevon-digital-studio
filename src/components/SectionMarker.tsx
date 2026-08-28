import Typewriter from './Typewriter';

/**
 * A hairline divider sitting in the gap between two sections, with a short
 * bold orange label typed into it. Styled one step smaller than the page's
 * own eyebrow labels (text-xs vs text-sm) since it's a transition, not a
 * section heading — and deliberately carries different copy than the
 * section eyebrows around it, so it reads as connective tissue rather than
 * restating the label immediately above or below.
 */
export default function SectionMarker({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-10 md:py-14" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <Typewriter
        text={label}
        className="text-xs font-bold tracking-[0.2em] flex-shrink-0"
        style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
      />
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
