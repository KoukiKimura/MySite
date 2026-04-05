import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createJsonQuestionRepository } from '../repositories/json-question-repository.js';

const mockData = {
  questions: [
    { display: 'あ', reading: 'あ' },
    { display: 'い', reading: 'い' },
  ],
};

describe('JsonQuestionRepository', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchQuestions がデータを返す', async () => {
    const repo = createJsonQuestionRepository();
    const questions = await repo.fetchQuestions('ja-romaji', 'easy');
    expect(questions).toEqual(mockData.questions);
  });

  it('同一ファイルは2回目以降キャッシュを使用する', async () => {
    const repo = createJsonQuestionRepository();
    await repo.fetchQuestions('ja-romaji', 'easy');
    await repo.fetchQuestions('ja-romaji', 'easy');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('異なるファイルはそれぞれ fetch する', async () => {
    const repo = createJsonQuestionRepository();
    await repo.fetchQuestions('ja-romaji', 'easy');
    await repo.fetchQuestions('ja-romaji', 'normal');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('fetch 失敗時はエラーを投げる', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const repo = createJsonQuestionRepository();
    await expect(repo.fetchQuestions('ja-romaji', 'easy')).rejects.toThrow('404');
  });
});
