import { Link, useLocation } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import FadeIn from '../components/FadeIn';
import Typewriter from '../components/Typewriter';
import MagneticButton from '../components/MagneticButton';

const services = [
  {
    num: '01',
    title: 'SOFTWARE ENGINEERING',
    sub: 'Full-stack, systems, APIs, integrations',
    desc: 'Backend services, APIs and data pipelines built to production standards from the first commit. Error handling, logging and tests are part of the build, not a later pass.',
    capabilities: ['Backend architecture', 'REST & GraphQL APIs', 'Data engineering', 'System design', 'Performance optimization', 'Third-party integrations'],
    tech: ['Node.js', 'Go', 'Python', 'PostgreSQL', 'Redis', 'Kafka'],
  },
  {
    num: '02',
    title: 'WEB & PRODUCT',
    sub: 'Design systems, frontend, UX',
    desc: 'Product design, frontend engineering and design systems in one team, so nothing is lost in a handoff. Interfaces that are fast, accessible and actually considered.',
    capabilities: ['Product design', 'Frontend engineering', 'Design systems', 'Accessibility (WCAG)', 'Performance', 'Animation & interaction'],
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Figma', 'Framer'],
  },
  {
    num: '03',
    title: 'CLOUD, INFRASTRUCTURE & DEVOPS',
    sub: 'AWS, GCP, Kubernetes, CI/CD',
    desc: "We architect and operate cloud infrastructure at any scale — from a first AWS or GCP deployment to Kubernetes clusters and CI/CD pipelines that don't fall over under load.",
    capabilities: ['Cloud architecture', 'Kubernetes & containers', 'CI/CD pipelines', 'Infrastructure as code', 'Cost optimization', 'Disaster recovery'],
    tech: ['AWS', 'GCP', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Datadog'],
  },
  {
    num: '04',
    title: 'AI & ML SYSTEMS',
    sub: 'LLMs, pipelines, RAG, agents',
    desc: 'LLM integrations, RAG pipelines and evaluation frameworks built to survive contact with real users — measured and improved in production, not just demoed.',
    capabilities: ['LLM integration & fine-tuning', 'RAG systems', 'AI agents', 'Evaluation & monitoring', 'Embeddings & vector stores', 'MLOps pipelines'],
    tech: ['OpenAI', 'Anthropic', 'LangChain', 'Pinecone', 'Weights & Biases', 'Python'],
  },
  {
    num: '05',
    title: 'SECURITY',
    sub: 'DevSecOps, pen-testing, compliance',
    desc: 'We embed security into every layer of the stack, from threat modeling to penetration testing — practical DevSecOps and compliance work aimed at SOC 2 and ISO 27001, not a checkbox audit.',
    capabilities: ['Penetration testing', 'Threat modeling', 'DevSecOps', 'SOC 2 / ISO 27001', 'Security audits', 'Incident response'],
    tech: ['OWASP', 'AWS Security Hub', 'Snyk', 'Vault', 'Trivy', 'Burp Suite'],
  },
  {
    num: '06',
    title: 'DATA & ANALYTICS',
    sub: 'Dashboards, BI, product analytics',
    desc: 'Instrumentation, warehousing and BI tooling — dashboards people actually open, built on numbers you can trace back to their source.',
    capabilities: ['Dashboards & reporting', 'Product analytics', 'Data warehousing', 'ETL pipelines', 'Metrics & instrumentation', 'Data visualization'],
    tech: ['Postgres', 'dbt', 'Metabase', 'BigQuery', 'Pandas', 'Looker Studio'],
  },
  {
    num: '07',
    title: 'LEGACY MODERNISATION',
    sub: 'Migrations, rewrites, replatforming',
    desc: 'Software that still works but costs too much to change — old stacks, unsupported frameworks, schemas nobody wants to touch. We move it onto something current incrementally, so it keeps running while it changes, rather than betting the business on a big-bang rewrite.',
    capabilities: ['Incremental migration', 'Framework upgrades', 'Database migration', 'Monolith to services', 'Test harness retrofit', 'Zero-downtime cutover'],
    tech: ['TypeScript', 'Python', 'Node.js', 'Docker', 'Postgres', 'GitHub Actions'],
  },
];

export default function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Deep-link from Home's capability rows (`/services#service-01`): open the
  // matching item and scroll it into view.
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const match = services.find((s) => `service-${s.num}` === hash);
    if (!match) return;
    setExpanded(match.num);
    const el = itemRefs.current[match.num];
    if (el) {
      window.setTimeout(
        () => el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }),
        50,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <FadeIn>
          <div className="mb-20">
            <Typewriter
              text="CAPABILITIES"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-black leading-none tracking-tight mb-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              WHAT WE
              <br />
              DO BEST.
            </h1>
            <p className="text-base max-w-xl leading-relaxed" style={{ color: 'var(--muted)' }}>
              Engineers and designers across the full stack, from infrastructure to interface. No account managers, no handoffs — you work with the people building it.
            </p>
          </div>
        </FadeIn>

        {/* Services accordion */}
        <div className="divide-y" style={{ borderColor: 'var(--border)', borderTop: '1px solid var(--border)' }}>
          {services.map((service, i) => {
            const open = expanded === service.num;
            const buttonId = `service-${service.num}`;
            const panelId = `service-panel-${service.num}`;
            return (
              <FadeIn key={service.num} delay={i * 0.06}>
                <div ref={(el) => { itemRefs.current[service.num] = el; }}>
                  <button
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="w-full text-left py-8 flex items-start gap-6 group"
                    onClick={() => setExpanded(open ? null : service.num)}
                  >
                    <span className="text-xs font-medium mt-1 w-6 flex-shrink-0" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                      {service.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xl md:text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                            {service.title}
                          </div>
                          <div className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{service.sub}</div>
                          {/* Visible even collapsed — a first-time visitor
                              scanning the page shouldn't have to open every
                              row just to see what's actually in scope. */}
                          <div className="flex flex-wrap gap-1.5">
                            {service.tech.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-medium px-2 py-0.5"
                                style={{ color: 'var(--muted-strong)', border: '1px solid var(--border)', borderRadius: '2px' }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: open ? 45 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xl flex-shrink-0"
                          style={{ color: 'var(--accent-text)' }}
                        >
                          +
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  {/* Panel lives as a SIBLING of the button, not inside it — a
                      <button>'s content model is phrasing content only, so a
                      flow-content panel (divs/lists) nested inside it sat in
                      an anonymous layout box that framer-motion's
                      height:'auto' measurement couldn't read reliably. This
                      also fixes the a11y shape (aria-expanded/aria-controls
                      above, role="region" here) and stops clicks inside the
                      open panel from re-toggling it. */}
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={false}
                    animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pl-12 pt-2 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <p className="text-sm leading-relaxed md:col-span-1" style={{ color: 'var(--muted)' }}>
                        {service.desc}
                      </p>
                      <div>
                        <div className="text-xs font-bold tracking-[0.15em] mb-3" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                          CAPABILITIES
                        </div>
                        <ul className="space-y-1.5">
                          {service.capabilities.map((c) => (
                            <li key={c} className="text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-bold tracking-[0.15em] mb-3" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                          TECHNOLOGIES
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {service.tech.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-semibold px-3 py-1"
                              style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif", borderRadius: '2px' }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Process section */}
        <div className="mt-24 md:mt-32">
          <FadeIn>
            <Typewriter
              text="HOW WE WORK"
              className="text-sm font-bold tracking-[0.2em] block mb-4"
              style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
            />
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-16" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              OUR PROCESS.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
            {[
              { step: '01', label: 'DISCOVERY', text: 'We map the problem, the users and the existing system before writing code.' },
              { step: '02', label: 'ARCHITECTURE', text: 'We choose the stack, design the architecture and agree the milestones.' },
              { step: '03', label: 'BUILD', text: 'Weekly releases. You see working software as it is built, not at the end.' },
              { step: '04', label: 'SHIP', text: 'QA, performance testing, deployment, monitoring and handover documentation.' },
            ].map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="p-8" style={{ background: 'var(--bg)' }}>
                  <div className="text-3xl font-black mb-4" style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}>
                    {step.step}
                  </div>
                  <div className="text-sm font-bold tracking-[0.12em] mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                    {step.label}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{step.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* CTA */}
        <FadeIn delay={0.1}>
          <div className="mt-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-16" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                READY TO TALK SCOPE?
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>We'll be direct about what's achievable, what it costs, and how long it takes.</p>
            </div>
            <MagneticButton>
              <Link to="/contact" className="btn-accent inline-flex items-center gap-3 flex-shrink-0 text-sm font-semibold tracking-[0.1em] px-8 py-4" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}>
                START A PROJECT →
              </Link>
            </MagneticButton>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
