import { isValidGameMode } from '../../domain/values/game-mode.js';
import { getDifficultyById } from '../../domain/values/difficulty.js';
import { createGameSession } from '../../domain/entities/game-session.js';

/**
 * UC-1: ゲーム開始
 *
 * @param {object} deps
 * @param {import('../services/question-provider.js').QuestionProvider} deps.questionProvider
 * @param {object} config - createGameConfig() で生成した設定
 * @returns {Promise<object>} READY 状態の GameSession
 */
export async function startGame({ questionProvider }, config) {
  if (!isValidGameMode(config.gameMode)) {
    throw new Error(`Invalid gameMode: ${config.gameMode}`);
  }
  if (!getDifficultyById(config.difficulty)) {
    throw new Error(`Invalid difficulty: ${config.difficulty}`);
  }

  const questions = await questionProvider.provide(config);
  return createGameSession(config, questions);
}
