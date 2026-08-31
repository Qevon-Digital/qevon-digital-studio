/**
 * Static prerendering. Run after both the client build and the SSR build
 * (`vite build --ssr src/entry-server.tsx --outDir dist/server`), as part of
 * `npm run build` — see package.json.
 *
 * Why this exists instead of a Next.js rewrite: the site has 5 static routes
 * plus 4 data-driven case-study routes, no data fetching, no auth. This is
 * the same crawlable-HTML outcome Next's static export gives, without the
 * migration. Without this step every route ships the exact same empty
 * `<div id="root">` and one site-wide <title>/description, so a case study
 * like Grand Motel OS can't rank on its own name — search engines and AI
 * crawlers alike see nothing route-specific until JS runs.
 *
 * For each route: render it to an HTML string via the SSR bundle, inject
 * that plus this route's <title>/meta/OG/JSON-LD into the built
 * dist/index.html shell, and write dist/<route>/index.html. Vercel serves a
 * directory's index.html for a matching path automatically, so this needs
 * no vercel.json rewrite change for the routes it covers — the existing
 * catch-all rewrite to /index.html stays as the fallback for genuinely
 * unmatched paths (React Router's own `*` -> NotFound).
 *
 * Also emits dist/sitemap.xml from the same route list.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const { render, getRouteMeta, getAllRoutePaths, SITE_URL, DEFAULT_OG_IMAGE, projects } = await import(
  pathToFileURL(path.join(DIST, 'server', 'entry-server.js')).href
);

const shellPath = path.join(DIST, 'index.html');
if (!fs.existsSync(shellPath)) {
  console.error('prerender: dist/index.html not found — run `vite build` before this script.');
  process.exit(1);
}
const shell = fs.readFileSync(shellPath, 'utf8');

// NB: routes are statically imported (see src/routes.config.tsx) rather than
// route.lazy/React.lazy — `import()` is always asynchronous, even for an
// already-cached module, so a lazy route component can never be ready on
// hydrateRoot's first synchronous render pass no matter how early the chunk
// is fetched. That's a JS-spec timing issue, not a network one, so there's
// no per-route chunk to preload here; Vite's own modulepreload for the
// react-vendor chunk (already in the shell) is all this build has.

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Qevon',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: ['https://github.com/Qevon-Digital', 'https://www.instagram.com/qevondigital/', 'https://www.linkedin.com/company/qoven'],
};

function projectJsonLd(project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.cardDesc,
    about: project.result,
    dateCreated: project.year,
    keywords: project.tags.join(', '),
    creator: { '@type': 'Organization', name: 'Qevon' },
    url: `${SITE_URL}/work/${project.slug}`,
  };
}

function buildHtml(routePath, bodyHtml, meta, extraJsonLd) {
  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);

  // description — replace if figmaSiteConfiguration already injected one, else insert before </head>
  const descTag = `<meta name="description" content="${escapeHtml(meta.description)}" />`;
  html = /<meta\s+name="description"[^>]*>/.test(html)
    ? html.replace(/<meta\s+name="description"[^>]*>/, descTag)
    : html.replace('</head>', `${descTag}\n</head>`);

  const ogTags = [
    ['og:title', meta.title],
    ['og:description', meta.description],
    ['og:image', meta.ogImage || DEFAULT_OG_IMAGE],
    ['og:url', `${SITE_URL}${routePath}`],
  ];
  for (const [prop, content] of ogTags) {
    const tag = `<meta property="${prop}" content="${escapeHtml(content)}" />`;
    const re = new RegExp(`<meta\\s+property="${prop}"[^>]*>`);
    html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}\n</head>`);
  }

  // canonical link
  const canonical = `<link rel="canonical" href="${SITE_URL}${routePath}" />`;
  html = /<link\s+rel="canonical"/.test(html) ? html.replace(/<link\s+rel="canonical"[^>]*>/, canonical) : html.replace('</head>', `${canonical}\n</head>`);

  // JSON-LD — Organization on every page, plus per-route extra (project schema)
  const jsonLdBlocks = [organizationJsonLd, ...(extraJsonLd ? [extraJsonLd] : [])]
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join('\n');
  html = html.replace('</head>', `${jsonLdBlocks}\n</head>`);

  // React 19's renderToString automatically emits a `<link rel="preload">`
  // inline, right at the point it encounters an eager <img> (e.g. the case
  // study hero) — because renderToString has no real <head> to hoist into.
  // The client does have a real document.head at hydration time and hoists
  // the equivalent hint there instead, so the server tree has an extra node
  // inside #root that the client tree doesn't: a hydration mismatch. Pull
  // any such hints out of the body and place them in <head> ourselves —
  // where they belong anyway — so both sides render the same #root tree.
  const preloadLinks = [];
  let cleanBody = bodyHtml.replace(/<link rel="preload"[^>]*\/>/g, (m) => {
    preloadLinks.push(m);
    return '';
  });
  if (preloadLinks.length) {
    html = html.replace('</head>', `${preloadLinks.join('\n')}\n</head>`);
  }

  // root markup — hydrateRoot in main.tsx requires this to actually match
  // what the client would render, or React discards it and warns.
  html = html.replace('<div id="root"></div>', `<div id="root">${cleanBody}</div>`);

  return html;
}

const routePaths = getAllRoutePaths(projects.map((p) => p.slug));

console.log(`prerender: ${routePaths.length} routes`);

for (const routePath of routePaths) {
  const meta = getRouteMeta(routePath);
  const bodyHtml = await render(routePath);

  const projectMatch = routePath.match(/^\/work\/([^/]+)$/);
  const project = projectMatch ? projects.find((p) => p.slug === projectMatch[1]) : null;
  const extraJsonLd = project ? projectJsonLd(project) : null;

  const html = buildHtml(routePath, bodyHtml, meta, extraJsonLd);

  const outDir = routePath === '/' ? DIST : path.join(DIST, routePath.replace(/^\//, ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`  ${routePath} -> ${path.relative(ROOT, path.join(outDir, 'index.html'))}`);
}

// sitemap.xml
const sitemapEntries = routePaths
  .map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
console.log(`  sitemap.xml -> ${routePaths.length} urls`);

console.log('prerender: done');
