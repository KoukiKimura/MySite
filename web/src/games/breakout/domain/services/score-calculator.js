export const BASE_BLOCK_SCORE = 100;
export const COMBO_BONUS_STEP = 25;

export function calculateBlockScore(currentCombo) {
  if (!Number.isInteger(currentCombo) || currentCombo < 0) {
    throw new Error(`Invalid combo value: ${currentCombo}`);
  }

  return BASE_BLOCK_SCORE + currentCombo * COMBO_BONUS_STEP;
}

