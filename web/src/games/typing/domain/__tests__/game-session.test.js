import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGameSession,
  startSession,
  pauseSession,
  resumeSession,
  finishSession,
  recordCorrect,
  recordMiss,
  advanceQuestion,
  getCurrentQuestion,
  shouldFinish,
  getElapsedTime,
  SessionState,
} from '../entities/game-session.js';

const dummyConfig = { gameMode: 'fixed-count', difficulty: 'easy', questionMode: 'ja-romaji', timeLimit: 0, questionCount: 3 };
const dummyQuestions = [
  { id: 1, display: 'あ', reading: 'あ' },
  { id: 2, display: 'い', reading: 'い' },
  { id: 3, display: 'う', reading: 'う' },
];

describe('GameSession', () => {
  let session;
  beforeEach(() => {
    session = createGameSession(dummyConfig, dummyQuestions);
  });

  it('初期状態は READY', () => {
    expect(session.state).toBe(SessionState.READY);
    expect(session.correctCount).toBe(0);
    expect(session.missCount).toBe(0);
    expect(session.combo).toBe(0);
  });

  it('startSession で PLAYING になる', () => {
    startSession(session);
    expect(session.state).toBe(SessionState.PLAYING);
    expect(session.startTime).not.toBeNull();
  });

  it('PLAYING でない状態から start するとエラー', () => {
    startSession(session);
    expect(() => startSession(session)).toThrow();
  });

  it('pauseSession/resumeSession の遷移', () => {
    startSession(session);
    pauseSession(session);
    expect(session.state).toBe(SessionState.PAUSED);
    resumeSession(session);
    expect(session.state).toBe(SessionState.PLAYING);
  });

  it('finishSession で FINISHED になる', () => {
    startSession(session);
    finishSession(session);
    expect(session.state).toBe(SessionState.FINISHED);
    expect(session.endTime).not.toBeNull();
  });

  it('recordCorrect でカウントとコンボが増える', () => {
    startSession(session);
    recordCorrect(session);
    expect(session.correctCount).toBe(1);
    expect(session.combo).toBe(1);
    expect(session.maxCombo).toBe(1);
  });

  it('recordCorrect で comboHistory に記録される', () => {
    startSession(session);
    recordCorrect(session);
    recordCorrect(session);
    // comboHistory[0] は 0コンボ時の打鍵、[1] は 1コンボ時
    expect(session.comboHistory).toEqual([0, 1]);
  });

  it('recordMiss でコンボがリセットされる', () => {
    startSession(session);
    recordCorrect(session);
    recordCorrect(session);
    recordMiss(session);
    expect(session.missCount).toBe(1);
    expect(session.combo).toBe(0);
    expect(session.maxCombo).toBe(2);
  });

  it('getCurrentQuestion が現在の問題を返す', () => {
    expect(getCurrentQuestion(session)).toBe(dummyQuestions[0]);
    advanceQuestion(session);
    expect(getCurrentQuestion(session)).toBe(dummyQuestions[1]);
  });

  it('shouldFinish は questionCount 以上で true', () => {
    expect(shouldFinish(session)).toBe(false);
    session.currentIndex = 3;
    expect(shouldFinish(session)).toBe(true);
  });

  it('time-limit モードは shouldFinish が false', () => {
    const timeLimitConfig = { ...dummyConfig, gameMode: 'time-limit' };
    const s = createGameSession(timeLimitConfig, dummyQuestions);
    s.currentIndex = 100;
    expect(shouldFinish(s)).toBe(false);
  });

  it('getElapsedTime が正の値を返す', async () => {
    startSession(session);
    await new Promise((r) => setTimeout(r, 10));
    finishSession(session);
    expect(getElapsedTime(session)).toBeGreaterThan(0);
  });
});
