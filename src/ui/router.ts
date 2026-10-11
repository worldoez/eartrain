import { useSyncExternalStore } from 'react';

// Hash routing: works on GitHub Pages sub-paths and inside Capacitor
// without any server rewrites.

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export interface Route {
  parts: string[];
  query: URLSearchParams;
}

let cachedHash: string | null = null;
let cachedRoute: Route = { parts: [], query: new URLSearchParams() };

function parse(): Route {
  const hash = window.location.hash;
  if (hash !== cachedHash) {
    cachedHash = hash;
    const raw = hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    cachedRoute = { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs ?? '') };
  }
  return cachedRoute;
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, parse);
}

export function go(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
  window.scrollTo(0, 0);
}

export function back(fallback = '/') {
  if (window.history.length > 1) window.history.back();
  else go(fallback);
}

export function sessionHref(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, String(v));
  return `/session?${qs.toString()}`;
}
