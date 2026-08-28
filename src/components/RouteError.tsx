import { useRouteError, isRouteErrorResponse } from 'react-router';
import { ErrorScreen } from './ErrorBoundary';
import NotFound from '../pages/NotFound';

/**
 * The router's `errorElement`. React Router catches errors thrown inside
 * routes before they reach the ErrorBoundary wrapping RouterProvider, so
 * without this a failed route render would still blank the page.
 *
 * A 404 response gets the branded NotFound page rather than the generic
 * error screen — a mistyped URL isn't a failure and shouldn't read like one.
 */
export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error('Route error:', error);

  const message =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
        ? error.message
        : undefined;

  return <ErrorScreen message={message} />;
}
