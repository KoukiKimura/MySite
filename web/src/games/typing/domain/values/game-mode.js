export const GameMode = Object.freeze({
  TIME_LIMIT:  'time-limit',
  FIXED_COUNT: 'fixed-count',
});

export function isValidGameMode(value) {
  return Object.values(GameMode).includes(value);
}
