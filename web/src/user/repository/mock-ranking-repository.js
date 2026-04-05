const DUMMY_RANKINGS = [
  { rank: 1, userName: 'ペンギン太郎', score: 9800, wpm: 85.2, accuracy: 98.5, difficulty: 'normal', date: '2026-04-01' },
  { rank: 2, userName: 'ペンギン花子', score: 8500, wpm: 72.1, accuracy: 95.3, difficulty: 'normal', date: '2026-04-02' },
  { rank: 3, userName: 'タイピング王', score: 7800, wpm: 68.4, accuracy: 93.1, difficulty: 'hard', date: '2026-04-01' },
  { rank: 4, userName: 'ゲーマーA', score: 6500, wpm: 55.0, accuracy: 90.2, difficulty: 'normal', date: '2026-03-30' },
  { rank: 5, userName: 'ゲーマーB', score: 5200, wpm: 48.3, accuracy: 88.7, difficulty: 'easy', date: '2026-03-28' },
];

export const mockRankingRepository = {
  async getAll() {
    const stored = sessionStorage.getItem('penguin-games-rankings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DUMMY_RANKINGS;
      }
    }
    return DUMMY_RANKINGS;
  },

  async save(entry) {
    let rankings = await this.getAll();
    rankings.push(entry);
    rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.map((r, i) => ({ ...r, rank: i + 1 }));
    rankings = rankings.slice(0, 50);
    sessionStorage.setItem('penguin-games-rankings', JSON.stringify(rankings));
  },
};
