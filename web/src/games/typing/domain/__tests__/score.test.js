import { describe, it, expect } from 'vitest';
import { createScore, initialScore } from '../values/score.js';

describe('Score', () => {
  it('createScore で合計を計算する', () => {
    const s = createScore(100, 30, 15);
    expect(s.baseScore).toBe(100);
    expect(s.comboBonus).toBe(30);
    expect(s.missPenalty).toBe(15);
    expect(s.total).toBe(115); // 100+30-15
  });

  it('合計が負にならない', () => {
    const s = createScore(10, 0, 100);
    expect(s.total).toBe(0);
  });

  it('凍結されている', () => {
    expect(Object.isFrozen(createScore(10, 0, 0))).toBe(true);
  });

  it('initialScore は全て 0', () => {
    const s = initialScore();
    expect(s.total).toBe(0);
    expect(s.baseScore).toBe(0);
  });
});
