import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../canvas/typing-canvas.js';

/**
 * 一時停止画面 (G-4)
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {{ onResume, onRetry, onMenu }} callbacks
 */
export function createPauseScreen(ctx, canvas, callbacks) {
  const { onResume, onRetry, onMenu } = callbacks;

  const BUTTONS = [
    { label: '▶ つづける', x: 275, y: 310, width: 250, height: 44, action: () => onResume() },
    { label: '🔄 リトライ', x: 275, y: 365, width: 250, height: 44, action: () => onRetry() },
    { label: '🏠 メニューに戻る', x: 275, y: 420, width: 250, height: 44, action: () => onMenu() },
  ];

  let hoveredIndex = -1;
  let visible = false;

  function logicalPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (LOGICAL_WIDTH / rect.width),
      y: (event.clientY - rect.top) * (LOGICAL_HEIGHT / rect.height),
    };
  }

  function isInside(pos, btn) {
    return pos.x >= btn.x && pos.x <= btn.x + btn.width
        && pos.y >= btn.y && pos.y <= btn.y + btn.height;
  }

  function handleClick(event) {
    if (!visible) return;
    const pos = logicalPos(event);
    for (const btn of BUTTONS) {
      if (isInside(pos, btn)) {
        btn.action();
        return;
      }
    }
  }

  function handleMouseMove(event) {
    if (!visible) return;
    const pos = logicalPos(event);
    const prev = hoveredIndex;
    hoveredIndex = BUTTONS.findIndex((btn) => isInside(pos, btn));
    canvas.style.cursor = hoveredIndex >= 0 ? 'pointer' : 'default';
    if (hoveredIndex !== prev) render();
  }

  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('mousemove', handleMouseMove);

  function render() {
    // 半透明背景
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // タイトル
    ctx.font = 'bold 36px "M PLUS Rounded 1c", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸ 一時停止', LOGICAL_WIDTH / 2, 250);

    // ボタン
    BUTTONS.forEach((btn, i) => {
      const isHovered = i === hoveredIndex;
      ctx.fillStyle = isHovered ? '#2196F3' : 'rgba(255,255,255,0.15)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 18px "M PLUS Rounded 1c", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
    });
  }

  return {
    show() {
      visible = true;
      render();
    },
    hide() {
      visible = false;
      canvas.style.cursor = 'default';
    },
    destroy() {
      visible = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    },
  };
}
