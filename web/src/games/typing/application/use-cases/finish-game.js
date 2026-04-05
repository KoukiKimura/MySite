import { finishSession, getElapsedTime } from '../../domain/entities/game-session.js';
import { calculateFinalResult } from '../../domain/services/score-calculator.js';
import { SessionState } from '../../domain/entities/game-session.js';

/**
 * UC-3: ゲーム終了
 *
 * @param {object} session - 現在の GameSession
 * @returns {Readonly<object>} 最終結果オブジェクト
 */
export function finishGame(session) {
  // 既に FINISHED の場合はそのままスコアを計算する
  if (session.state !== SessionState.FINISHED) {
    finishSession(session);
  }
  const elapsed = getElapsedTime(session);
  return calculateFinalResult(session, elapsed);
}
