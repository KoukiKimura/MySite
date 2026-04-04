import { describe, it, expect } from 'vitest';
import { Difficulty, getDifficultyById } from '../values/difficulty.js';

describe('Difficulty', () => {
  it('EASY/NORMAL/HARD を持つ', () => {
    expect(Difficulty.EASY.id).toBe('easy');
    expect(Difficulty.NORMAL.id).toBe('normal');
    expect(Difficulty.HARD.id).toBe('hard');
  });

  it('timeBonus が正しい', () => {
    expect(Difficulty.EASY.timeBonus).toBe(1.5);
    expect(Difficulty.NORMAL.timeBonus).toBe(1.0);
    expect(Difficulty.HARD.timeBonus).toBe(0.7);
  });

  it('getDifficultyById で取得できる', () => {
    expect(getDifficultyById('easy')).toBe(Difficulty.EASY);
    expect(getDifficultyById('normal')).toBe(Difficulty.NORMAL);
    expect(getDifficultyById('hard')).toBe(Difficulty.HARD);
  });

  it('getDifficultyById で無効な ID は null を返す', () => {
    expect(getDifficultyById('unknown')).toBeNull();
  });
});
