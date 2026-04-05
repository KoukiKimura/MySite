export const Difficulty = Object.freeze({
  EASY: {
    id: 'easy',
    label: '初級',
    star: '★☆☆',
    timeBonus: 1.5,
    questionLength: { min: 2, max: 4 },
  },
  NORMAL: {
    id: 'normal',
    label: '中級',
    star: '★★☆',
    timeBonus: 1.0,
    questionLength: { min: 3, max: 8 },
  },
  HARD: {
    id: 'hard',
    label: '上級',
    star: '★★★',
    timeBonus: 0.7,
    questionLength: { min: 5, max: 15 },
  },
});

export function getDifficultyById(id) {
  return Object.values(Difficulty).find(d => d.id === id) ?? null;
}
