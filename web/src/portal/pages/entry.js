import { Router } from '../../shared/router/router.js';
import { getSiteMode, isValidSiteMode } from '../../shared/state/site-mode.js';

export function getEntryRedirectPath(mode = getSiteMode()) {
  return isValidSiteMode(mode) ? `/${mode}` : '/kids';
}

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-entry';
    page.innerHTML = `
      <div class="page-entry__loading">
        <div class="loading loading--inline">モードを読み込み中...</div>
      </div>
    `;

    queueMicrotask(() => {
      Router.navigate(getEntryRedirectPath(getSiteMode()));
    });

    return page;
  },
};
