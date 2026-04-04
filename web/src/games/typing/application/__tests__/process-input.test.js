import { describe, it, expect, beforeEach } from 'vitest';
import { processInput } from '../use-cases/process-input.js';
import { createGameSession, startSession } from '../../domain/entities/game-session.js';
import { buildMatchData } from '../../domain/services/romaji-converter.js';
import { createRomajiInput } from '../../domain/values/romaji-input.js';
import { _resetQuestionIdSeq } from '../../domain/entities/question.js';

const fixedConfig = {
  gameMode: 'fixed-count',
  difficulty: 'easy',
  questionMode: 'ja-romaji',
  timeLimit: 0,
  questionCount: 2,
};

function makeSession(questions) {
  const session = createGameSession(fixedConfig, questions);
  startSession(session);
  return session;
}

describe('processInput', () => {
  beforeEach(() => _resetQuestionIdSeq());

  it('ミス入力 → result=miss, コンボ0', () => {
    const questions = [
      { id: 1, display: 'あ', reading: 'あ' },
      { id: 2, display: 'い', reading: 'い' },
    ];
    const session = makeSession(questions);
    const matchData = buildMatchData('あ');
    const input = createRomajiInput(matchData[0].kana, matchData[0].patterns);

    const r = processInput(session, input, matchData, 0, 'z');
    expect(r.result).toBe('miss');
    expect(session.missCount).toBe(1);
    expect(session.combo).toBe(0);
  });

  it('正解入力（チャンク未完了）→ result=correct', () => {
    const questions = [
      { id: 1, display: 'か', reading: 'か' },
      { id: 2, display: 'い', reading: 'い' },
    ];
    const session = makeSession(questions);
    const matchData = buildMatchData('か');
    const input = createRomajiInput(matchData[0].kana, matchData[0].patterns);

    // 'k' だけ入力（ka の途中）
    const r = processInput(session, input, matchData, 0, 'k');
    expect(r.result).toBe('correct');
    expect(r.isNewQuestion).toBe(false);
    expect(session.correctCount).toBe(1);
  });

  it('チャンク完了→次問→result=complete', () => {
    const questions = [
      { id: 1, display: 'あ', reading: 'あ' },
      { id: 2, display: 'い', reading: 'い' },
    ];
    const session = makeSession(questions);
    const matchData = buildMatchData('あ');
    const input = createRomajiInput(matchData[0].kana, matchData[0].patterns);

    const r = processInput(session, input, matchData, 0, 'a');
    expect(r.result).toBe('complete');
    expect(r.isNewQuestion).toBe(true);
    expect(session.currentIndex).toBe(1);
  });

  it('最後の問題完了 → result=finish', () => {
    const singleConfig = { ...fixedConfig, questionCount: 1 };
    const questions = [
      { id: 1, display: 'あ', reading: 'あ' },
    ];
    const session = createGameSession(singleConfig, questions);
    startSession(session);
    const matchData = buildMatchData('あ');
    const input = createRomajiInput(matchData[0].kana, matchData[0].patterns);

    const r = processInput(session, input, matchData, 0, 'a');
    expect(r.result).toBe('finish');
    expect(r.finalResult).not.toBeNull();
    expect(session.state).toBe('finished');
  });

  it('多チャンク問題を順に入力できる', () => {
    const questions = [
      { id: 1, display: 'か', reading: 'か' },
      { id: 2, display: 'さ', reading: 'さ' },
    ];
    const session = makeSession(questions);
    const matchData = buildMatchData('か');
    let input = createRomajiInput(matchData[0].kana, matchData[0].patterns);

    // 'k' → accepted='k', result=correct
    let r = processInput(session, input, matchData, 0, 'k');
    expect(r.result).toBe('correct');
    // 'a' → complete
    r = processInput(session, r.input, matchData, 0, 'a');
    expect(r.result).toBe('complete');
  });
});
