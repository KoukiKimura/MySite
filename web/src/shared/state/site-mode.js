import { emitEvent } from '../events.js';

export const SiteMode = Object.freeze({
  KIDS: 'kids',
  TEENS: 'teens',
});

const STORAGE_KEY = 'penguin-site-mode';
let currentMode = loadInitialMode();
let portalContext = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function isValidSiteMode(mode) {
  return mode === SiteMode.KIDS || mode === SiteMode.TEENS;
}

function applyModeToDocument(mode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.mode = mode;
  }
}

function loadInitialMode() {
  if (!isBrowser()) {
    return SiteMode.KIDS;
  }

  try {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    if (isValidSiteMode(storedMode)) {
      return storedMode;
    }
  } catch {
    // localStorage が使えない環境では既定値を利用する
  }

  return SiteMode.KIDS;
}

export function initializeSiteMode() {
  currentMode = loadInitialMode();
  applyModeToDocument(currentMode);
  return currentMode;
}

export function getSiteMode() {
  return currentMode;
}

export function setSiteMode(mode, source = 'app') {
  if (!isValidSiteMode(mode)) {
    return currentMode;
  }

  if (currentMode === mode) {
    applyModeToDocument(mode);
    return currentMode;
  }

  currentMode = mode;
  applyModeToDocument(mode);

  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // 保存できない場合でも UI は切り替える
    }
  }

  emitEvent('site-mode-change', { mode, source });
  return currentMode;
}

export function setPortalContext({ lastPortalRoute = null, mode = currentMode, category = null } = {}) {
  portalContext = {
    lastPortalRoute,
    mode: isValidSiteMode(mode) ? mode : currentMode,
    category,
  };

  emitEvent('portal-context-update', { ...portalContext });
  return { ...portalContext };
}

export function getPortalContext() {
  return portalContext ? { ...portalContext } : null;
}

export function resetSiteModeStateForTest() {
  portalContext = null;
  currentMode = SiteMode.KIDS;

  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }

  applyModeToDocument(currentMode);
}

applyModeToDocument(currentMode);
