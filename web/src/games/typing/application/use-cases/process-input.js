import { advanceRomajiInput, createRomajiInput } from '../../domain/values/romaji-input.js';
import {
  recordCorrect,
  recordMiss,
  advanceQuestion,
  getCurrentQuestion,
  shouldFinish,
  finishSession,
  getElapsedTime,
} from '../../domain/entities/game-session.js';
import { buildMatchData } from '../../domain/services/romaji-converter.js';
import { calculateFinalResult } from '../../domain/services/score-calculator.js';

/**
 * UC-2: キー入力処理
 *
 * @param {object} session - 現在の GameSession
 * @param {object} currentInput - 現在のかなチャンクの RomajiInput
 * @param {object[]} matchData - buildMatchData() で生成した照合データ（現在の問題）
 * @param {number} chunkIndex - 現在のかなチャンクのインデックス
 * @param {string} key - 入力キー (1文字の英字、小文字)
 *
 * @returns {{
 *   session: object,
 *   input: object,
 *   matchData: object[],
 *   chunkIndex: number,
 *   result: 'correct'|'miss'|'complete'|'finish',
 *   isNewQuestion: boolean,
 *   finalResult: object|null,
 * }}
 */
export function processInput(session, currentInput, matchData, chunkIndex, key) {
  const { ok, next, completed } = advanceRomajiInput(currentInput, key);

  if (!ok) {
    recordMiss(session);
    return {
      session,
      input: currentInput,
      matchData,
      chunkIndex,
      result: 'miss',
      isNewQuestion: false,
      finalResult: null,
    };
  }

  // 入力は受理された
  recordCorrect(session);

  if (!completed) {
    // かなチャンク未完了 → 入力を続ける
    return {
      session,
      input: next,
      matchData,
      chunkIndex,
      result: 'correct',
      isNewQuestion: false,
      finalResult: null,
    };
  }

  // かなチャンク完了
  const nextChunkIndex = chunkIndex + 1;

  if (nextChunkIndex < matchData.length) {
    // 同問題の次チャンクへ
    const nextChunk = matchData[nextChunkIndex];
    const nextInput = createRomajiInput(nextChunk.kana, nextChunk.patterns);
    return {
      session,
      input: nextInput,
      matchData,
      chunkIndex: nextChunkIndex,
      result: 'correct',
      isNewQuestion: false,
      finalResult: null,
    };
  }

  // 1問完了 → 次の問題へ
  advanceQuestion(session);

  if (shouldFinish(session)) {
    finishSession(session);
    const elapsed = getElapsedTime(session);
    const finalResult = calculateFinalResult(session, elapsed);
    return {
      session,
      input: null,
      matchData: null,
      chunkIndex: 0,
      result: 'finish',
      isNewQuestion: false,
      finalResult,
    };
  }

  // 次の問題を準備
  const nextQuestion = getCurrentQuestion(session);
  if (!nextQuestion) {
    // 全問題を出題し終えた (time-limit モードで時間が余っている場合)
    finishSession(session);
    const elapsed = getElapsedTime(session);
    const finalResult = calculateFinalResult(session, elapsed);
    return {
      session,
      input: null,
      matchData: null,
      chunkIndex: 0,
      result: 'finish',
      isNewQuestion: false,
      finalResult,
    };
  }
  const nextMatchData = buildMatchData(nextQuestion.reading);
  const firstChunk = nextMatchData[0];
  const nextInput = createRomajiInput(firstChunk.kana, firstChunk.patterns);

  return {
    session,
    input: nextInput,
    matchData: nextMatchData,
    chunkIndex: 0,
    result: 'complete',
    isNewQuestion: true,
    finalResult: null,
  };
}
