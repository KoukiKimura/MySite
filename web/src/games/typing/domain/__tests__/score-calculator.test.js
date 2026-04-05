import { describe, it, expect } from 'vitest';
import {
  getComboMultiplier,
  calculateWPM,
  calculateAccuracy,
  getRank,
  calculateFinalResult,
} from '../services/score-calculator.js';

describe('getComboMultiplier', () => {
  it('0-4コンボ -> x1.0', () => {
    expect(getComboMultiplier(0)).toBe(1.0);
    expect(getComboMultiplier(4)).toBe(1.0);
  });
  it('5-9コンボ -> x1.5', () => {
    expect(getComboMultiplier(5)).toBe(1.5);
    expect(getComboMultiplier(9)).toBe(1.5);
  });
  it('10-19コンボ -> x2.0', () => {
    expect(getComboMultiplier(10)).toBe(2.0);
    expect(getComboMultiplier(19)).toBe(2.0);
  });
  it('20以上 -> x3.0', () => {
    expect(getComboMultiplier(20)).toBe(3.0);
    expect(getComboMultiplier(100)).toBe(3.0);
  });
});

describe('calculateWPM', () => {
  it('0ms は 0 を返す', () => {
    expect(calculateWPM(100, 0)).toBe(0);
  });
  it('60秒で 50打鍵 -> WPM = 10.0', () => {
    // (50/5) / (60000/60000) = 10 / 1 = 10.0
    expect(calculateWPM(50, 60000)).toBe(10.0);
  });
  it('30秒で 100打鍵 -> WPM = 40.0', () => {
    // (100/5) / (30000/60000) = 20 / 0.5 = 40.0
    expect(calculateWPM(100, 30000)).toBe(40.0);
  });
});

describe('calculateAccuracy', () => {
  it('総打鍵 0 は 0 を返す', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
  it('100打鍵すべて正解 -> 100.0%', () => {
    expect(calculateAccuracy(100, 100)).toBe(100.0);
  });
  it('90/100 -> 90.0%', () => {
    expect(calculateAccuracy(90, 100)).toBe(90.0);
  });
  it('小数第1位まで', () => {
    // 9/10 = 90.0, 1/3 ≈ 33.3
    expect(calculateAccuracy(1, 3)).toBeCloseTo(33.3, 1);
  });
});

describe('getRank', () => {
  it('S ランク: acc>=98 and wpm>=80', () => {
    expect(getRank(98, 80)).toBe('S');
    expect(getRank(100, 100)).toBe('S');
  });
  it('A ランク', () => {
    expect(getRank(95, 60)).toBe('A');
  });
  it('B ランク', () => {
    expect(getRank(90, 40)).toBe('B');
  });
  it('C ランク', () => {
    expect(getRank(80, 25)).toBe('C');
  });
  it('D ランク: 条件を満たさない', () => {
    expect(getRank(70, 20)).toBe('D');
    expect(getRank(98, 10)).toBe('D'); // wpm不足
  });
});

describe('calculateFinalResult', () => {
  it('基本的な結果を計算する', () => {
    const session = {
      correctCount: 20,
      missCount: 2,
      maxCombo: 10,
      comboHistory: Array(20).fill(0), // 全てコンボ0 -> 倍率x1.0
    };
    const elapsedTime = 30000; // 30秒
    const result = calculateFinalResult(session, elapsedTime);

    expect(result.baseScore).toBe(200); // 20 * 10 * 1.0
    expect(result.missPenalty).toBe(10); // 2 * 5
    expect(result.total).toBe(190);
    expect(result.correctCount).toBe(20);
    expect(result.missCount).toBe(2);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('合計が負にならない', () => {
    const session = {
      correctCount: 1,
      missCount: 100,
      maxCombo: 0,
      comboHistory: [0],
    };
    const result = calculateFinalResult(session, 60000);
    expect(result.total).toBe(0);
  });
});
