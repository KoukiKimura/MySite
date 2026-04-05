import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQuestionProvider } from '../services/question-provider.js';
import { _resetQuestionIdSeq } from '../../domain/entities/question.js';

const mockRepository = {
  fetchQuestions: vi.fn(),
};

const mockRawData = Array.from({ length: 20 }, (_, i) => ({
  display: `word${i}`,
  reading: `word${i}`,
}));

describe('QuestionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetQuestionIdSeq();
    mockRepository.fetchQuestions.mockResolvedValue([...mockRawData]);
  });

  it('fixed-count モードで questionCount 件を返す', async () => {
    const provider = createQuestionProvider(mockRepository);
    const config = {
      gameMode: 'fixed-count',
      difficulty: 'easy',
      questionMode: 'ja-romaji',
      questionCount: 5,
    };
    const questions = await provider.provide(config);
    expect(questions).toHaveLength(5);
  });

  it('time-limit モードで最大 50 件を返す', async () => {
    const provider = createQuestionProvider(mockRepository);
    const config = {
      gameMode: 'time-limit',
      difficulty: 'easy',
      questionMode: 'ja-romaji',
      timeLimit: 60,
    };
    // 20件しかないので 20件
    const questions = await provider.provide(config);
    expect(questions.length).toBeLessThanOrEqual(50);
    expect(questions).toHaveLength(20);
  });

  it('返却された各要素は Question エンティティ', async () => {
    const provider = createQuestionProvider(mockRepository);
    const config = {
      gameMode: 'fixed-count',
      difficulty: 'easy',
      questionMode: 'ja-romaji',
      questionCount: 3,
    };
    const questions = await provider.provide(config);
    for (const q of questions) {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('display');
      expect(q).toHaveProperty('reading');
    }
  });

  it('repository.fetchQuestions が正しい引数で呼ばれる', async () => {
    const provider = createQuestionProvider(mockRepository);
    const config = {
      gameMode: 'fixed-count',
      difficulty: 'hard',
      questionMode: 'en-word',
      questionCount: 3,
    };
    await provider.provide(config);
    expect(mockRepository.fetchQuestions).toHaveBeenCalledWith('en-word', 'hard');
  });
});
