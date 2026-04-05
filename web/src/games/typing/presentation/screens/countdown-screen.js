import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../canvas/typing-canvas.js';

const STEPS = ['3', '2', '1', 'Start!'];
const STEP_DURATION = [1000, 1000, 1000, 500];

/**
 * カウントダウン画面 (G-2)
 * @param {CanvasRenderingContext2D} ctx
 * @param {function(): void} onComplete
 */
export function createCountdownScreen(ctx, onComplete) {
  let stepIndex = 0;
  let elapsed = 0;
  let alpha = 1;
  let rafId = null;
  let lastTime = null;
  let destroyed = false;

  function render() {
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // 背景
    ctx.fillStyle = '#f0f4ff';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    const text = STEPS[stepIndex];
    const duration = STEP_DURATION[stepIndex];
    const progress = elapsed / duration;
    alpha = 1 - progress;
    const scale = 2.0 - progress;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    const fontSize = Math.floor(stepIndex < 3 ? 120 * scale : 70 * scale);
    ctx.font = `bold ${fontSize}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#2196F3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    ctx.restore();
  }

  function loop(ts) {
    if (destroyed) return;
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;
    elapsed += dt;

    render();

    if (elapsed >= STEP_DURATION[stepIndex]) {
      elapsed = 0;
      lastTime = null;
      stepIndex++;
      if (stepIndex >= STEPS.length) {
        // 完了
        ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        onComplete();
        return;
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  return {
    start() {
      rafId = requestAnimationFrame(loop);
    },
    destroy() {
      destroyed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    },
  };
}
