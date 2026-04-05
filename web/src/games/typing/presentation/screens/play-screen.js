import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../canvas/typing-canvas.js';
import { shouldFinish, getElapsedTime, getCurrentQuestion } from '../../domain/entities/game-session.js';
import { buildMatchData } from '../../domain/services/romaji-converter.js';
import { createRomajiInput } from '../../domain/values/romaji-input.js';
import { calculateAccuracy, getComboMultiplier } from '../../domain/services/score-calculator.js';

/**
 * プレイ画面 (G-3)
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} session - GameSession
 * @param {{ textRenderer, effectRenderer, keyboardHandler, processInput, finishGame, onFinish, onPause }} deps
 */
export function createPlayScreen(ctx, session, deps) {
  const { textRenderer, effectRenderer, keyboardHandler, processInput, finishGame, onFinish, onPause } = deps;

  let currentQuestion = getCurrentQuestion(session);
  let currentMatchData = buildMatchData(currentQuestion.reading);
  let currentInput = createRomajiInput(currentMatchData[0].kana, currentMatchData[0].patterns);
  let chunkIndex = 0;

  let currentScore = 0;
  let rafId = null;
  let lastTime = null;
  let destroyed = false;
  let paused = false;

  function handleInput(key) {
    if (paused || destroyed) return;

    const result = processInput(session, currentInput, currentMatchData, chunkIndex, key);

    if (result.result === 'miss') {
      effectRenderer.triggerMissFlash();
    } else if (result.result === 'correct') {
      currentInput = result.input;
      chunkIndex = result.chunkIndex;
    } else if (result.result === 'complete') {
      effectRenderer.triggerCorrectFlash();
      effectRenderer.triggerComboEffect(session.combo);
      currentInput = result.input;
      currentMatchData = result.matchData;
      chunkIndex = result.chunkIndex;
      // 問題を即時更新（render() の末尾より先に更新して null 参照を防ぐ）
      currentQuestion = getCurrentQuestion(session);
      // スコア更新（comboHistory ベースの倍率計算 — 最終スコアと同じロジック）
      currentScore = Math.max(0,
        session.comboHistory.reduce((sum, c) => sum + Math.round(10 * getComboMultiplier(c)), 0)
        - session.missCount * 5
      );
    } else if (result.result === 'finish') {
      onFinish(result.finalResult);
      destroy();
    }
  }

  function handleEscape() {
    if (destroyed) return;
    pause();
    onPause();
  }

  function update(dt) {
    effectRenderer.update(dt);

    // time-limit モード: 時間切れチェック
    if (session.config.gameMode === 'time-limit' && shouldFinish(session)) {
      const result = finishGame(session);
      onFinish(result);
      destroy();
    }
  }

  function render() {
    ctx.save();
    const shake = effectRenderer.getShake();
    ctx.translate(shake.x, shake.y);

    textRenderer.drawBackground('#f0f4ff');

    // ヘッダー
    if (session.config.gameMode === 'time-limit') {
      const elapsed = getElapsedTime(session);
      const remaining = session.config.timeLimit * 1000 - elapsed;
      textRenderer.drawTimer(remaining, 30, 25);
    } else {
      textRenderer.drawQuestionCounter(session.currentIndex, session.config.questionCount, 30, 25);
    }
    textRenderer.drawScore(currentScore, LOGICAL_WIDTH / 2, 25);
    textRenderer.drawCombo(session.combo, 770, 25);

    // 進捗バー
    let progress;
    if (session.config.gameMode === 'time-limit') {
      const elapsed = getElapsedTime(session);
      progress = Math.min(1, elapsed / (session.config.timeLimit * 1000));
    } else {
      progress = session.currentIndex / session.config.questionCount;
    }
    textRenderer.drawProgressBar(
      progress, 30, 50, 740, 8,
      session.config.gameMode,
      session.currentIndex,
      session.config.questionCount
    );

    // 出題テキスト（null ガード: 全問終了直後フレームで null になる場合がある）
    if (!currentQuestion) {
      ctx.restore();
      rafId = requestAnimationFrame(loop);
      return;
    }
    textRenderer.drawQuestion(currentQuestion.display, LOGICAL_WIDTH / 2, 220);

    // ローマ字ガイド
    textRenderer.drawRomajiGuide(currentMatchData, {
      completedChunks: chunkIndex,
      currentAccepted: currentInput ? currentInput.accepted : '',
      isMissFlash: effectRenderer.isMissFlashing(),
    }, LOGICAL_WIDTH / 2, 300);

    // フッター
    const totalKS = session.correctCount + session.missCount;
    const acc = calculateAccuracy(session.correctCount, totalKS || 1);
    textRenderer.drawStats({
      correctCount: session.correctCount,
      missCount: session.missCount,
      accuracy: acc,
    }, 30, 550);

    // 一時停止ボタン（簡易）
    ctx.fillStyle = '#ccc';
    ctx.fillRect(740, 540, 50, 26);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('II', 765, 553);

    effectRenderer.render();

    ctx.restore();

  }

  function loop(ts) {
    if (destroyed) return;
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    update(dt);
    render();

    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    paused = true;
    keyboardHandler.disable();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resume() {
    if (destroyed) return;
    paused = false;
    lastTime = null;
    keyboardHandler.enable();
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    destroyed = true;
    keyboardHandler.disable();
    keyboardHandler.onInput(null);
    keyboardHandler.onEscape(null);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return {
    start() {
      keyboardHandler.onInput(handleInput);
      keyboardHandler.onEscape(handleEscape);
      keyboardHandler.enable();
      rafId = requestAnimationFrame(loop);
    },
    pause,
    resume,
    destroy,
  };
}
