import { describe, expect, it } from 'vitest';
import {
  SessionState,
  advanceStage,
  createGameSession,
  loseBall,
  pauseSession,
  recordBlockDestroyed,
  recordPaddleBounce,
  resumeSession,
  startSession,
} from '../entities/game-session.js';
import { createStageState } from '../entities/stage-state.js';

function makeStage(id, rows) {
  return createStageState({
    id,
    label: `STAGE ${id}`,
    ballSpeed: 320,
    paddleWidth: 148,
    rows,
    theme: {
      backgroundTop: '#000',
      backgroundBottom: '#111',
      block: '#222',
      blockAlt: '#333',
      accent: '#444',
      frame: '#555',
    },
  });
}

describe('GameSession', () => {
  it('初期状態は READY', () => {
    const session = createGameSession([makeStage('1-1', ['11'])]);
    expect(session.state).toBe(SessionState.READY);
    expect(session.lives).toBe(3);
    expect(session.score).toBe(0);
  });

  it('start / pause / resume の状態遷移ができる', () => {
    const session = createGameSession([makeStage('1-1', ['11'])]);
    startSession(session);
    expect(session.state).toBe(SessionState.PLAYING);
    pauseSession(session);
    expect(session.state).toBe(SessionState.PAUSED);
    resumeSession(session);
    expect(session.state).toBe(SessionState.PLAYING);
  });

  it('ブロック破壊でスコアとコンボが増える', () => {
    const stage = makeStage('1-1', ['11']);
    const session = createGameSession([stage]);
    startSession(session);

    const first = recordBlockDestroyed(session, stage.blocks[0].id);
    const second = recordBlockDestroyed(session, stage.blocks[1].id);

    expect(first.scoreDelta).toBe(100);
    expect(second.scoreDelta).toBe(125);
    expect(session.score).toBe(225);
    expect(session.combo).toBe(2);
    expect(session.maxCombo).toBe(2);
  });

  it('バー接触でコンボがリセットされる', () => {
    const stage = makeStage('1-1', ['11']);
    const session = createGameSession([stage]);
    startSession(session);

    recordBlockDestroyed(session, stage.blocks[0].id);
    expect(session.combo).toBe(1);
    recordPaddleBounce(session);
    expect(session.combo).toBe(0);
  });

  it('残機 0 でゲームオーバーになる', () => {
    const session = createGameSession([makeStage('1-1', ['11'])], { maxLives: 1 });
    startSession(session);

    const result = loseBall(session);

    expect(result.gameOver).toBe(true);
    expect(session.state).toBe(SessionState.FINISHED);
    expect(session.result.type).toBe('game-over');
  });

  it('ステージ進行で次ステージへ進む', () => {
    const session = createGameSession([
      makeStage('1-1', ['1']),
      makeStage('1-2', ['1']),
    ]);
    startSession(session);

    const result = advanceStage(session);

    expect(result.hasNext).toBe(true);
    expect(session.currentStage.id).toBe('1-2');
    expect(session.clearedStageIds).toEqual(['1-1']);
  });

  it('最終ステージ後はゲームクリアになる', () => {
    const session = createGameSession([makeStage('1-5', ['1'])]);
    startSession(session);

    const result = advanceStage(session);

    expect(result.finished).toBe(true);
    expect(session.state).toBe(SessionState.FINISHED);
    expect(session.result.type).toBe('game-clear');
    expect(session.result.clearedStageIds).toEqual(['1-5']);
  });
});

