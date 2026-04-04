export const SessionState = Object.freeze({
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
});

/**
 * ゲームセッションエンティティを生成する（可変オブジェクト）
 * @param {object} config - createGameConfig() で生成した設定
 * @param {object[]} questions - createQuestion() で生成した問題配列
 */
export function createGameSession(config, questions) {
  return {
    config,
    questions: [...questions],
    state: SessionState.READY,
    currentIndex: 0,
    correctCount: 0,
    missCount: 0,
    combo: 0,
    maxCombo: 0,
    comboHistory: [],
    startTime: null,
    endTime: null,
    pausedTime: 0,
    _pauseStart: null,
  };
}

export function startSession(session) {
  if (session.state !== SessionState.READY) {
    throw new Error(`Cannot start from state: ${session.state}`);
  }
  session.state = SessionState.PLAYING;
  session.startTime = Date.now();
}

export function pauseSession(session) {
  if (session.state !== SessionState.PLAYING) {
    throw new Error(`Cannot pause from state: ${session.state}`);
  }
  session.state = SessionState.PAUSED;
  session._pauseStart = Date.now();
}

export function resumeSession(session) {
  if (session.state !== SessionState.PAUSED) {
    throw new Error(`Cannot resume from state: ${session.state}`);
  }
  session.pausedTime += Date.now() - session._pauseStart;
  session._pauseStart = null;
  session.state = SessionState.PLAYING;
}

export function finishSession(session) {
  if (session.state !== SessionState.PLAYING && session.state !== SessionState.PAUSED) {
    throw new Error(`Cannot finish from state: ${session.state}`);
  }
  if (session.state === SessionState.PAUSED) {
    session.pausedTime += Date.now() - session._pauseStart;
    session._pauseStart = null;
  }
  session.state = SessionState.FINISHED;
  session.endTime = Date.now();
}

export function recordCorrect(session) {
  session.comboHistory.push(session.combo);
  session.correctCount += 1;
  session.combo += 1;
  if (session.combo > session.maxCombo) {
    session.maxCombo = session.combo;
  }
}

export function recordMiss(session) {
  session.missCount += 1;
  session.combo = 0;
}

export function advanceQuestion(session) {
  session.currentIndex += 1;
}

export function getCurrentQuestion(session) {
  return session.questions[session.currentIndex] ?? null;
}

/**
 * セッション終了条件の判定
 * - time-limit: 外部タイマーで判定するため常に false
 * - fixed-count: currentIndex が questionCount 以上なら true
 */
export function shouldFinish(session) {
  if (session.config.gameMode === 'fixed-count') {
    return session.currentIndex >= session.config.questionCount;
  }
  return false;
}

/** 実プレイ時間（ミリ秒）を返す */
export function getElapsedTime(session) {
  const end = session.endTime ?? Date.now();
  return end - session.startTime - session.pausedTime;
}
