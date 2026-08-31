// Shared route config, statically imported, used by both routes.ts
// (createBrowserRouter, client) and entry-server.tsx (createStaticHandler,
// prerender). Deliberately NOT lazy: `import()` is always asynchronous, even
// for an already-cached module, so a route.lazy/React.lazy component can
// never be ready on hydrateRoot's first synchronous render pass — no amount
// of modulepreloading closes that gap, since it's a JS-spec timing issue,
// not a network one. Prerendering needs the initial route's markup to match
// exactly on both sides, so it's statically imported here instead.
import RouteError from './components/RouteError';
import NotFound from './pages/NotFound';
import Root from './components/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';

export const routeConfig = [
  {
    path: '/',
    Component: Root,
    // Component form (rather than `errorElement`) so this file stays JSX-free
    // in spirit — the JSX here is just component references, not markup.
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: Home },
      { path: 'work', Component: Work },
      { path: 'work/:slug', Component: CaseStudy },
      { path: 'services', Component: Services },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      // Catch-all. Without it, any unmatched URL falls through to React
      // Router's own unstyled default error screen.
      { path: '*', Component: NotFound },
    ],
  },
];
