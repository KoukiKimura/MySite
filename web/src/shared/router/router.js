import { emitEvent } from '../events.js';
import { Loading } from '../components/loading.js';
import { UIState } from '../state/ui-state.js';
import { mockAuthRepository } from '../../user/repository/mock-auth-repository.js';
import { isValidCategory } from '../../portal/data/category-content.js';

const ROUTES = [
  {
    name: 'entry',
    pattern: /^\/$/,
    load: () => import('../../portal/pages/entry.js'),
    getParams: () => ({}),
  },
  {
    name: 'portal-home',
    pattern: /^\/(kids|teens)$/,
    load: () => import('../../portal/pages/home.js'),
    getParams: ([, mode]) => ({ mode }),
  },
  {
    name: 'portal-category',
    pattern: /^\/(kids|teens)\/([a-z0-9-]+)$/,
    load: () => import('../../portal/pages/category.js'),
    getParams: ([, mode, category]) => ({ mode, category }),
  },
  {
    name: 'breakout-description',
    pattern: /^\/games\/breakout$/,
    load: () => import('../../games/breakout/pages/description.js'),
    getParams: () => ({}),
  },
  {
    name: 'breakout-play',
    pattern: /^\/games\/breakout\/play$/,
    load: () => import('../../games/breakout/pages/play.js'),
    getParams: () => ({}),
  },
  {
    name: 'typing-description',
    pattern: /^\/games\/typing$/,
    load: () => import('../../games/typing/pages/description.js'),
    getParams: () => ({}),
  },
  {
    name: 'typing-play',
    pattern: /^\/games\/typing\/play$/,
    load: () => import('../../games/typing/pages/play.js'),
    getParams: () => ({}),
  },
  {
    name: 'ranking',
    pattern: /^\/ranking$/,
    load: () => import('../../user/pages/ranking.js'),
    getParams: () => ({}),
  },
  {
    name: 'login',
    pattern: /^\/login$/,
    load: () => import('../../user/pages/login.js'),
    getParams: () => ({}),
  },
  {
    name: 'admin',
    pattern: /^\/admin$/,
    load: () => import('../../admin/pages/dashboard.js'),
    getParams: () => ({}),
    guard: 'mock-auth',
  },
  {
    name: 'parents',
    pattern: /^\/parents$/,
    load: () => import('../../portal/pages/parents.js'),
    getParams: () => ({}),
  },
  {
    name: 'guide',
    pattern: /^\/guide$/,
    load: () => import('../../portal/pages/guide.js'),
    getParams: () => ({}),
  },
  {
    name: 'safety-links',
    pattern: /^\/safety\/links$/,
    load: () => import('../../portal/pages/safety-links.js'),
    getParams: () => ({}),
  },
  {
    name: 'content-policy',
    pattern: /^\/policy\/content$/,
    load: () => import('../../portal/pages/content-policy.js'),
    getParams: () => ({}),
  },
  {
    name: 'privacy',
    pattern: /^\/policy\/privacy$/,
    load: () => import('../../portal/pages/privacy.js'),
    getParams: () => ({}),
  },
  {
    name: 'about',
    pattern: /^\/about$/,
    load: () => import('../../portal/pages/about.js'),
    getParams: () => ({}),
  },
  {
    name: 'contact',
    pattern: /^\/contact$/,
    load: () => import('../../portal/pages/contact.js'),
    getParams: () => ({}),
  },
];

const FALLBACK = () => import('../../portal/pages/not-found.js');

function createFallbackRoute() {
  return {
    name: 'not-found',
    loader: FALLBACK,
    params: {},
    guard: null,
  };
}

export function normalizePath(path = '') {
  const rawPath = String(path ?? '').trim();
  const withoutHash = rawPath.startsWith('#') ? rawPath.slice(1) : rawPath;

  if (!withoutHash || withoutHash === '/') {
    return '/';
  }

  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
}

function getPathFromHash() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return normalizePath(window.location.hash.slice(1));
}

export function isGamePlayPage(path) {
  return /^\/games\/[a-z0-9-]+\/play$/.test(normalizePath(path));
}

export function resolveRoute(path) {
  const normalizedPath = normalizePath(path);

  for (const route of ROUTES) {
    const matched = normalizedPath.match(route.pattern);
    if (!matched) {
      continue;
    }

    const params = route.getParams(matched);
    if (params.mode && params.category && !isValidCategory(params.mode, params.category)) {
      return createFallbackRoute();
    }

    return {
      name: route.name,
      loader: route.load,
      params,
      guard: route.guard ?? null,
    };
  }

  return createFallbackRoute();
}

let containerRef = null;
let currentPage = null;
let headerRef = null;
let footerRef = null;
let lastRenderedPath = null;
let navigationToken = 0;

function syncLayout(path) {
  const fullscreen = isGamePlayPage(path);
  containerRef?.classList.toggle('page-container--fullscreen', fullscreen);

  if (fullscreen) {
    headerRef?.hide?.();
    footerRef?.hide?.();
    return;
  }

  headerRef?.show?.();
  footerRef?.show?.();
}

async function onRouteChange(force = false) {
  if (!containerRef) {
    return;
  }

  const path = getPathFromHash();
  if (!force && path === lastRenderedPath) {
    return;
  }

  const route = resolveRoute(path);
  if (route.guard === 'mock-auth' && !mockAuthRepository.isLoggedIn()) {
    Router.navigate('/login');
    return;
  }

  const currentToken = ++navigationToken;
  UIState.reset();
  Loading.show(containerRef);

  try {
    const module = await route.loader();
    if (currentToken !== navigationToken) {
      return;
    }

    Loading.hide(containerRef);

    if (currentPage && typeof currentPage.destroy === 'function') {
      currentPage.destroy();
    }

    containerRef.innerHTML = '';
    currentPage = module.default ?? null;

    const page = typeof currentPage?.create === 'function'
      ? currentPage.create({ path, params: route.params })
      : null;

    if (page && typeof page.nodeType === 'number') {
      containerRef.appendChild(page);
    }

    syncLayout(path);
    lastRenderedPath = path;
    emitEvent('route-change', { path, params: route.params });
  } catch (error) {
    if (currentToken !== navigationToken) {
      return;
    }

    Loading.hide(containerRef);
    containerRef.innerHTML = `
      <section class="portal-error">
        <h1 class="portal-error__title">ページの読み込みに失敗しました。</h1>
        <p class="portal-error__text">時間をおいて再度お試しください。</p>
      </section>
    `;
    syncLayout(path);
    lastRenderedPath = path;
    console.error('Route load error:', error);
  }
}

export const Router = {
  init(container, header, footer) {
    containerRef = container;
    headerRef = header;
    footerRef = footer;
    currentPage = null;
    lastRenderedPath = null;

    window.removeEventListener('hashchange', onRouteChange);
    window.removeEventListener('popstate', onRouteChange);
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);

    onRouteChange(true);
  },

  navigate(path) {
    const normalizedPath = normalizePath(path);
    const targetHash = `#${normalizedPath}`;

    if (window.location.hash === targetHash) {
      return onRouteChange(true);
    }

    window.history.pushState({ path: normalizedPath }, '', targetHash);
    return onRouteChange(true);
  },

  getCurrentPath() {
    return getPathFromHash();
  },

  _onRouteChange: onRouteChange,
};
