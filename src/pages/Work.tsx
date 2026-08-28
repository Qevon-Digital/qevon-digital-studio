import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import FadeIn from '../components/FadeIn';
import Typewriter from '../components/Typewriter';
import ProjectMedia from '../components/ProjectMedia';
import { projects, projectFilters } from '../data/projects';

export default function Work() {
  const [active, setActive] = useState('ALL');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = active === 'ALL'
    ? projects
    : projects.filter((p) => p.tags.includes(active));

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <FadeIn>
          <div className="mb-16 md:mb-20">
            <Typewriter
              text="OUR WORK"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h1
              className="text-[clamp(3rem,8vw,7rem)] font-black leading-none tracking-tight mb-6"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              SELECTED
              <br />
              PROJECTS.
            </h1>
            <p className="text-base max-w-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
              Four projects — what they do, how they were built, what shipped. The earlier work predates the studio; same people, same standard.
            </p>
          </div>
        </FadeIn>

        {/* Filters — derived from projectFilters (src/data/projects.ts), which
            only ever includes tags at least one project has, so no chip can
            filter down to an empty grid. */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-14" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
            {projectFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="text-xs font-semibold tracking-[0.12em] px-4 py-2 transition-all duration-200"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  background: active === f ? 'var(--accent)' : 'transparent',
                  color: active === f ? 'var(--accent-contrast)' : 'var(--muted)',
                  border: active === f ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '2px',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project, i) => (
            <FadeIn key={project.slug} delay={i * 0.07}>
              <Link
                to={`/work/${project.slug}`}
                className="block group"
                onMouseEnter={() => setHovered(project.slug)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ border: '1px solid var(--border)', borderRadius: '2px' }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <ProjectMedia
                      image={project.hero}
                      label={project.title}
                      hovered={hovered === project.slug}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.6) 100%)' }} />
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-px"
                      style={{ background: 'var(--accent)' }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: hovered === project.slug ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Year badge — sits on a fixed dark scrim over the image/placeholder
                        regardless of site theme, so its own colors are fixed too rather
                        than themed (var(--muted) would go dark-on-dark in light mode). */}
                    <div
                      className="absolute top-4 right-4 text-xs font-medium px-2 py-1"
                      style={{ background: 'rgba(10,10,10,0.7)', color: 'rgba(245,243,238,0.85)', fontFamily: "'Inter Tight', sans-serif", border: '1px solid rgba(245,243,238,0.15)' }}
                    >
                      {project.year}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-medium tracking-[0.15em] mr-3" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                          {project.num}
                        </span>
                        <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                          {project.title}
                        </span>
                      </div>
                      <motion.span
                        animate={{ x: hovered === project.slug ? 4 : 0 }}
                        style={{ color: 'var(--accent-text)' }}
                      >
                        →
                      </motion.span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5"
                          style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif", borderRadius: '2px' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{project.cardDesc}</p>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
