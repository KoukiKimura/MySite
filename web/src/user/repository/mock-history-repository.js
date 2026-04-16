import { emitEvent } from '../../shared/events.js';

const STORAGE_KEY = 'penguin-search-history';

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(entries) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const mockHistoryRepository = {
  list({ mode, category, includeDeleted = false } = {}) {
    return readStorage()
      .filter(entry => (mode ? entry.mode === mode : true))
      .filter(entry => (category ? entry.category === category : true))
      .filter(entry => (includeDeleted ? true : !entry.deletedAt))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  save(entry) {
    const normalized = {
      id: `history-${Date.now()}`,
      mode: entry.mode ?? 'kids',
      route: entry.route ?? '/',
      category: entry.category ?? null,
      query: String(entry.query ?? '').trim(),
      trigger: entry.trigger ?? 'submit',
      createdAt: new Date().toISOString(),
      deletedAt: null,
      deletedBy: null,
    };

    const entries = readStorage();
    entries.push(normalized);
    writeStorage(entries);
    emitEvent('search-history-update', { mode: normalized.mode, category: normalized.category, action: 'save' });
    return normalized;
  },

  softDelete(id, deletedBy = 'user') {
    const entries = readStorage().map(entry => {
      if (entry.id !== id || entry.deletedAt) {
        return entry;
      }

      return {
        ...entry,
        deletedAt: new Date().toISOString(),
        deletedBy,
      };
    });

    writeStorage(entries);
    return entries.find(entry => entry.id === id) ?? null;
  },

  reset(mode) {
    const entries = readStorage().map(entry => {
      if (mode && entry.mode !== mode) {
        return entry;
      }

      if (entry.deletedAt) {
        return entry;
      }

      return {
        ...entry,
        deletedAt: new Date().toISOString(),
        deletedBy: 'reset',
      };
    });

    writeStorage(entries);
    emitEvent('search-history-update', { mode: mode ?? null, category: null, action: 'reset' });
    return entries;
  },
};
