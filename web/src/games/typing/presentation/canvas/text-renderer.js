import { LOGICAL_WIDTH } from './typing-canvas.js';

const FONT_QUESTION = 'bold 40px "M PLUS Rounded 1c", sans-serif';
const FONT_ROMAJI = '28px "Source Code Pro", monospace';
const FONT_HEADER = 'bold 18px "M PLUS Rounded 1c", sans-serif';
const FONT_COUNTDOWN = 'bold 120px "M PLUS Rounded 1c", sans-serif';
const FONT_RANK = 'bold 80px "M PLUS Rounded 1c", sans-serif';
const FONT_STATS = '16px "M PLUS Rounded 1c", sans-serif';

export function createTextRenderer(ctx) {
  function drawQuestion(text, x, y) {
    ctx.font = FONT_QUESTION;
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  /**
   * ローマ字ガイドを色分けして描画
   * @param {Array<{kana: string, patterns: string[]}>} matchData
   * @param {{ completedChunks: number, currentAccepted: string, isMissFlash: boolean }} inputState
   * @param {number} x
   * @param {number} y
   */
  function drawRomajiGuide(matchData, inputState, x, y) {
    const { completedChunks, currentAccepted, isMissFlash } = inputState;

    // 全ローマ字を結合して表示用文字列を生成
    const pieces = [];
    for (let i = 0; i < matchData.length; i++) {
      const chunk = matchData[i];
      const pattern = chunk.patterns[0]; // 先頭候補で表示
      if (i < completedChunks) {
        pieces.push({ text: pattern, status: 'done' });
      } else if (i === completedChunks) {
        // 入力済み部分と未入力部分に分割
        pieces.push({ text: currentAccepted, status: isMissFlash ? 'miss' : 'current-done' });
        pieces.push({ text: pattern.slice(currentAccepted.length), status: isMissFlash ? 'miss' : 'remaining' });
      } else {
        pieces.push({ text: pattern, status: 'pending' });
      }
    }

    ctx.font = FONT_ROMAJI;
    ctx.textBaseline = 'middle';

    // 全幅を先に計算して中央揃えのオフセットを決める
    let totalWidth = 0;
    for (const p of pieces) {
      if (p.text) totalWidth += ctx.measureText(p.text).width;
    }

    let curX = x - totalWidth / 2;

    for (const p of pieces) {
      if (!p.text) continue;
      const w = ctx.measureText(p.text).width;

      switch (p.status) {
        case 'done':
        case 'current-done':
          ctx.fillStyle = '#4CAF50';
          break;
        case 'miss':
          ctx.fillStyle = '#F44336';
          break;
        case 'remaining':
          // 現在位置（次に打つべき文字）は青
          ctx.fillStyle = '#2196F3';
          {
            // アンダーラインカーソル（最初の1文字のみ）
            const firstCharW = ctx.measureText(p.text[0]).width;
            ctx.fillRect(curX, y + 16, firstCharW, 2);
          }
          break;
        case 'pending':
        default:
          ctx.fillStyle = '#999999';
          break;
      }

      ctx.textAlign = 'left';
      ctx.fillText(p.text, curX, y);
      curX += w;
    }
  }

  function drawScore(score, x, y) {
    ctx.font = FONT_HEADER;
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score.toLocaleString()} 点`, x, y);
  }

  function drawTimer(remainingMs, x, y) {
    const sec = Math.max(0, Math.ceil(remainingMs / 1000));
    ctx.font = FONT_HEADER;
    ctx.fillStyle = remainingMs < 10000 ? '#F44336' : '#1a1a2e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⏱ ${sec}秒`, x, y);
  }

  function drawQuestionCounter(current, total, x, y) {
    ctx.font = FONT_HEADER;
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📋 ${current + 1} / ${total}`, x, y);
  }

  function drawCombo(combo, x, y) {
    if (combo < 2) return;
    ctx.font = FONT_HEADER;
    ctx.fillStyle = combo >= 10 ? '#FF5722' : '#FF9800';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🔥 ${combo} combo`, x, y);
  }

  function drawStats(stats, x, y) {
    ctx.font = FONT_STATS;
    ctx.fillStyle = '#555';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `正解: ${stats.correctCount}  ミス: ${stats.missCount}  正確率: ${stats.accuracy.toFixed(1)}%`,
      x, y
    );
  }

  function drawCountdown(text, x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = FONT_COUNTDOWN;
    ctx.fillStyle = '#2196F3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawRank(rank, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.font = FONT_RANK;
    ctx.fillStyle = rank === 'S' ? '#FFD700' : rank === 'A' ? '#FF5722' : '#2196F3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rank, 0, 0);
    ctx.restore();
  }

  function drawBackground(color = '#f0f4ff') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, 600);
  }

  function drawProgressBar(progress, x, y, w, h, gameMode, currentIndex, total) {
    // 背景
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, w, h);

    // 進捗
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(x, y, w * progress, h);

    if (gameMode === 'fixed-count') {
      ctx.font = '13px "M PLUS Rounded 1c", sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`${currentIndex + 1} / ${total}`, x + w, y + h + 4);
    }
  }

  return {
    drawQuestion,
    drawRomajiGuide,
    drawScore,
    drawTimer,
    drawQuestionCounter,
    drawCombo,
    drawStats,
    drawCountdown,
    drawRank,
    drawBackground,
    drawProgressBar,
  };
}
