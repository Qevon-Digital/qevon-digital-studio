import { Outlet, Link, useLocation } from 'react-router';
import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import CursorGlow from './CursorGlow';
import MagneticButton from './MagneticButton';
import LogoIntro from './LogoIntro';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import ConstellationGrid from './ConstellationGrid';

const navLinks = [
  { label: 'WORK', href: '/work' },
  { label: 'SERVICES', href: '/services' },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
];

/**
 * Footer social links. Add a URL to switch one on — entries with an empty
 * `url` are filtered out and never render.
 *
 * These were previously hardcoded `href="#"` anchors, which reload the page
 * when clicked. A dead link in the footer reads as an unfinished site, so the
 * rule here is: no URL, no link. qevondigital@outlook.com is rendered separately and
 * always shows.
 */
const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/Qevon-Digital' },
  { label: 'Instagram', url: 'https://www.instagram.com/qevondigital/' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/qoven' },
  { label: 'Twitter / X', url: '' },
].filter((link) => link.url);

/**
 * Monochrome brand glyphs for the CONNECT column. All use `fill`/`stroke`
 * `currentColor` so they inherit the link's colour and pick up the same
 * orange hover as the text via `.nav-link`. 15px optical size to sit level
 * with the 15px label.
 */
const connectIcon: Record<string, ReactNode> = {
  email: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  ),
  GitHub: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  ),
  Instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-10.85a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z" />
    </svg>
  ),
  LinkedIn: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  'Twitter / X': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3L17.61 20.65Z" />
    </svg>
  ),
};

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Keeps the constellation's render loop off entirely while the intro
  // covers the screen (see ConstellationGrid's `paused` prop) rather than
  // just hiding it — that's otherwise the exact moment the browser is
  // busiest with parsing/hydration. Flips once, when the intro starts its
  // exit, and stays true for the rest of this mount.
  const [introExiting, setIntroExiting] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    // No opaque background here — ConstellationGrid paints the site's
    // background (fixed, z-index: -1) and shows through everywhere a
    // section doesn't set its own solid background. index.css still sets
    // --bg on html/body as a pre-JS fallback.
    <div className="min-h-screen" style={{ color: 'var(--text)' }}>
      <ConstellationGrid paused={!introExiting} />
      <LogoIntro onExitStart={() => setIntroExiting(true)} />
      <CursorGlow />

      {/* Route-change sweep: a thin orange bar crosses the top of the
          viewport on navigation. Keyed on pathname so it fires once per
          route change; transform/opacity only, and skipped entirely under
          reduced motion since it's decorative, not load feedback. */}
      {!reduceMotion && (
        <motion.div
          key={location.pathname}
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ scaleX: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.4, delay: 0.05 } }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--accent)',
            transformOrigin: 'left',
            zIndex: 70,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgb(var(--bg-rgb) / 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" aria-label="Qevon — home" className="transition-opacity hover:opacity-70">
            <Logo size={34} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link text-[13px] font-medium tracking-[0.15em] ${location.pathname === link.href ? 'active' : ''}`}
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <MagneticButton strength={0.4}>
              <Link
                to="/contact"
                className="btn-accent inline-block text-xs font-semibold tracking-[0.12em] px-5 py-2.5"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                START A PROJECT →
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile hamburger + theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className="block w-6 h-px transition-all duration-300"
                style={{
                  background: 'var(--text)',
                  transform: menuOpen ? 'rotate(45deg) translateY(4px)' : 'none',
                }}
              />
              <span
                className="block w-6 h-px transition-all duration-300"
                style={{
                  background: 'var(--text)',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-6 h-px transition-all duration-300"
                style={{
                  background: 'var(--text)',
                  transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : 'none',
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-2xl font-light tracking-[0.1em]"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      color: location.pathname === link.href ? 'var(--accent-text)' : 'var(--text)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <MagneticButton strength={0.15} className="w-full mt-2">
                  <Link
                    to="/contact"
                    className="btn-accent block text-sm font-semibold tracking-[0.1em] px-5 py-3 text-center w-full"
                    style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    START A PROJECT →
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)' }} className="mt-0">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 lg:gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size={44} />
              </div>
              <p className="text-sm lg:text-base leading-relaxed max-w-sm" style={{ color: 'var(--muted)' }}>
                Software engineering studio. We design, engineer and deploy software and the infrastructure it runs on.
              </p>
            </div>
            <div>
              <div
                className="text-[15px] lg:text-base font-bold tracking-[0.15em] mb-5"
                style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
              >
                NAVIGATION
              </div>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="nav-link text-[15px] lg:text-base"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div
                className="text-[15px] lg:text-base font-bold tracking-[0.15em] mb-5"
                style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
              >
                CONNECT
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:qevondigital@outlook.com"
                  className="nav-link text-[15px] lg:text-base inline-flex items-center gap-2.5"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  <span className="flex-none">{connectIcon.email}</span>
                  qevondigital@outlook.com
                </a>
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-link text-[15px] lg:text-base inline-flex items-center gap-2.5"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    <span className="flex-none">{connectIcon[link.label]}</span>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
              © 2026 Qevon Studio Ltd. All rights reserved.
            </span>
            <span className="text-xs" style={{ color: 'var(--muted)', fontFamily: "'Inter Tight', sans-serif" }}>
              Built with precision.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
