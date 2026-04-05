const COMBO_TABLE = [
  { min: 20, multiplier: 3.0 },
  { min: 10, multiplier: 2.0 },
  { min: 5,  multiplier: 1.5 },
  { min: 0,  multiplier: 1.0 },
];

/**
 * コンボ数に応じた倍率を返す
 */
export function getComboMultiplier(combo) {
  for (const entry of COMBO_TABLE) {
    if (combo >= entry.min) return entry.multiplier;
  }
  return 1.0;
}

/**
 * WPM (Words Per Minute) を計算する
 * @param {number} correctCount - 正解打鍵数
 * @param {number} ms - 経過ミリ秒
 * @returns {number} 小数第1位まで
 */
export function calculateWPM(correctCount, ms) {
  if (ms <= 0) return 0;
  const minutes = ms / 60000;
  return Math.round(((correctCount / 5) / minutes) * 10) / 10;
}

/**
 * 正確率を計算する
 * @param {number} correct - 正解打鍵数
 * @param {number} total - 総打鍵数
 * @returns {number} %表記、小数第1位まで
 */
export function calculateAccuracy(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

const RANK_TABLE = [
  { rank: 'S', accuracy: 98, wpm: 80 },
  { rank: 'A', accuracy: 95, wpm: 60 },
  { rank: 'B', accuracy: 90, wpm: 40 },
  { rank: 'C', accuracy: 80, wpm: 25 },
];

/**
 * ランクを判定する
 */
export function getRank(accuracy, wpm) {
  for (const entry of RANK_TABLE) {
    if (accuracy >= entry.accuracy && wpm >= entry.wpm) return entry.rank;
  }
  return 'D';
}

/**
 * 最終結果を計算する
 * @param {object} session - GameSession エンティティ
 * @param {number} elapsedTime - 実プレイ時間(ms)
 * @returns {Readonly<object>}
 */
export function calculateFinalResult(session, elapsedTime) {
  const totalKeystrokes = session.correctCount + session.missCount;

  // baseScore: 各正解打鍵につき 10 × コンボ倍率（comboHistory から計算）
  // 簡易版: comboHistory がない場合は correctCount × 10 で近似し、maxCombo から推定する
  // 正確な実装は comboHistory を使う
  let baseScore = 0;
  if (session.comboHistory) {
    for (const comboAtHit of session.comboHistory) {
      baseScore += Math.round(10 * getComboMultiplier(comboAtHit));
    }
  } else {
    baseScore = session.correctCount * 10;
  }

  const missPenalty = session.missCount * 5;
  const total = Math.max(0, baseScore - missPenalty);
  const wpm = calculateWPM(session.correctCount, elapsedTime);
  const accuracy = calculateAccuracy(session.correctCount, totalKeystrokes);
  const rank = getRank(accuracy, wpm);

  return Object.freeze({
    baseScore,
    comboBonus: baseScore - (session.correctCount * 10),
    missPenalty,
    total,
    wpm,
    accuracy,
    rank,
    correctCount: session.correctCount,
    missCount: session.missCount,
    maxCombo: session.maxCombo,
    elapsedTime,
  });
}
