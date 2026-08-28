import { useParams, Link } from 'react-router';
import FadeIn from '../components/FadeIn';
import Typewriter from '../components/Typewriter';
import MagneticButton from '../components/MagneticButton';
import ProjectMedia from '../components/ProjectMedia';
import { getProject } from '../data/projects';

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const cs = slug ? getProject(slug) : undefined;

  if (!cs) {
    return (
      <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 lg:px-12">
        <h1 className="text-4xl font-black" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Project not found.</h1>
        <Link to="/work" className="text-sm mt-6 inline-block" style={{ color: 'var(--accent-text)' }}>← Back to Work</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: 'clamp(320px, 55vh, 640px)', background: 'var(--surface)' }}>
        <ProjectMedia
          image={cs.hero}
          label={cs.title}
          loading="eager"
          imgClassName="w-full h-full object-cover"
        />
        {/* The screenshots are already dark, so the old opacity-60 on the image
            plus this scrim buried them. The scrim alone is enough to hold the
            title legible, and it's weighted to the bottom where the text sits. */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.92) 100%)' }} />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-12 w-full">
            <Typewriter
              text={`${cs.num} / CASE STUDY`}
              className="text-sm font-bold tracking-[0.2em] block mb-3"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              {cs.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-16">
        {/* Meta row */}
        <FadeIn>
          <div className="flex flex-wrap items-center gap-4 pb-12" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-wrap gap-2">
              {cs.tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1" style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", borderRadius: '2px' }}>
                  {t}
                </span>
              ))}
            </div>
            <span className="text-xs ml-auto" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>{cs.year}</span>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-12 mb-16" style={{ background: 'var(--accent)' }}>
            {cs.stats.map((s) => (
              <div key={s.label} className="p-6 md:p-8" style={{ background: 'var(--bg)' }}>
                <div className="text-3xl md:text-4xl font-black mb-2" style={{ fontFamily: "'Inter Tight', sans-serif", color: 'var(--accent-text)' }}>
                  {s.value}
                </div>
                <div className="text-xs tracking-[0.15em]" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-20">
          {[
            { heading: 'THE CHALLENGE', text: cs.challenge },
            { heading: 'THE SOLUTION', text: cs.solution },
            { heading: 'THE RESULT', text: cs.result },
          ].map((block, i) => (
            <FadeIn key={block.heading} delay={i * 0.1}>
              <div>
                <span className="text-xs font-semibold tracking-[0.15em] block mb-4" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                  {block.heading}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{block.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Images */}
        {/* A lone gallery image spans the full width — in a 2-col grid it
            would sit next to an empty half, which reads as a missing image
            rather than a deliberate single one. */}
        <div className={`grid grid-cols-1 gap-4 mb-20 ${cs.images.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {cs.images.map((img, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: '2px', aspectRatio: '16/9' }}>
                <ProjectMedia image={img} label={img.alt} />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Nav */}
        <FadeIn>
          <div className="flex items-center justify-between pt-12" style={{ borderTop: '1px solid var(--border)' }}>
            <Link to="/work" className="text-sm font-semibold tracking-[0.1em] transition-opacity hover:opacity-60" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
              ← ALL WORK
            </Link>
            <MagneticButton>
              <Link to="/contact" className="btn-accent inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-6 py-3" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}>
                START A PROJECT →
              </Link>
            </MagneticButton>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
