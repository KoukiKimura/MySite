import { startGame } from './start-game.js';

/**
 * UC-4: リトライ（同じ設定でゲームを再開）
 *
 * @param {object} deps
 * @param {object} deps.questionProvider
 * @param {object} session - 終了したセッション
 * @returns {Promise<object>} 新しい READY 状態の GameSession
 */
export function retryGame(deps, session) {
  return startGame(deps, session.config);
}
