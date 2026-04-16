import { beforeEach, describe, expect, it, vi } from 'vitest';

function createStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

async function loadModuleWithWindow(initialMode) {
  vi.resetModules();

  const fakeWindow = new EventTarget();
  fakeWindow.localStorage = createStorage();
  if (initialMode) {
    fakeWindow.localStorage.setItem('penguin-site-mode', initialMode);
  }

  const fakeDocument = {
    documentElement: {
      dataset: {},
    },
  };

  vi.stubGlobal('window', fakeWindow);
  vi.stubGlobal('document', fakeDocument);

  const module = await import('./site-mode.js');
  return { module, fakeWindow, fakeDocument };
}

describe('site-mode', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializeSiteMode が localStorage の値を復元する', async () => {
    const { module, fakeDocument } = await loadModuleWithWindow('teens');

    expect(module.initializeSiteMode()).toBe('teens');
    expect(module.getSiteMode()).toBe('teens');
    expect(fakeDocument.documentElement.dataset.mode).toBe('teens');
  });

  it('setSiteMode が保存とイベント発火を行う', async () => {
    const { module, fakeWindow } = await loadModuleWithWindow('kids');
    const listener = vi.fn();
    fakeWindow.addEventListener('site-mode-change', listener);

    module.setSiteMode('teens', 'test');

    expect(module.getSiteMode()).toBe('teens');
    expect(fakeWindow.localStorage.getItem('penguin-site-mode')).toBe('teens');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ mode: 'teens', source: 'test' });
  });

  it('setPortalContext と getPortalContext が連携する', async () => {
    const { module } = await loadModuleWithWindow('kids');

    module.setPortalContext({
      lastPortalRoute: '/kids/games',
      mode: 'kids',
      category: 'games',
    });

    expect(module.getPortalContext()).toEqual({
      lastPortalRoute: '/kids/games',
      mode: 'kids',
      category: 'games',
    });
  });

  it('不正なモードは無視される', async () => {
    const { module } = await loadModuleWithWindow('kids');
    expect(module.setSiteMode('invalid')).toBe('kids');
    expect(module.getSiteMode()).toBe('kids');
  });
});
