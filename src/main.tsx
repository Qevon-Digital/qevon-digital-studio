import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Production builds prerender each route to static HTML (see
// scripts/prerender.mjs), so #root already has real markup in it — that
// needs hydrateRoot, or React discards the prerendered paint and repaints
// from scratch. `npm run dev` never runs the prerender step, so #root is
// still empty there; hydrateRoot onto an empty container just warns and
// mounts anyway, but createRoot is the correct call for it. Check which
// case we're in rather than hardcoding one.
const rootEl = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, app);
} else {
  ReactDOM.createRoot(rootEl).render(app);
}
