import { describe, it, expect } from 'vitest';
import { QuestionMode, getDataFilePrefix } from '../values/question-mode.js';

describe('QuestionMode', () => {
  it('JA_ROMAJI と EN_WORD を持つ', () => {
    expect(QuestionMode.JA_ROMAJI).toBe('ja-romaji');
    expect(QuestionMode.EN_WORD).toBe('en-word');
  });

  it('getDataFilePrefix が正しいプレフィックスを返す', () => {
    expect(getDataFilePrefix('ja-romaji')).toBe('ja');
    expect(getDataFilePrefix('en-word')).toBe('en');
  });

  it('getDataFilePrefix は無効な値で null を返す', () => {
    expect(getDataFilePrefix('invalid')).toBeNull();
  });
});
