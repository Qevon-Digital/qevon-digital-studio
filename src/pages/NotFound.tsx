import { Link } from 'react-router';
import FadeIn from '../components/FadeIn';
import Typewriter from '../components/Typewriter';
import MagneticButton from '../components/MagneticButton';

/**
 * Catch-all for unmatched URLs. Without this route, React Router falls back
 * to its own unstyled default error screen — which on a studio site reads as
 * the site itself being broken.
 */
export default function NotFound() {
  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen flex items-center">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        <FadeIn>
          <div className="max-w-2xl">
            <Typewriter
              text="404 / NOT FOUND"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h1
              className="text-[clamp(2.8rem,7vw,6.5rem)] font-black leading-none tracking-tight mb-8"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              THIS PAGE
              <br />
              <span className="italic" style={{ color: 'transparent', WebkitTextStroke: '1px var(--text)' }}>
                DOESN'T
              </span>
              <br />
              EXIST.
            </h1>
            <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: 'var(--muted)' }}>
              The link is wrong or the page moved. The work and what we do are both still here.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Link
                  to="/work"
                  className="btn-accent inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-contrast)',
                    fontFamily: "'Inter Tight', sans-serif",
                  }}
                >
                  SEE THE WORK →
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4 transition-opacity hover:opacity-80"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: "'Inter Tight', sans-serif",
                  }}
                >
                  BACK TO HOME →
                </Link>
              </MagneticButton>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
