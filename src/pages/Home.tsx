import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import FadeIn from '../components/FadeIn';
import MagneticButton from '../components/MagneticButton';
import Typewriter from '../components/Typewriter';
import SectionMarker from '../components/SectionMarker';
import TypewriterHeading from '../components/TypewriterHeading';
import ProjectMedia from '../components/ProjectMedia';
import { projects, type Project } from '../data/projects';

const services = [
  { num: '01', label: 'SOFTWARE ENGINEERING', sub: 'Full-stack, systems, APIs' },
  { num: '02', label: 'WEB & PRODUCT', sub: 'Design, frontend, UX' },
  { num: '03', label: 'CLOUD, INFRASTRUCTURE & DEVOPS', sub: 'AWS, GCP, Kubernetes, CI/CD' },
  { num: '04', label: 'AI & ML SYSTEMS', sub: 'LLMs, pipelines, RAG' },
  { num: '05', label: 'SECURITY', sub: 'DevSecOps, pen-testing, compliance' },
  { num: '06', label: 'DATA & ANALYTICS', sub: 'Dashboards, BI, product analytics' },
  { num: '07', label: 'LEGACY MODERNISATION', sub: 'Migrations, rewrites, replatforming' },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <FadeIn delay={index * 0.1}>
      <Link to={`/work/${project.slug}`} className="block group">
        <div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative overflow-hidden"
          style={{ border: '1px solid var(--border)', borderRadius: '2px' }}
        >
          {/* Image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <ProjectMedia image={project.hero} label={project.title} hovered={hovered} />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.7) 100%)',
              }}
            />
            {/* Hover orange line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'var(--accent)' }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: hovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Card meta */}
          <div className="p-6 md:p-8" style={{ background: 'var(--bg)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className="text-xs font-medium tracking-[0.15em] block mb-1"
                  style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {project.num}
                </span>
                <h3
                  className="text-xl md:text-2xl font-bold tracking-tight"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {project.title}
                </h3>
              </div>
              <motion.div
                animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.4 }}
                transition={{ duration: 0.25 }}
                className="text-2xl mt-1"
                style={{ color: 'var(--accent-text)' }}
              >
                →
              </motion.div>
            </div>
            <p className="text-xs tracking-[0.1em] mb-3" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
              {project.tags.join(' / ')}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {project.cardDesc}
            </p>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div>
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ paddingTop: '96px' }}
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-20"
        >
          {/* Label */}
          <FadeIn>
            <div
              className="inline-flex items-center gap-3 mb-10"
              style={{ border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '2px' }}
            >
              {/* The dot pulses so this reads as a live status indicator
                  rather than a label — see .status-dot in index.css. */}
              <span className="status-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-xs font-medium tracking-[0.15em]" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
                AVAILABLE FOR NEW PROJECTS
              </span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.08}>
            <TypewriterHeading
              as="h1"
              startOnMount
              className="text-[clamp(2.6rem,8vw,7rem)] font-black leading-[0.92] tracking-[-0.03em] mb-8 max-w-5xl block"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
              segments={[
                { text: 'WE BUILD ' },
                { text: 'DIGITAL', className: 'italic font-black', style: { color: 'transparent', WebkitTextStroke: '1px var(--text)' } },
                { br: true },
                { text: 'PRODUCTS THAT' },
                { br: true },
                { text: 'MEAN BUSINESS.', style: { color: 'var(--accent-text)' } },
              ]}
            />
          </FadeIn>

          <FadeIn delay={0.16}>
            <p
              className="text-base md:text-lg leading-relaxed max-w-lg mb-12"
              style={{ color: 'var(--muted)', fontFamily: 'Manrope, sans-serif' }}
            >
              We design, engineer and deploy software and the infrastructure it runs on. You work directly with the people who build it.
            </p>
          </FadeIn>

          <FadeIn delay={0.22}>
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton>
                <Link
                  to="/contact"
                  className="btn-accent inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4"
                  style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}
                >
                  START A PROJECT →
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  to="/work"
                  className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4 transition-all duration-200 hover:opacity-80"
                  style={{ border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Inter Tight', sans-serif" }}
                >
                  VIEW OUR WORK →
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>

          {/* Scroll cue */}
          <FadeIn delay={0.35}>
            <div className="flex items-center gap-3 mt-20">
              <div className="w-8 h-px" style={{ background: 'var(--accent)' }} />
              <span className="text-xs tracking-[0.15em]" style={{ color: 'var(--muted-strong)', fontFamily: "'Inter Tight', sans-serif" }}>
                SCROLL TO EXPLORE
              </span>
            </div>
          </FadeIn>
        </motion.div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <SectionMarker label="PROOF, NOT PROMISES" />
      </div>

      {/* SELECTED WORK */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 md:pb-32">
        <FadeIn>
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <div>
              <Typewriter
                text="SELECTED WORK"
                className="text-sm font-bold tracking-[0.2em] block mb-3"
                style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
              />
              <TypewriterHeading
                as="h2"
                className="text-5xl md:text-6xl font-black tracking-tight leading-none block"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
                segments={[{ text: "WHAT WE'VE" }, { br: true }, { text: 'SHIPPED.' }]}
              />
            </div>
            <Link
              to="/work"
              className="text-sm font-semibold tracking-[0.1em] transition-opacity hover:opacity-60"
              style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}
            >
              PROJECT DETAILS →
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <SectionMarker label="WHAT WE DO" />
      </div>

      {/* SERVICES */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 md:pb-32">
          <FadeIn>
            <div className="mb-16">
              <Typewriter
                text="CAPABILITIES"
                className="text-sm font-bold tracking-[0.2em] block mb-3"
                style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
              />
              <TypewriterHeading
                as="h2"
                className="text-5xl md:text-6xl font-black tracking-tight block"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
                segments={[{ text: 'FROM IDEA' }, { br: true }, { text: 'TO PRODUCTION.' }]}
              />
            </div>
          </FadeIn>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {services.map((service, i) => (
              <FadeIn key={service.label} delay={i * 0.07}>
                <Link
                  to={`/services#service-${service.num}`}
                  className="flex items-center justify-between py-5 group"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-medium w-6" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                      {service.num}
                    </span>
                    <div>
                      <div
                        className="text-base md:text-xl font-bold tracking-tight transition-colors group-hover:[color:var(--text)]"
                        style={{ fontFamily: "'Inter Tight', sans-serif", color: 'var(--text)' }}
                      >
                        {service.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {service.sub}
                      </div>
                    </div>
                  </div>
                  <motion.span
                    className="text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    →
                  </motion.span>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-12">
              <Link
                to="/services"
                className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] transition-opacity hover:opacity-60"
                style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}
              >
                EXPLORE ALL SERVICES →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <SectionMarker label="THE STANDARD" />
      </div>

      {/* STATEMENT */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 md:pb-40">
        <FadeIn>
          <div className="max-w-4xl">
            <h2
              className="text-[clamp(2rem,5vw,4.5rem)] font-black leading-[1.0] tracking-tight mb-8"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              WE DON'T JUST
              <br />
              <span
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px var(--text)',
                }}
                className="italic"
              >
                SHIP SOFTWARE.
              </span>
              <br />
              WE GRADE IT.
            </h2>
            <p
              className="text-base md:text-xl leading-relaxed max-w-xl"
              style={{ color: 'var(--muted)', fontFamily: 'Manrope, sans-serif' }}
            >
              SentinelOps is our own production-readiness scanner. It runs 29 checks across six categories and scores any repository out of 100. We point it at itself, publish the result — currently 93 — and list the two things it still fails on. That's the standard we hold your code to.
            </p>
            {/* The claim above is only worth making if it's checkable. */}
            <Link
              to="/work/sentinelops"
              className="inline-flex items-center gap-3 mt-8 text-sm font-semibold tracking-[0.1em] transition-opacity hover:opacity-60"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            >
              SEE SENTINELOPS →
            </Link>
          </div>
        </FadeIn>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <SectionMarker label="LET'S TALK" />
      </div>

      {/* FINAL CTA */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 md:pb-32">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
              <div>
                <Typewriter
                  text="READY TO BUILD?"
                  className="text-sm font-bold tracking-[0.2em] block mb-4"
                  style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
                />
                <TypewriterHeading
                  as="h2"
                  className="text-[clamp(2.4rem,6vw,5.5rem)] font-black leading-[0.9] tracking-tight block"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  segments={[{ text: 'GOT SOMETHING' }, { br: true }, { text: 'WORTH BUILDING?' }]}
                />
              </div>
              <div className="flex-shrink-0">
                <MagneticButton strength={0.25}>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-4 text-xl md:text-2xl font-black tracking-tight transition-all duration-300 hover:opacity-80"
                    style={{ fontFamily: "'Inter Tight', sans-serif", color: 'var(--accent-text)' }}
                  >
                    <span>LET'S BUILD</span>
                    <motion.span
                      animate={{ x: 0 }}
                      whileHover={{ x: 6 }}
                      className="text-3xl"
                    >
                      →
                    </motion.span>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
