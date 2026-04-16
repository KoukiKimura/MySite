import { emitEvent } from '../../shared/events.js';

const STORAGE_KEY = 'penguin-games-auth';

function readUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export const mockAuthRepository = {
  async login({ name, favoriteMode = 'kids' }) {
    const trimmedName = String(name ?? '').trim();
    if (!trimmedName) {
      return { success: false, user: null };
    }

    const user = {
      id: 'user-' + Date.now(),
      name: trimmedName,
      favoriteMode,
      lastLoginAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    emitEvent('auth-change', { user });
    return { success: true, user };
  },

  async logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    emitEvent('auth-change', { user: null });
  },

  getCurrentUser() {
    return readUser();
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },
};
