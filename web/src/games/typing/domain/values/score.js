export function createScore(baseScore, comboBonus, missPenalty) {
  const total = Math.max(0, baseScore + comboBonus - missPenalty);
  return Object.freeze({ baseScore, comboBonus, missPenalty, total });
}

export function initialScore() {
  return createScore(0, 0, 0);
}
