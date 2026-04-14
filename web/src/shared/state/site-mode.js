import { emitEvent } from '../events.js';

export const SiteMode = Object.freeze({
  KIDS: 'kids',
  TEENS: 'teens',
});

const STORAGE_KEY = 'penguin-site-mode';
let _currentMode = loadInitialMode();

function isValidMode(mode) {
  return mode === SiteMode.KIDS || mode === SiteMode.TEENS;
}

function loadInitialMode() {
  if (typeof window === 'undefined') {
    return SiteMode.KIDS;
  }

  try {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    if (isValidMode(storedMode)) {
      return storedMode;
    }
  } catch {
    // localStorage が使えない環境では既定値を利用する
  }

  return SiteMode.KIDS;
}

export function getSiteMode() {
  return _currentMode;
}

export function setSiteMode(mode) {
  if (!isValidMode(mode)) {
    return _currentMode;
  }

  if (_currentMode === mode) {
    return _currentMode;
  }

  _currentMode = mode;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // 保存できない場合でも UI は切り替える
    }
  }

  emitEvent('site-mode-change', { mode });
  return _currentMode;
}
