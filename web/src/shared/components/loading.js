import { UIState } from '../state/ui-state.js';

let _loadingEl = null;

export const Loading = {
  show(container) {
    if (_loadingEl) return;
    _loadingEl = document.createElement('div');
    _loadingEl.className = 'loading';
    _loadingEl.setAttribute('role', 'status');
    _loadingEl.setAttribute('aria-label', '読み込み中');
    _loadingEl.innerHTML = '<div class="loading__spinner"></div>';
    UIState.setLoading(true);
    container.appendChild(_loadingEl);
  },

  hide(container) {
    if (_loadingEl) {
      _loadingEl.remove();
      _loadingEl = null;
    }
    UIState.setLoading(false);
  },
};
