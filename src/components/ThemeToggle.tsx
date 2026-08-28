import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'qevon-theme';

/**
 * Fired on `window` after the theme changes. ConstellationGrid listens for it
 * to re-read the palette — Canvas2D can't read CSS custom properties, so the
 * mesh has to be told explicitly rather than inheriting the change.
 *
 * The storage key is duplicated in the no-flash bootstrap script in
 * .figma/make/site.json; that script runs before any JS module loads, so it
 * can't import this constant. Change one, change the other.
 */
export const THEME_CHANGE_EVENT = 'qevon:themechange';

type Theme = 'dark' | 'light';

function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can throw in private-browsing/locked-down contexts — theme
    // still applies for this session, it just won't persist across reloads.
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }));
}

/**
 * Sun/moon toggle. Dark is the site's default: the no-flash bootstrap script
 * (see .figma/make/site.json's customScripts.headEnd) only stamps
 * `data-theme="light"` when that was explicitly chosen and stored, so an
 * unset visitor always lands in dark regardless of their OS preference.
 * This component reads whatever the bootstrap decided, so there's no
 * mismatch on mount.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getCurrentTheme());
    // Two toggles are mounted at once (desktop nav + mobile menu). Without
    // this, clicking one updates the DOM/localStorage but the other's own
    // React state never learns about it, so it keeps showing the old icon
    // until it happens to remount.
    const onThemeChange = () => setTheme(getCurrentTheme());
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const toggle = () => {
    const next: Theme = getCurrentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'light'}
      className={`theme-toggle inline-flex items-center justify-center ${className}`}
      style={{ width: 40, height: 40 }}
    >
      {theme === 'light' ? (
        // Moon
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      ) : (
        // Sun
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}

