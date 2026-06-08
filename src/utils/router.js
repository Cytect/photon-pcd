/* PHOTON — Hash-Based View Router */
import { setState } from './state.js';

/**
 * Routes:
 *   #/dashboard   → Dashboard home screen
 *   #/editor      → Editor (new project)
 *   #/editor/:id  → Editor (existing project)
 *
 * Default: #/dashboard
 */

// ── Parse hash into route object ──────────────────────────
function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!clean || clean === 'dashboard') {
    return { view: 'dashboard', params: {} };
  }
  if (clean === 'editor') {
    return { view: 'editor', params: {} };
  }
  if (clean.startsWith('editor/')) {
    const projectId = clean.slice('editor/'.length);
    return { view: 'editor', params: { projectId } };
  }
  // Fallback
  return { view: 'dashboard', params: {} };
}

// ── Navigate to a path ────────────────────────────────────
export function navigate(path) {
  const target = path.startsWith('#') ? path : `#/${path}`;
  window.location.hash = target;
}

// ── Initialize router ────────────────────────────────────
export function initRouter() {
  function handleRoute() {
    const route = parseHash(window.location.hash);
    setState({
      currentView: route.view,
      routeParams: route.params,
    });
  }

  window.addEventListener('hashchange', handleRoute);

  // Set initial route
  if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
    window.location.hash = '#/dashboard';
  } else {
    handleRoute();
  }
}
