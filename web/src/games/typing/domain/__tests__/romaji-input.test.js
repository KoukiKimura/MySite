import { describe, it, expect } from 'vitest';
import { createRomajiInput, advanceRomajiInput } from '../values/romaji-input.js';

describe('RomajiInput', () => {
  it('初期状態を生成する', () => {
    const input = createRomajiInput('か', ['ka']);
    expect(input.kana).toBe('か');
    expect(input.accepted).toBe('');
    expect(input.candidates).toEqual(['ka']);
  });

  it('正しい入力で進む', () => {
    const input = createRomajiInput('か', ['ka']);
    const { ok, next } = advanceRomajiInput(input, 'k');
    expect(ok).toBe(true);
    expect(next.accepted).toBe('k');
    expect(next.candidates).toEqual(['ka']);
  });

  it('完全一致で completed=true', () => {
    const input = createRomajiInput('か', ['ka']);
    const r1 = advanceRomajiInput(input, 'k');
    const r2 = advanceRomajiInput(r1.next, 'a');
    expect(r2.ok).toBe(true);
    expect(r2.completed).toBe(true);
  });

  it('不正な入力で ok=false', () => {
    const input = createRomajiInput('か', ['ka']);
    const { ok, next } = advanceRomajiInput(input, 'z');
    expect(ok).toBe(false);
    expect(next).toBe(input); // 元のまま
  });

  it('複数候補の絞り込み', () => {
    const input = createRomajiInput('し', ['si', 'shi', 'ci']);
    const r1 = advanceRomajiInput(input, 's');
    expect(r1.ok).toBe(true);
    expect(r1.next.candidates).toEqual(['si', 'shi']);

    const r2 = advanceRomajiInput(r1.next, 'i');
    expect(r2.ok).toBe(true);
    expect(r2.completed).toBe(true);
  });

  it('shi ルートも完了する', () => {
    const input = createRomajiInput('し', ['si', 'shi', 'ci']);
    let current = input;
    for (const ch of 'shi') {
      const r = advanceRomajiInput(current, ch);
      expect(r.ok).toBe(true);
      current = r.next;
    }
    // 'shi' 完走後 completed
    const lastResult = advanceRomajiInput(
      advanceRomajiInput(advanceRomajiInput(input, 's').next, 'h').next,
      'i'
    );
    expect(lastResult.completed).toBe(true);
  });

  it('凍結されている', () => {
    const input = createRomajiInput('か', ['ka']);
    expect(Object.isFrozen(input)).toBe(true);
    const { next } = advanceRomajiInput(input, 'k');
    expect(Object.isFrozen(next)).toBe(true);
  });
});
