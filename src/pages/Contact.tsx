import { motion } from 'framer-motion';
import { useState } from 'react';
import FadeIn from '../components/FadeIn';
import MagneticButton from '../components/MagneticButton';
import Typewriter from '../components/Typewriter';

const budgets = ['$250 – $1K', '$1K – $3K', '$3K – $10K', '$10K+'];
const services = ['Software Engineering', 'Web & Product', 'Cloud & Infrastructure', 'AI / ML Systems', 'Security', 'Full Studio Partnership'];

export default function Contact() {
  const [form, setForm] = useState({
    name: '', company: '', email: '', budget: '', services: [] as string[], message: '',
  });
  const [sent, setSent] = useState(false);

  const toggle = (s: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  };

  // ⚠️ TODO — THIS FORM DOES NOT SEND ANYTHING.
  // It shows the success state and discards the submission. Every enquiry
  // made through it is currently lost. Wire it to a form service (Web3Forms,
  // Formspree) or an API route BEFORE relying on it for real leads. Until
  // then hello@qevon.com, shown alongside, is the only working route in.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: '2px',
    fontFamily: 'Manrope, sans-serif',
    fontSize: '14px',
  };

  const labelStyle = {
    fontFamily: "'Inter Tight', sans-serif",
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: 'var(--muted)',
  };

  if (sent) {
    return (
      <div className="pt-24 md:pt-32 pb-24 min-h-screen flex items-center">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-xl">
              <div className="w-10 h-10 mb-8 flex items-center justify-center" style={{ border: '1px solid var(--accent)', borderRadius: '2px' }}>
                <span style={{ color: 'var(--accent-text)', fontSize: '18px' }}>✓</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                MESSAGE
                <br />
                RECEIVED.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
                We'll reply within 24 hours with thoughts on scope, timeline and fit.
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                In the meantime, reach us directly at{' '}
                <a href="mailto:hello@qevon.com" style={{ color: 'var(--accent-text)' }}>hello@qevon.com</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Left: info */}
          <div>
            <FadeIn>
              <Typewriter
                text="LET'S TALK"
                className="text-sm font-bold tracking-[0.2em] block mb-4"
                style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
              />
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-none tracking-tight mb-8" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                START A
                <br />
                PROJECT.
              </h1>
              <p className="text-base leading-relaxed mb-12" style={{ color: 'var(--muted)', maxWidth: '420px' }}>
                Tell us what you're building. We'll reply within 24 hours — honestly, on whether we're a fit and what it would take.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="space-y-8">
                <div>
                  <div className="text-xs font-semibold tracking-[0.15em] mb-2" style={labelStyle}>EMAIL</div>
                  <a href="mailto:hello@qevon.com" className="text-base transition-colors hover:[color:var(--text)]" style={{ color: 'var(--muted)' }}>
                    hello@qevon.com
                  </a>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.15em] mb-2" style={labelStyle}>RESPONSE TIME</div>
                  <span className="text-base" style={{ color: 'var(--muted)' }}>Within 24 hours, always.</span>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.15em] mb-2" style={labelStyle}>BASED IN</div>
                  <span className="text-base" style={{ color: 'var(--muted)' }}>Lahore, PK. Remote-first.</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: form */}
          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block mb-2" style={labelStyle}>YOUR NAME *</label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Marcus Chen"
                    className="w-full px-4 py-3 focus:outline-none focus:[border-color:var(--accent-text)] focus:[box-shadow:0_0_0_3px_rgba(255,90,31,0.25)] transition-colors"
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="contact-company" className="block mb-2" style={labelStyle}>COMPANY</label>
                  <input
                    id="contact-company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 focus:outline-none focus:[border-color:var(--accent-text)] focus:[box-shadow:0_0_0_3px_rgba(255,90,31,0.25)] transition-colors"
                    style={inputStyle}
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="block mb-2" style={labelStyle}>EMAIL *</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 focus:outline-none focus:[border-color:var(--accent-text)] focus:[box-shadow:0_0_0_3px_rgba(255,90,31,0.25)] transition-colors"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Services — a fieldset/legend is the correct native grouping
                  for a set of toggle buttons, unlike a bare <label> which
                  has nothing to associate with here. */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="block mb-3 p-0" style={labelStyle}>WHAT DO YOU NEED?</legend>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => {
                    const active = form.services.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(s)}
                        className="text-xs px-3 py-2 transition-all duration-150"
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          letterSpacing: '0.08em',
                          border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: active ? 'rgba(255,90,31,0.08)' : 'transparent',
                          color: active ? 'var(--accent-text)' : 'var(--muted)',
                          borderRadius: '2px',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Budget */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="block mb-3 p-0" style={labelStyle}>ESTIMATED BUDGET</legend>
                <div className="flex flex-wrap gap-2">
                  {budgets.map((b) => {
                    const active = form.budget === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setForm({ ...form, budget: b })}
                        className="text-xs px-4 py-2 transition-all duration-150"
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          letterSpacing: '0.08em',
                          border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: active ? 'rgba(255,90,31,0.08)' : 'transparent',
                          color: active ? 'var(--accent-text)' : 'var(--muted)',
                          borderRadius: '2px',
                        }}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block mb-2" style={labelStyle}>TELL US ABOUT YOUR PROJECT *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="What are you building? What's the current state? What does success look like?"
                  className="w-full px-4 py-3 resize-none transition-colors focus:outline-none focus:[border-color:var(--accent-text)] focus:[box-shadow:0_0_0_3px_rgba(255,90,31,0.25)]"
                  style={inputStyle}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <MagneticButton strength={0.15} className="block">
                <button
                  type="submit"
                  className="btn-accent w-full py-4 text-sm font-semibold tracking-[0.12em]"
                  style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}
                >
                  SEND MESSAGE →
                </button>
              </MagneticButton>

              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
                No sales team. No automated follow-ups. Just the people who'll build with you.
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
