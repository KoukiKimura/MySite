import { mockRecordRepository } from './mock-record-repository.js';

export const mockRankingRepository = {
  getAll({ gameId = 'typing', mode } = {}) {
    return mockRecordRepository
      .list({ gameId, mode })
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.accuracy !== left.accuracy) {
          return right.accuracy - left.accuracy;
        }

        return right.wpm - left.wpm;
      })
      .map((entry, index) => ({
        rank: index + 1,
        userName: entry.userName,
        score: entry.score,
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        date: entry.createdAt,
      }));
  },
};
