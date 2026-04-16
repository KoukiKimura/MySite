const state = {
  loading: false,
  mobileMenuOpen: false,
  searchQuery: new Map(),
};

function normalizeScope(scope) {
  return String(scope ?? '').trim() || 'default';
}

export const UIState = {
  setLoading(value) {
    state.loading = Boolean(value);
    return state.loading;
  },

  getLoading() {
    return state.loading;
  },

  setMobileMenuOpen(open) {
    state.mobileMenuOpen = Boolean(open);
    return state.mobileMenuOpen;
  },

  getMobileMenuOpen() {
    return state.mobileMenuOpen;
  },

  setSearchQuery(scope, query) {
    const key = normalizeScope(scope);
    state.searchQuery.set(key, String(query ?? ''));
    return state.searchQuery.get(key) ?? '';
  },

  getSearchQuery(scope) {
    return state.searchQuery.get(normalizeScope(scope)) ?? '';
  },

  reset() {
    state.loading = false;
    state.mobileMenuOpen = false;
    state.searchQuery.clear();
  },
};
