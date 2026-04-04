import { describe, it, expect } from 'vitest';
import { createGameConfig } from '../values/game-config.js';

describe('createGameConfig', () => {
  it('time-limit/easy の設定を生成する', () => {
    const config = createGameConfig('time-limit', 'easy', 'ja-romaji');
    expect(config.gameMode).toBe('time-limit');
    expect(config.difficulty).toBe('easy');
    expect(config.questionMode).toBe('ja-romaji');
    expect(config.timeLimit).toBe(90);
    expect(config.questionCount).toBe(0);
  });

  it('time-limit/normal の設定を生成する', () => {
    const config = createGameConfig('time-limit', 'normal', 'ja-romaji');
    expect(config.timeLimit).toBe(60);
  });

  it('time-limit/hard の設定を生成する', () => {
    const config = createGameConfig('time-limit', 'hard', 'ja-romaji');
    expect(config.timeLimit).toBe(45);
  });

  it('fixed-count/easy の設定を生成する', () => {
    const config = createGameConfig('fixed-count', 'easy', 'en-word');
    expect(config.timeLimit).toBe(0);
    expect(config.questionCount).toBe(10);
  });

  it('fixed-count/normal -> 15問', () => {
    const config = createGameConfig('fixed-count', 'normal', 'en-word');
    expect(config.questionCount).toBe(15);
  });

  it('fixed-count/hard -> 20問', () => {
    const config = createGameConfig('fixed-count', 'hard', 'en-word');
    expect(config.questionCount).toBe(20);
  });

  it('凍結されたオブジェクトを返す', () => {
    const config = createGameConfig('time-limit', 'easy', 'ja-romaji');
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('無効な gameMode でエラーを投げる', () => {
    expect(() => createGameConfig('invalid', 'easy', 'ja-romaji')).toThrow();
  });

  it('無効な difficulty でエラーを投げる', () => {
    expect(() => createGameConfig('time-limit', 'invalid', 'ja-romaji')).toThrow();
  });
});
