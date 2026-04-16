import { emitEvent } from '../../shared/events.js';

const STORAGE_KEY = 'penguin-game-records';

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

export const mockRecordRepository = {
  list({ gameId, mode, includeDeleted = false } = {}) {
    return readStorage()
      .filter(entry => (gameId ? entry.gameId === gameId : true))
      .filter(entry => (mode ? (entry.siteMode ?? entry.mode) === mode : true))
      .filter(entry => (includeDeleted ? true : !entry.deletedAt))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  save(record) {
    const normalized = {
      id: `record-${Date.now()}`,
      gameId: record.gameId ?? 'typing',
      gameMode: record.gameMode ?? 'standard',
      siteMode: record.siteMode ?? record.mode ?? 'kids',
      userName: record.userName ?? 'ゲスト',
      score: Number(record.score ?? 0),
      wpm: Number(record.wpm ?? 0),
      accuracy: Number(record.accuracy ?? 0),
      rankSnapshot: record.rankSnapshot ?? null,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };

    const entries = readStorage();
    entries.push(normalized);
    writeStorage(entries);
    emitEvent('ranking-update', { gameId: normalized.gameId, mode: normalized.siteMode });
    return normalized;
  },

  getBest({ gameId, mode, userName } = {}) {
    return this.list({ gameId, mode })
      .filter(entry => (userName ? entry.userName === userName : true))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.accuracy !== left.accuracy) {
          return right.accuracy - left.accuracy;
        }

        return right.wpm - left.wpm;
      })[0] ?? null;
  },

  softDelete(id) {
    const entries = readStorage().map(entry => {
      if (entry.id !== id || entry.deletedAt) {
        return entry;
      }

      return {
        ...entry,
        deletedAt: new Date().toISOString(),
      };
    });

    writeStorage(entries);
    return entries.find(entry => entry.id === id) ?? null;
  },
};
