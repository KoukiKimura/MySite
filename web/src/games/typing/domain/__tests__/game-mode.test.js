import { describe, it, expect } from 'vitest';
import { GameMode, isValidGameMode } from '../values/game-mode.js';

describe('GameMode', () => {
  it('TIME_LIMIT と FIXED_COUNT を持つ', () => {
    expect(GameMode.TIME_LIMIT).toBe('time-limit');
    expect(GameMode.FIXED_COUNT).toBe('fixed-count');
  });

  it('isValidGameMode は有効な値で true を返す', () => {
    expect(isValidGameMode('time-limit')).toBe(true);
    expect(isValidGameMode('fixed-count')).toBe(true);
  });

  it('isValidGameMode は無効な値で false を返す', () => {
    expect(isValidGameMode('invalid')).toBe(false);
    expect(isValidGameMode('')).toBe(false);
  });
});
