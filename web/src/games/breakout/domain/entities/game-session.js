import { calculateBlockScore } from '../services/score-calculator.js';
import { countRemainingBlocks, hasRemainingBlocks, markBlockDestroyed } from './stage-state.js';

export const SessionState = Object.freeze({
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
});

export function createGameSession(stages, options = {}) {
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error('Stages are required');
  }

  const maxLives = Number.isInteger(options.maxLives) ? options.maxLives : 3;

  if (maxLives <= 0) {
    throw new Error(`Invalid maxLives: ${maxLives}`);
  }

  return {
    state: SessionState.READY,
    stages: [...stages],
    stageIndex: 0,
    currentStage: stages[0],
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: maxLives,
    maxLives,
    startedAt: null,
    finishedAt: null,
    clearedStageIds: [],
    result: null,
  };
}

export function startSession(session) {
  if (session.state !== SessionState.READY) {
    throw new Error(`Cannot start from state: ${session.state}`);
  }

  session.state = SessionState.PLAYING;
  session.startedAt = Date.now();
}

export function pauseSession(session) {
  if (session.state !== SessionState.PLAYING) {
    throw new Error(`Cannot pause from state: ${session.state}`);
  }

  session.state = SessionState.PAUSED;
}

export function resumeSession(session) {
  if (session.state !== SessionState.PAUSED) {
    throw new Error(`Cannot resume from state: ${session.state}`);
  }

  session.state = SessionState.PLAYING;
}

export function getCurrentStage(session) {
  return session.currentStage;
}

export function recordBlockDestroyed(session, blockId) {
  const destroyed = markBlockDestroyed(session.currentStage, blockId);

  if (!destroyed) {
    return {
      destroyed: false,
      scoreDelta: 0,
      combo: session.combo,
      remainingBlocks: countRemainingBlocks(session.currentStage),
      stageCleared: false,
    };
  }

  const scoreDelta = calculateBlockScore(session.combo);
  session.score += scoreDelta;
  session.combo += 1;
  session.maxCombo = Math.max(session.maxCombo, session.combo);

  return {
    destroyed: true,
    scoreDelta,
    combo: session.combo,
    remainingBlocks: countRemainingBlocks(session.currentStage),
    stageCleared: !hasRemainingBlocks(session.currentStage),
  };
}

export function recordPaddleBounce(session) {
  session.combo = 0;
}

export function loseBall(session) {
  if (session.state === SessionState.FINISHED) {
    return { gameOver: true, lives: session.lives, result: session.result };
  }

  session.combo = 0;
  session.lives = Math.max(0, session.lives - 1);

  if (session.lives === 0) {
    return {
      gameOver: true,
      lives: session.lives,
      result: finishSession(session, 'game-over'),
    };
  }

  return {
    gameOver: false,
    lives: session.lives,
    result: null,
  };
}

export function advanceStage(session) {
  const stageId = session.currentStage?.id;

  if (stageId && !session.clearedStageIds.includes(stageId)) {
    session.clearedStageIds.push(stageId);
  }

  session.combo = 0;

  if (session.stageIndex >= session.stages.length - 1) {
    return {
      hasNext: false,
      finished: true,
      result: finishSession(session, 'game-clear'),
    };
  }

  session.stageIndex += 1;
  session.currentStage = session.stages[session.stageIndex];

  return {
    hasNext: true,
    finished: false,
    stage: session.currentStage,
  };
}

export function finishSession(session, resultType) {
  if (session.state === SessionState.FINISHED && session.result) {
    return session.result;
  }

  session.state = SessionState.FINISHED;
  session.finishedAt = Date.now();
  session.result = {
    type: resultType,
    score: session.score,
    maxCombo: session.maxCombo,
    remainingLives: session.lives,
    reachedStageId: session.currentStage?.id ?? null,
    clearedStageIds: [...session.clearedStageIds],
    clearedStageCount: session.clearedStageIds.length,
    totalStages: session.stages.length,
    finishedAt: session.finishedAt,
  };

  return session.result;
}

