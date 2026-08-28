import { Link } from 'react-router';
import FadeIn from '../components/FadeIn';
import Typewriter from '../components/Typewriter';
import SectionMarker from '../components/SectionMarker';
import MagneticButton from '../components/MagneticButton';

const values = [
  { label: 'CRAFT OVER SPEED', desc: "We write code we're proud to look at in three years. Not because it's slow — because shortcuts compound." },
  { label: 'DIRECT COMMUNICATION', desc: "We tell you when something is wrong, when timelines will slip, when a decision is a mistake. Always." },
  { label: 'DEPTH OF OWNERSHIP', desc: "We behave like co-founders, not contractors. Your problem is our problem until it's solved properly." },
  { label: 'NO GENERALIST THEATER', desc: "We are specialists. Every engagement is led by engineers who've done this exact type of work before." },
];

export default function About() {
  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Hero text */}
        <FadeIn>
          <div className="mb-24">
            <Typewriter
              text="ABOUT QEVON"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-black leading-none tracking-tight mb-8" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              WE'RE AN
              <br />
              <span className="italic" style={{ color: 'transparent', WebkitTextStroke: '1px var(--text)' }}>
                ENGINEERING
              </span>
              <br />
              STUDIO.
            </h1>
            <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
              <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
                Founded in 2026 by engineers who'd already spent years shipping products together — a readiness scanner, an inventory platform, a social app, an ML classifier — and wanted to do it under one name.
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
                A team of four — engineers, infrastructure architects and designers. Small on purpose: you work with the people who write the code.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-24" style={{ background: 'var(--accent)' }}>
            {[
              { val: '2 WKS', label: 'TO FIRST BUILD' },
              { val: '10+', label: 'PRODUCTS SHIPPED' },
              { val: '4', label: 'TEAM MEMBERS & GROWING' },
              { val: '100%', label: 'CLIENTS RETAINED' },
            ].map((s) => (
              <div key={s.label} className="p-8" style={{ background: 'var(--bg)' }}>
                <div className="text-3xl md:text-4xl font-black mb-2" style={{ fontFamily: "'Inter Tight', sans-serif", color: 'var(--accent-text)' }}>{s.val}</div>
                <div className="text-xs tracking-[0.12em]" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <SectionMarker label="BEYOND THE NUMBERS" />

        {/* Values */}
        <div className="mb-24">
          <FadeIn>
            <Typewriter
              text="HOW WE OPERATE"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-12" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              VALUES.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
            {values.map((v, i) => (
              <FadeIn key={v.label} delay={i * 0.07}>
                <div className="p-8 md:p-10" style={{ background: 'var(--bg)' }}>
                  <div className="text-sm font-bold tracking-[0.12em] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                    {v.label}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* CTA */}
        <FadeIn>
          <div className="pt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              WANT TO BUILD
              <br />
              SOMETHING TOGETHER?
            </h3>
            <MagneticButton>
              <Link to="/contact" className="btn-accent inline-flex items-center gap-3 flex-shrink-0 text-sm font-semibold tracking-[0.1em] px-8 py-4" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}>
                GET IN TOUCH →
              </Link>
            </MagneticButton>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
