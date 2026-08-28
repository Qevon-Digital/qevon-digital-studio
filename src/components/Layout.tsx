import { Outlet, Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
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
  { label: 'GitHub', url: '' },
  { label: 'LinkedIn', url: '' },
  { label: 'Twitter / X', url: '' },
].filter((link) => link.url);

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
                  className="nav-link text-[15px] lg:text-base"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  qevondigital@outlook.com
                </a>
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-link text-[15px] lg:text-base"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
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
