import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    // Outer boundary catches what the router's own ErrorBoundary can't —
    // notably failures in the Suspense/lazy-chunk path around RouterProvider
    // itself. See ErrorBoundary.tsx for why both layers exist.
    <ErrorBoundary>
      <Suspense fallback={<div style={{ background: 'var(--bg)', height: '100vh' }} />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
