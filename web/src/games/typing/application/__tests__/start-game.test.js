import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startGame } from '../use-cases/start-game.js';
import { _resetQuestionIdSeq } from '../../domain/entities/question.js';

const dummyConfig = {
  gameMode: 'fixed-count',
  difficulty: 'easy',
  questionMode: 'ja-romaji',
  timeLimit: 0,
  questionCount: 3,
};

const dummyRawQuestions = [
  { display: 'あ', reading: 'あ' },
  { display: 'い', reading: 'い' },
  { display: 'う', reading: 'う' },
];

function makeProvider(questions = dummyRawQuestions) {
  return { provide: vi.fn().mockResolvedValue(questions.map((r, i) => ({ id: i + 1, ...r }))) };
}

describe('startGame', () => {
  beforeEach(() => _resetQuestionIdSeq());

  it('READY 状態のセッションを返す', async () => {
    const provider = makeProvider();
    const session = await startGame({ questionProvider: provider }, dummyConfig);
    expect(session.state).toBe('ready');
    expect(session.config).toBe(dummyConfig);
  });

  it('問題リストが設定される', async () => {
    const provider = makeProvider();
    const session = await startGame({ questionProvider: provider }, dummyConfig);
    expect(session.questions).toHaveLength(3);
  });

  it('無効な gameMode でエラーを投げる', async () => {
    const provider = makeProvider();
    await expect(
      startGame({ questionProvider: provider }, { ...dummyConfig, gameMode: 'invalid' })
    ).rejects.toThrow();
  });

  it('無効な difficulty でエラーを投げる', async () => {
    const provider = makeProvider();
    await expect(
      startGame({ questionProvider: provider }, { ...dummyConfig, difficulty: 'invalid' })
    ).rejects.toThrow();
  });
});
