import { emitEvent } from '../../shared/events.js';

export const mockAuthRepository = {
  async login(name) {
    const user = {
      id: 'user-' + Date.now(),
      name: name,
    };
    sessionStorage.setItem('penguin-games-auth', JSON.stringify(user));
    emitEvent('auth-change', { user });
    return { success: true, user };
  },

  async logout() {
    sessionStorage.removeItem('penguin-games-auth');
    emitEvent('auth-change', { user: null });
  },

  getCurrentUser() {
    const authJson = sessionStorage.getItem('penguin-games-auth');
    if (!authJson) return null;
    try {
      return JSON.parse(authJson);
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },
};
