import { beforeEach, describe, expect, it, vi } from 'vitest';

function createFakeElement() {
  return {
    nodeType: 1,
    className: '',
    innerHTML: '',
  };
}

describe('getEntryRedirectPath', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('kids と teens をそのままトップへ変換する', () => {
    return import('./entry.js').then(({ getEntryRedirectPath }) => {
      expect(getEntryRedirectPath('kids')).toBe('/kids');
      expect(getEntryRedirectPath('teens')).toBe('/teens');
    });
  });

  it('不正な値のときは kids にフォールバックする', () => {
    return import('./entry.js').then(({ getEntryRedirectPath }) => {
      expect(getEntryRedirectPath('unknown')).toBe('/kids');
      expect(getEntryRedirectPath(null)).toBe('/kids');
    });
  });

  it('create が現在モードのトップへ遷移する', async () => {
    vi.doMock('../../shared/router/router.js', () => ({
      Router: {
        navigate: vi.fn(),
      },
    }));

    const fakeWindow = new EventTarget();
    fakeWindow.localStorage = {
      getItem() {
        return 'teens';
      },
      setItem() {},
      removeItem() {},
    };

    vi.stubGlobal('window', fakeWindow);
    vi.stubGlobal('document', {
      documentElement: { dataset: {} },
      createElement: () => createFakeElement(),
    });

    const { initializeSiteMode } = await import('../../shared/state/site-mode.js');
    initializeSiteMode();
    const { default: EntryPage } = await import('./entry.js');
    const { Router } = await import('../../shared/router/router.js');

    const page = EntryPage.create();
    await Promise.resolve();

    expect(page.className).toBe('page-entry');
    expect(Router.navigate).toHaveBeenCalledWith('/teens');
  });
});
