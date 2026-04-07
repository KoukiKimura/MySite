import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './breakout-canvas.js';

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPanel(ctx, x, y, width, height) {
  roundedRect(ctx, x, y, width, height, 16);
  ctx.fillStyle = 'rgba(5, 10, 18, 0.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function createBreakoutRenderer(ctx) {
  function clear() {
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  function drawBackground(stage, playfield) {
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, stage.theme.backgroundTop);
    gradient.addColorStop(1, stage.theme.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = playfield.left; x <= playfield.right; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, playfield.top);
      ctx.lineTo(x, playfield.bottom);
      ctx.stroke();
    }
    for (let y = playfield.top; y <= playfield.bottom; y += 32) {
      ctx.beginPath();
      ctx.moveTo(playfield.left, y);
      ctx.lineTo(playfield.right, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    roundedRect(ctx, playfield.left, playfield.top, playfield.right - playfield.left, playfield.bottom - playfield.top, 20);
    ctx.strokeStyle = stage.theme.frame;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 24;
    ctx.shadowColor = `${stage.theme.frame}66`;
    ctx.stroke();
    ctx.restore();
  }

  function drawHud(session, stage) {
    drawPanel(ctx, 28, 18, 904, 58);

    ctx.font = '700 18px "M PLUS Rounded 1c", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(stage.label, 52, 47);

    ctx.font = '700 18px "Source Code Pro", monospace';
    ctx.fillStyle = '#ffe48a';
    ctx.fillText(`SCORE ${String(session.score).padStart(5, '0')}`, 260, 47);

    ctx.fillStyle = session.combo > 1 ? '#8cf2ff' : 'rgba(255,255,255,0.7)';
    ctx.fillText(`COMBO x${session.combo}`, 535, 47);

    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText('LIVES', 750, 47);

    for (let index = 0; index < session.maxLives; index += 1) {
      const x = 830 + index * 26;
      ctx.beginPath();
      ctx.arc(x, 47, 8, 0, Math.PI * 2);
      ctx.fillStyle = index < session.lives ? '#ffe48a' : 'rgba(255,255,255,0.18)';
      ctx.fill();
    }
  }

  function drawBlocks(blocks, stage) {
    blocks.forEach((layoutBlock) => {
      if (layoutBlock.block.destroyed) return;

      const fill = layoutBlock.block.row % 2 === 0 ? stage.theme.block : stage.theme.blockAlt;

      ctx.save();
      roundedRect(ctx, layoutBlock.x, layoutBlock.y, layoutBlock.width, layoutBlock.height, 8);
      ctx.fillStyle = fill;
      ctx.shadowBlur = 16;
      ctx.shadowColor = `${fill}88`;
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      roundedRect(ctx, layoutBlock.x + 4, layoutBlock.y + 4, layoutBlock.width - 8, 5, 3);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawPaddle(paddle, stage) {
    ctx.save();
    roundedRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 10);
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, stage.theme.accent);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `${stage.theme.accent}aa`;
    ctx.fill();
    ctx.restore();
  }

  function drawBall(ball, stage) {
    ctx.save();
    const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 2, ball.x, ball.y, ball.radius + 6);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, stage.theme.accent);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `${stage.theme.accent}aa`;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHint() {
    ctx.font = '500 14px "Noto Sans JP", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pause ボタンで一時停止', 38, LOGICAL_HEIGHT - 20);
  }

  function drawBanner(banner, playfield) {
    if (!banner) return;

    const width = 420;
    const height = 112;
    const x = (LOGICAL_WIDTH - width) / 2;
    const y = playfield.top + 180;

    ctx.save();
    roundedRect(ctx, x, y, width, height, 18);
    ctx.fillStyle = 'rgba(4, 9, 18, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px "M PLUS Rounded 1c", sans-serif';
    ctx.fillText(banner.title, x + width / 2, y + 44);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '500 16px "Noto Sans JP", sans-serif';
    ctx.fillText(banner.subtitle, x + width / 2, y + 82);
    ctx.restore();
  }

  function renderFrame(scene) {
    const {
      session,
      stage,
      playfield,
      blocks,
      paddle,
      ball,
      banner,
    } = scene;

    clear();
    drawBackground(stage, playfield);
    drawHud(session, stage);
    drawBlocks(blocks, stage);
    drawPaddle(paddle, stage);
    drawBall(ball, stage);
    drawHint();
    drawBanner(banner, playfield);
  }

  return {
    clear,
    renderFrame,
  };
}

