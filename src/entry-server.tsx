// Prerender entry. Run in Node only (via `vite build --ssr`), never shipped
// to the browser. Uses React Router's data-router SSR APIs directly rather
// than reusing App.tsx/routes.ts, because createBrowserRouter touches
// `window` at creation time, which doesn't exist in Node.
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routeConfig } from './routes.config';
import { getRouteMeta, getAllRoutePaths, SITE_URL, DEFAULT_OG_IMAGE } from './lib/seo';
import { projects } from './data/projects';

// Re-exported so scripts/prerender.mjs (a plain Node script, not part of the
// Vite/TS graph) can import everything it needs from this one SSR bundle
// output (dist/server/entry-server.js) instead of hand-parsing TypeScript.
export { getRouteMeta, getAllRoutePaths, SITE_URL, DEFAULT_OG_IMAGE, projects };

export async function render(url: string): Promise<string> {
  const handler = createStaticHandler(routeConfig);
  const request = new Request(new URL(url, 'http://localhost'));
  const context = await handler.query(request);

  // handler.query returns a plain Response for a redirect/thrown Response —
  // none of our routes throw one, but fail loudly instead of silently
  // rendering nothing if that ever changes.
  if (context instanceof Response) {
    throw new Error(`Unexpected Response from static handler for ${url}: ${context.status}`);
  }

  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(<StaticRouterProvider router={router} context={context} />);
}
