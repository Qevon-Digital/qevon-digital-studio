import { RouterProvider } from 'react-router';
import { router } from './routes';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    // Outer boundary catches what the router's own ErrorBoundary can't —
    // failures in RouterProvider's own render path, before any route has
    // even matched. See ErrorBoundary.tsx for why both layers exist.
    //
    // Deliberately no Suspense wrapper here. createBrowserRouter has a
    // one-tick "not yet initialized" render pass on the very first client
    // render even with zero lazy routes/loaders — with a Suspense boundary
    // around it, that tick gets caught as a real suspend and its fallback
    // gets diffed against the fully-resolved prerendered HTML, which is a
    // guaranteed hydration mismatch. Routes are statically imported (see
    // routes.config.tsx) specifically so there's nothing left to suspend on;
    // removing the boundary that was catching a false-positive is what
    // actually closes the gap, not adding more Suspense.
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
