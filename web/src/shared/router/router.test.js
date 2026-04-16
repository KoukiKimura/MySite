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

function createFakeElement(tagName = 'div') {
  const element = {
    nodeType: 1,
    tagName: tagName.toUpperCase(),
    className: '',
    id: '',
    innerHTML: '',
    hidden: false,
    dataset: {},
    children: [],
    parentNode: null,
    style: {
      setProperty(key, value) {
        this[key] = value;
      },
      removeProperty(key) {
        delete this[key];
      },
    },
    classList: {
      values: new Set(),
      add(...items) {
        items.forEach(item => this.values.add(item));
      },
      remove(...items) {
        items.forEach(item => this.values.delete(item));
      },
      toggle(item, force) {
        if (force) {
          this.values.add(item);
        } else {
          this.values.delete(item);
        }
      },
    },
    setAttribute(name, value) {
      this[name] = value;
      if (name === 'hidden') {
        this.hidden = true;
      }
    },
    removeAttribute(name) {
      delete this[name];
      if (name === 'hidden') {
        this.hidden = false;
      }
    },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter(item => item !== child);
    },
    remove() {
      this.parentNode?.removeChild(this);
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  return element;
}

async function loadRouterModule(initialHash = '#/about') {
  vi.resetModules();

  const fakeWindow = new EventTarget();
  fakeWindow.location = { hash: initialHash };
  fakeWindow.history = {
    pushState: vi.fn((_state, _title, hash) => {
      fakeWindow.location.hash = hash;
    }),
  };
  fakeWindow.localStorage = createStorage();

  const fakeDocument = {
    documentElement: { dataset: {} },
    createElement: vi.fn(tag => createFakeElement(tag)),
  };

  class FakeCustomEvent extends Event {
    constructor(name, init = {}) {
      super(name);
      this.detail = init.detail;
    }
  }

  vi.stubGlobal('window', fakeWindow);
  vi.stubGlobal('document', fakeDocument);
  vi.stubGlobal('CustomEvent', FakeCustomEvent);

  const routerModule = await import('./router.js');
  const { mockAuthRepository } = await import('../../user/repository/mock-auth-repository.js');
  return { ...routerModule, fakeWindow, fakeDocument, mockAuthRepository };
}

async function waitForAssertion(assertion, retries = 20, delayMs = 10) {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

describe('resolveRoute', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('トップとモード別トップを正しく解決する', () => {
    return loadRouterModule().then(({ resolveRoute }) => {
      expect(resolveRoute('/').name).toBe('entry');
      expect(resolveRoute('/kids')).toEqual(expect.objectContaining({
        name: 'portal-home',
        params: { mode: 'kids' },
      }));
      expect(resolveRoute('/teens')).toEqual(expect.objectContaining({
        name: 'portal-home',
        params: { mode: 'teens' },
      }));
    });
  });

  it('カテゴリルートを正しく解決し、未定義カテゴリは 404 に落とす', async () => {
    const { resolveRoute } = await loadRouterModule();
    expect(resolveRoute('/kids/games')).toEqual(expect.objectContaining({
      name: 'portal-category',
      params: { mode: 'kids', category: 'games' },
    }));
    expect(resolveRoute('/teens/news')).toEqual(expect.objectContaining({
      name: 'portal-category',
      params: { mode: 'teens', category: 'news' },
    }));
    expect(resolveRoute('/kids/invalid').name).toBe('not-found');
  });

  it('その他の既存ルートを正しく解決する', async () => {
    const { resolveRoute, normalizePath, isGamePlayPage } = await loadRouterModule();
    expect(normalizePath('#/guide')).toBe('/guide');
    expect(isGamePlayPage('/games/typing/play')).toBe(true);
    expect(resolveRoute('/games/typing').name).toBe('typing-description');
    expect(resolveRoute('/games/typing/play').name).toBe('typing-play');
    expect(resolveRoute('/ranking').name).toBe('ranking');
    expect(resolveRoute('/login').name).toBe('login');
    expect(resolveRoute('/admin')).toEqual(expect.objectContaining({
      name: 'admin',
      guard: 'mock-auth',
    }));
    expect(resolveRoute('/parents').name).toBe('parents');
    expect(resolveRoute('/guide').name).toBe('guide');
    expect(resolveRoute('/safety/links').name).toBe('safety-links');
    expect(resolveRoute('/policy/content').name).toBe('content-policy');
    expect(resolveRoute('/policy/privacy').name).toBe('privacy');
    expect(resolveRoute('/about').name).toBe('about');
    expect(resolveRoute('/contact').name).toBe('contact');
    expect(resolveRoute('/unknown').name).toBe('not-found');
  });

  it('init と navigate が現在ルートを描画して route-change を発火する', async () => {
    const { Router, fakeWindow } = await loadRouterModule('#/about');
    const container = createFakeElement('main');
    const header = { show: vi.fn(), hide: vi.fn() };
    const footer = { show: vi.fn(), hide: vi.fn() };
    const listener = vi.fn();
    fakeWindow.addEventListener('route-change', listener);

    Router.init(container, header, footer);
    await waitForAssertion(() => {
      expect(listener).toHaveBeenCalled();
    });

    expect(container.children.length).toBeGreaterThan(0);
    expect(header.show).toHaveBeenCalled();
    expect(footer.show).toHaveBeenCalled();

    await Router.navigate('/contact');
    expect(fakeWindow.location.hash).toBe('#/contact');
  });

  it('guard 付きルートは未ログイン時に /login へ誘導する', async () => {
    const { Router, mockAuthRepository } = await loadRouterModule('#/admin');
    const container = createFakeElement('main');
    const header = { show: vi.fn(), hide: vi.fn() };
    const footer = { show: vi.fn(), hide: vi.fn() };

    vi.spyOn(mockAuthRepository, 'isLoggedIn').mockReturnValue(false);
    const navigateSpy = vi.spyOn(Router, 'navigate').mockImplementation(() => Promise.resolve());

    Router.init(container, header, footer);
    await Promise.resolve();

    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
