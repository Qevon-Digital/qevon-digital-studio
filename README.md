# Qevon

Marketing site for Qevon, a software engineering studio. Static React SPA, deployed on Vercel.

## Requirements

Node 22, pnpm 10. Both are pinned in `.mise.toml`.

## Setup

```bash
pnpm install
pnpm dev
```

Dev server runs on port 8443.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Typecheck, then build to `dist/` |
| `pnpm typecheck` | Types only |
| `pnpm preview` | Serve the production build — use this for any performance measurement, not the dev server |
| `pnpm images` | Downscale and re-encode screenshots to WebP into `public/work/` |

`build` runs `tsc --noEmit` before `vite build` on purpose. Vite strips types without checking them,
so without it a type error would build cleanly and ship.

## Structure

```
src/
  routes.ts          Route table. Pages are lazy; error/404 pages are not.
  components/
    Layout.tsx       Navbar, footer, background, route transitions
    ...              One file per component
  pages/             One file per route
  data/projects.ts   All project content lives here
  index.css          Theme tokens and type scale (Tailwind v4, no config file)
public/
  work/              Project screenshots (WebP)
scripts/
  optimize-images.mjs
.figma/make/
  site.json          Page title, meta tags, OG tags, theme bootstrap
```

## Content

Project content is in `src/data/projects.ts`. Home, Work and the case study pages all render from
that one array, so adding a project is a single entry plus images.

To add one:

1. Add the source screenshots to `JOBS` in `scripts/optimize-images.mjs`, then `pnpm images`.
2. Add a `projects` entry in `src/data/projects.ts`.
3. Add the URL to `public/sitemap.xml`.

Filter chips on `/work` are derived from project tags, so they need no maintenance.

## Theming

CSS custom properties on `:root`, overridden under `:root[data-theme="light"]`. Dark is the default —
light is opt-in and remembered in `localStorage`.

Two details that look like mistakes but aren't:

- **`--accent` and `--accent-text` differ in light mode.** `--accent` (`#FF5A1F`) is for fills and is
  identical in both themes. `--accent-text` is for orange text and darkens to `#C43E0A` on light,
  because the brand orange only measures 2.81:1 against the light background. Use `--accent` for
  backgrounds and borders, `--accent-text` for text and focus rings.
- **`ConstellationGrid` reads the palette manually.** Canvas can't read CSS custom properties, so it
  pulls them via `getComputedStyle` on mount and on the `qevon:themechange` event.

## Editing page metadata

Title, meta description, OG tags, favicon and the no-flash theme script live in
`.figma/make/site.json`. It's imported by `vite.config.ts` at config-eval time, so **restart the dev
server after editing it** — a browser reload won't pick up changes.

## Deploying

Push to `main`. Vercel builds and deploys automatically; it auto-detects Vite and `dist/`.

`vercel.json` provides the SPA rewrite, without which deep links like `/work/sentinelops` return a
CDN 404 before React Router loads. It also sets long-lived cache headers on the content-hashed
`/assets/` files.

Images are committed as plain files, not Git LFS. Vercel does not fetch LFS objects during a build,
so anything tracked by LFS would deploy as a text pointer instead of an image. See `.gitattributes`.
