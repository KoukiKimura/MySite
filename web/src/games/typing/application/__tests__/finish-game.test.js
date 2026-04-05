import { describe, it, expect, beforeEach } from 'vitest';
import { finishGame } from '../use-cases/finish-game.js';
import { createGameSession, startSession, recordCorrect } from '../../domain/entities/game-session.js';
import { _resetQuestionIdSeq } from '../../domain/entities/question.js';

const config = {
  gameMode: 'fixed-count',
  difficulty: 'easy',
  questionMode: 'ja-romaji',
  timeLimit: 0,
  questionCount: 1,
};
const questions = [{ id: 1, display: 'あ', reading: 'あ' }];

describe('finishGame', () => {
  beforeEach(() => _resetQuestionIdSeq());

  it('最終結果を返す', () => {
    const session = createGameSession(config, questions);
    startSession(session);
    recordCorrect(session);

    const result = finishGame(session);
    expect(result.correctCount).toBe(1);
    expect(result.rank).toBeDefined();
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('既に FINISHED でも結果を返す', () => {
    const session = createGameSession(config, questions);
    startSession(session);
    finishGame(session); // 1回め
    const result = finishGame(session); // 2回め（FINISHED 状態）
    expect(result).toBeDefined();
  });
});
