import { describe, it, expect, beforeEach } from 'vitest';
import { createQuestion, _resetQuestionIdSeq } from '../entities/question.js';

describe('Question', () => {
  beforeEach(() => _resetQuestionIdSeq());

  it('連番 ID を付与する', () => {
    const q1 = createQuestion({ display: 'りんご', reading: 'りんご' });
    const q2 = createQuestion({ display: 'みかん', reading: 'みかん' });
    expect(q1.id).toBe(1);
    expect(q2.id).toBe(2);
  });

  it('display と reading を保持する', () => {
    const q = createQuestion({ display: 'apple', reading: 'apple' });
    expect(q.display).toBe('apple');
    expect(q.reading).toBe('apple');
  });

  it('凍結されている', () => {
    const q = createQuestion({ display: 'a', reading: 'a' });
    expect(Object.isFrozen(q)).toBe(true);
  });
});
