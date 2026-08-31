/**
 * Single source of truth for per-route <title>/description/OG image.
 * Called from both sides of the same build:
 *  - client-side, per page, so document.title stays correct on navigation
 *    (React Router doesn't reload the document, so the prerendered <title>
 *    would otherwise stick on every subsequent client-side route change)
 *  - scripts/prerender.mjs, at build time, to bake the same values into each
 *    route's static HTML file
 * One function, one place values can drift out of sync — not two.
 */
import { getProject } from '../data/projects';

export const SITE_NAME = 'Qevon';
export const SITE_URL = 'https://qevon.vercel.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface RouteMeta {
  title: string;
  description: string;
  ogImage: string;
  /** Canonical path, e.g. '/work/grandmotel-os' — used for canonical/OG url tags. */
  path: string;
}

const STATIC_META: Record<string, Omit<RouteMeta, 'path'>> = {
  '/': {
    title: 'Qevon — Software Engineering Studio',
    description:
      'Qevon designs, engineers and deploys software and the infrastructure it runs on. Founded 2026, no sales team — you talk directly to the people building it.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/work': {
    title: 'Work — Qevon',
    description:
      'Shipped projects from Qevon: operations software, security tooling, a location-based social app, and an ML phishing-detection model.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/services': {
    title: 'Services — Qevon',
    description:
      'Software engineering, web & product, cloud & DevOps, AI & ML systems, security, data & analytics, and legacy modernisation — what Qevon builds and how.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/about': {
    title: 'About — Qevon',
    description: 'Who Qevon is, founded 2026, and how the studio works.',
    ogImage: DEFAULT_OG_IMAGE,
  },
  '/contact': {
    title: 'Contact — Qevon',
    description: 'Start a project with Qevon, or get in touch directly.',
    ogImage: DEFAULT_OG_IMAGE,
  },
};

/**
 * @param pathname A router path, e.g. '/', '/work/grandmotel-os'. No query
 * string or origin.
 */
export function getRouteMeta(pathname: string): RouteMeta {
  const workMatch = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (workMatch) {
    const project = getProject(workMatch[1]);
    if (project) {
      return {
        title: `${project.title} — Case Study | ${SITE_NAME}`,
        description: project.cardDesc,
        ogImage: project.hero.src ? `${SITE_URL}${project.hero.src}` : DEFAULT_OG_IMAGE,
        path: pathname,
      };
    }
  }

  const normalized = pathname === '' ? '/' : pathname.replace(/\/$/, '') || '/';
  const meta = STATIC_META[normalized];
  if (meta) return { ...meta, path: pathname };

  // Unmatched route (404). Deliberately not indexed-looking content —
  // NotFound's own page already sets noindex via robots meta if needed.
  return {
    title: `Page not found — ${SITE_NAME}`,
    description: 'The page you were looking for doesn’t exist.',
    ogImage: DEFAULT_OG_IMAGE,
    path: pathname,
  };
}

/** Every path that should be prerendered — mirrors routes.ts's static routes plus one per project slug. */
export function getAllRoutePaths(projectSlugs: string[]): string[] {
  return ['/', '/work', '/services', '/about', '/contact', ...projectSlugs.map((slug) => `/work/${slug}`)];
}
