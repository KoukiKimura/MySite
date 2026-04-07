import { describe, expect, it } from 'vitest';
import { calculateBlockScore } from '../services/score-calculator.js';

describe('calculateBlockScore', () => {
  it('コンボ 0 は基本点 100 点', () => {
    expect(calculateBlockScore(0)).toBe(100);
  });

  it('コンボ 3 はボーナス込み 175 点', () => {
    expect(calculateBlockScore(3)).toBe(175);
  });

  it('負のコンボはエラー', () => {
    expect(() => calculateBlockScore(-1)).toThrow();
  });
});

