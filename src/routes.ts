import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';

// Neither of these is lazy: they render when something has already gone
// wrong, so they must not depend on a chunk fetch that could fail for the
// same reason. (RouteError also imports NotFound directly, to serve a 404
// response — so lazy-loading NotFound here would be dead code anyway.)
import RouteError from './components/RouteError';
import NotFound from './pages/NotFound';

const Root = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Work = lazy(() => import('./pages/Work'));
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    // Component form (rather than `errorElement`) so this file stays JSX-free
    // and matches the `Component:` style used throughout.
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
]);
