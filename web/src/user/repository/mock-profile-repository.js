import { emitEvent } from '../../shared/events.js';

const STORAGE_KEY = 'penguin-featured-profile';
let cache = null;

function readStorage() {
  if (cache) {
    return cache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    cache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    cache = {};
  }

  return cache;
}

function writeStorage(nextStore) {
  cache = nextStore;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
}

export const mockProfileRepository = {
  get(mode) {
    const store = readStorage();
    return store[mode] ?? null;
  },

  save(profile) {
    const store = readStorage();
    const normalized = {
      mode: profile.mode,
      preferredCategories: Array.isArray(profile.preferredCategories) ? profile.preferredCategories : [],
      boostKeywords: Array.isArray(profile.boostKeywords) ? profile.boostKeywords : [],
      recommendedFeatureIds: Array.isArray(profile.recommendedFeatureIds) ? profile.recommendedFeatureIds : [],
      updatedAt: new Date().toISOString(),
    };

    writeStorage({
      ...store,
      [normalized.mode]: normalized,
    });

    return normalized;
  },

  reset(mode) {
    const store = { ...readStorage() };
    delete store[mode];
    writeStorage(store);
    emitEvent('profile-reset', { scope: mode });
  },
};
