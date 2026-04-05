import { emitEvent } from '../events.js';
import { Loading } from '../components/loading.js';

const ROUTES = {
  '/':                  () => import('../../portal/pages/home.js'),
  '/games/typing':      () => import('../../games/typing/pages/description.js'),
  '/games/typing/play': () => import('../../games/typing/pages/play.js'),
  '/ranking':           () => import('../../user/pages/ranking.js'),
  '/login':             () => import('../../user/pages/login.js'),
  '/about':             () => import('../../portal/pages/about.js'),
  '/contact':           () => import('../../portal/pages/contact.js'),
};

const FALLBACK = () => import('../../portal/pages/not-found.js');

function isGamePlayPage(path) {
  return path.endsWith('/play');
}

function getPathFromHash() {
  const hash = location.hash.slice(1);
  return hash || '/';
}

let _container = null;
let _currentPage = null;
let _header = null;
let _footer = null;

async function _onRouteChange() {
  const path = getPathFromHash();
  const routeLoader = ROUTES[path] || FALLBACK;

  Loading.show(_container);

  try {
    const module = await routeLoader();

    Loading.hide(_container);

    // 前ページ破棄
    _container.innerHTML = '';
    if (_currentPage && typeof _currentPage.destroy === 'function') {
      _currentPage.destroy();
    }

    // 新ページ描画
    _currentPage = module.default;
    const page = _currentPage.create();
    _container.appendChild(page);

    // ゲームプレイ画面判定
    if (isGamePlayPage(path)) {
      _container.classList.add('page-container--fullscreen');
      _header?.style.setProperty('display', 'none');
      _footer?.style.setProperty('display', 'none');
    } else {
      _container.classList.remove('page-container--fullscreen');
      _header?.style.removeProperty('display');
      _footer?.style.removeProperty('display');
    }

    emitEvent('route-change', { path });
  } catch (err) {
    Loading.hide(_container);
    _container.innerHTML = '<div class="page-container"><p>ページの読み込みに失敗しました。</p></div>';
    console.error('Route load error:', err);
  }
}

export const Router = {
  init(container, header, footer) {
    _container = container;
    _header = header;
    _footer = footer;
    _currentPage = null;
    window.addEventListener('hashchange', _onRouteChange);
    _onRouteChange();
  },

  navigate(path) {
    location.hash = '#' + path;
  },

  getCurrentPath() {
    return getPathFromHash();
  },
};
