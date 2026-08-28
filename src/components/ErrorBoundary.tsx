import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Last-resort catch so a thrown render error shows something branded instead
 * of a blank white page.
 *
 * Deliberately a class component: React still has no hook equivalent for
 * `getDerivedStateFromError` / `componentDidCatch`, so an error boundary
 * cannot be written as a function component.
 *
 * This is the OUTER layer, wrapping RouterProvider in App.tsx (so it also
 * covers the lazy-route Suspense path). React Router intercepts errors thrown
 * inside routes before this ever sees them, which is why routes.ts also
 * registers an `errorElement` — the two catch different failures and both are
 * needed.
 */
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the real error reachable — swallowing it here would make the
    // branded fallback actively harder to debug than the white screen was.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorScreen message={this.state.error.message} />;
  }
}

/** Shared fallback UI, also used by the router's errorElement. */
export function ErrorScreen({ message }: { message?: string }) {
  return (
    <div
      className="min-h-screen flex items-center"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        <div className="max-w-xl">
          <span
            className="text-sm font-bold tracking-[0.2em] block mb-4"
            style={{ color: 'var(--accent-text)', fontFamily: "'Inter Tight', sans-serif" }}
          >
            SOMETHING BROKE
          </span>
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight mb-6"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            THIS PAGE
            <br />
            DIDN'T LOAD.
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
            An error stopped this page rendering. Reloading usually fixes it. If it doesn't,
            tell us at{' '}
            <a href="mailto:hello@qevon.com" style={{ color: 'var(--accent-text)' }}>
              hello@qevon.com
            </a>{' '}
            and we'll look at it.
          </p>
          {message ? (
            <p
              className="text-xs mb-8 px-4 py-3"
              style={{
                color: 'var(--muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
                wordBreak: 'break-word',
              }}
            >
              {message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-accent inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                fontFamily: "'Inter Tight', sans-serif",
              }}
            >
              RELOAD →
            </button>
            {/* A plain <a>, not a react-router <Link>: the router itself may be
                the thing that failed, so this must not depend on it. */}
            <a
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.1em] px-8 py-4 transition-opacity hover:opacity-80"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: "'Inter Tight', sans-serif",
              }}
            >
              BACK TO HOME →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
