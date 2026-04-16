import {
  advanceStage,
  getCurrentStage,
  loseBall,
  recordBlockDestroyed,
  recordPaddleBounce,
} from '../../domain/entities/game-session.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../canvas/breakout-canvas.js';
import {
  ITEM_TYPES,
  MAX_ACTIVE_BALLS,
  adjustPaddleScale,
  adjustPaddleSpeedScale,
  maybeCreateItemDrop,
} from '../item-drop.js';

const PLAYFIELD = Object.freeze({
  left: 48,
  right: LOGICAL_WIDTH - 48,
  top: 96,
  bottom: LOGICAL_HEIGHT - 36,
});

const BLOCK_TOP = 132;
const BLOCK_HEIGHT = 24;
const BLOCK_GAP = 8;
const PADDLE_HEIGHT = 16;
const PADDLE_Y = PLAYFIELD.bottom - 26;
const BALL_RADIUS = 9;
const STAGE_CLEAR_DELAY_MS = 1400;
const MIN_BALL_SPEED = 280;
const MAX_BALL_SPEED = 560;
const BASE_PADDLE_FOLLOW = 14;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function circleIntersectsRect(ball, rect) {
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const closestY = clamp(ball.y, rect.y, rect.y + rect.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function buildStageLayout(stage) {
  const usableWidth = PLAYFIELD.right - PLAYFIELD.left;
  const blockWidth = (usableWidth - (stage.columnCount - 1) * BLOCK_GAP) / stage.columnCount;

  return {
    blocks: stage.blocks.map((block) => ({
      block,
      x: PLAYFIELD.left + block.column * (blockWidth + BLOCK_GAP),
      y: BLOCK_TOP + block.row * (BLOCK_HEIGHT + BLOCK_GAP),
      width: blockWidth,
      height: BLOCK_HEIGHT,
    })),
  };
}

function getPaddleWidth(stage, paddleScale) {
  const minWidth = Math.max(72, Math.round(stage.paddleWidth * 0.75));
  const maxWidth = Math.min(
    PLAYFIELD.right - PLAYFIELD.left - 24,
    Math.round(stage.paddleWidth * 1.6)
  );

  return clamp(Math.round(stage.paddleWidth * paddleScale), minWidth, maxWidth);
}

function createPaddle(stage, centerX = LOGICAL_WIDTH / 2, paddleScale = 1) {
  const width = getPaddleWidth(stage, paddleScale);
  return {
    x: clamp(centerX - width / 2, PLAYFIELD.left, PLAYFIELD.right - width),
    y: PADDLE_Y,
    width,
    height: PADDLE_HEIGHT,
  };
}

function createServedBall(stage, paddle, serveCount) {
  const speed = clamp(stage.ballSpeed, MIN_BALL_SPEED, MAX_BALL_SPEED);
  const direction = serveCount % 2 === 0 ? 1 : -1;
  const vx = speed * 0.36 * direction;
  const vy = -Math.sqrt(speed * speed - vx * vx);

  return {
    x: paddle.x + paddle.width / 2,
    y: paddle.y - BALL_RADIUS - 2,
    vx,
    vy,
    radius: BALL_RADIUS,
  };
}

function createExtraBall(referenceBall, direction) {
  const speed = clamp(Math.hypot(referenceBall.vx, referenceBall.vy), MIN_BALL_SPEED, MAX_BALL_SPEED);
  const vx = clamp(Math.max(96, Math.abs(referenceBall.vx)), 96, speed * 0.74) * direction;
  const vy = -Math.sqrt(Math.max(speed * speed - vx * vx, 1));

  return {
    x: referenceBall.x,
    y: referenceBall.y,
    vx,
    vy,
    radius: BALL_RADIUS,
  };
}

function resolveBlockBounce(ball, rect, prevX, prevY) {
  const cameFromLeft = prevX + ball.radius <= rect.x;
  const cameFromRight = prevX - ball.radius >= rect.x + rect.width;
  const cameFromTop = prevY + ball.radius <= rect.y;
  const cameFromBottom = prevY - ball.radius >= rect.y + rect.height;

  if ((cameFromLeft || cameFromRight) && !cameFromTop && !cameFromBottom) {
    ball.vx *= -1;
    ball.x = cameFromLeft ? rect.x - ball.radius - 1 : rect.x + rect.width + ball.radius + 1;
    return;
  }

  if (cameFromTop || cameFromBottom) {
    ball.vy *= -1;
    ball.y = cameFromTop ? rect.y - ball.radius - 1 : rect.y + rect.height + ball.radius + 1;
    return;
  }

  const overlapX = Math.min(
    Math.abs(ball.x + ball.radius - rect.x),
    Math.abs(rect.x + rect.width - (ball.x - ball.radius))
  );
  const overlapY = Math.min(
    Math.abs(ball.y + ball.radius - rect.y),
    Math.abs(rect.y + rect.height - (ball.y - ball.radius))
  );

  if (overlapX < overlapY) {
    ball.vx *= -1;
  } else {
    ball.vy *= -1;
  }
}

export function createPlayScreen({ session, renderer, pointerController, onPause, onFinish }) {
  let stage = getCurrentStage(session);
  let stageLayout = buildStageLayout(stage);
  let paddleScale = 1;
  let paddleSpeedScale = 1;
  let paddle = createPaddle(stage, LOGICAL_WIDTH / 2, paddleScale);
  let serveCount = 0;
  let balls = [createServedBall(stage, paddle, serveCount)];
  let items = [];
  let extraBallDirection = -1;
  let banner = {
    title: stage.label,
    subtitle: 'マウスで位置調整して右クリックで発射',
  };

  let phase = 'serve';
  let phaseTimer = 0;
  let paused = false;
  let destroyed = false;
  let rafId = null;
  let lastTime = null;

  pointerController.consumeLaunchRequest();

  function refreshPaddle() {
    const centerX = paddle.x + paddle.width / 2;
    paddle = createPaddle(stage, centerX, paddleScale);
  }

  function prepareStage(nextStage) {
    stage = nextStage;
    stageLayout = buildStageLayout(stage);
    paddle = createPaddle(stage, paddle.x + paddle.width / 2, paddleScale);
    serveCount += 1;
    balls = [createServedBall(stage, paddle, serveCount)];
    items = [];
    pointerController.consumeLaunchRequest();
    banner = {
      title: stage.label,
      subtitle: 'マウスで位置調整して右クリックで発射',
    };
    phase = 'serve';
    phaseTimer = 0;
  }

  function prepareAfterMiss() {
    serveCount += 1;
    paddle = createPaddle(stage, paddle.x + paddle.width / 2, paddleScale);
    balls = [createServedBall(stage, paddle, serveCount)];
    items = [];
    pointerController.consumeLaunchRequest();
    banner = {
      title: 'MISS',
      subtitle: `残機 ${session.lives} / 右クリックで再発射`,
    };
    phase = 'serve';
    phaseTimer = 0;
  }

  function triggerStageClear(ball, scoreDelta) {
    balls = [{ ...ball }];
    items = [];
    phase = 'stage-transition';
    phaseTimer = STAGE_CLEAR_DELAY_MS;
    banner = {
      title: session.stageIndex === session.stages.length - 1 ? 'ALL CLEAR' : 'STAGE CLEAR',
      subtitle: `+${scoreDelta} pts`,
    };
  }

  function applyItemEffect(type) {
    switch (type) {
      case ITEM_TYPES.EXTRA_BALL: {
        if (balls.length >= MAX_ACTIVE_BALLS || balls.length === 0) {
          return;
        }

        const referenceBall = balls[balls.length - 1];
        balls.push(createExtraBall(referenceBall, extraBallDirection));
        extraBallDirection *= -1;
        return;
      }
      case ITEM_TYPES.PADDLE_WIDER:
        paddleScale = adjustPaddleScale(paddleScale, 1);
        refreshPaddle();
        return;
      case ITEM_TYPES.PADDLE_FASTER:
        paddleSpeedScale = adjustPaddleSpeedScale(paddleSpeedScale, 1);
        return;
      case ITEM_TYPES.PADDLE_NARROWER:
        paddleScale = adjustPaddleScale(paddleScale, -1);
        refreshPaddle();
        return;
      case ITEM_TYPES.PADDLE_SLOWER:
        paddleSpeedScale = adjustPaddleSpeedScale(paddleSpeedScale, -1);
        return;
      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  }

  function updateItems(dtSec) {
    const remainingItems = [];

    for (const item of items) {
      item.y += item.vy * dtSec;

      if (circleIntersectsRect(item, paddle)) {
        applyItemEffect(item.type);
        continue;
      }

      if (item.y - item.radius > PLAYFIELD.bottom) {
        continue;
      }

      remainingItems.push(item);
    }

    items = remainingItems;
  }

  function updatePaddle(dtSec) {
    const targetX = clamp(
      pointerController.getTargetX() - paddle.width / 2,
      PLAYFIELD.left,
      PLAYFIELD.right - paddle.width
    );
    const follow = Math.min(1, dtSec * BASE_PADDLE_FOLLOW * paddleSpeedScale);
    paddle.x += (targetX - paddle.x) * follow;
  }

  function handleWallCollision(ball) {
    if (ball.x - ball.radius <= PLAYFIELD.left) {
      ball.x = PLAYFIELD.left + ball.radius;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x + ball.radius >= PLAYFIELD.right) {
      ball.x = PLAYFIELD.right - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - ball.radius <= PLAYFIELD.top) {
      ball.y = PLAYFIELD.top + ball.radius;
      ball.vy = Math.abs(ball.vy);
    }
  }

  function handlePaddleCollision(ball, prevY) {
    if (ball.vy <= 0) return false;
    if (!circleIntersectsRect(ball, paddle)) return false;
    if (prevY + ball.radius > paddle.y + 4) return false;

    const speed = clamp(Math.hypot(ball.vx, ball.vy) * 1.01, MIN_BALL_SPEED, MAX_BALL_SPEED);
    const relative = clamp((ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2), -1, 1);
    const angle = relative * (Math.PI / 3);

    ball.y = paddle.y - ball.radius - 1;
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));

    if (Math.abs(ball.vx) < 64) {
      ball.vx = 64 * (relative >= 0 ? 1 : -1);
    }

    recordPaddleBounce(session);
    return true;
  }

  function handleBlockCollision(ball, prevX, prevY) {
    for (const layoutBlock of stageLayout.blocks) {
      if (layoutBlock.block.destroyed) continue;
      if (!circleIntersectsRect(ball, layoutBlock)) continue;

      resolveBlockBounce(ball, layoutBlock, prevX, prevY);
      const result = recordBlockDestroyed(session, layoutBlock.block.id);

      if (result.destroyed && !result.stageCleared) {
        const item = maybeCreateItemDrop(layoutBlock);
        if (item) {
          items.push(item);
        }
      }

      if (result.stageCleared) {
        triggerStageClear(ball, result.scoreDelta);
      }

      return true;
    }

    return false;
  }

  function updateBall(ball, dtSec) {
    const speed = Math.hypot(ball.vx, ball.vy);
    const subSteps = Math.max(1, Math.ceil((speed * dtSec) / 8));
    const stepDt = dtSec / subSteps;

    for (let step = 0; step < subSteps; step += 1) {
      const prevX = ball.x;
      const prevY = ball.y;

      ball.x += ball.vx * stepDt;
      ball.y += ball.vy * stepDt;

      handleWallCollision(ball);

      if (handlePaddleCollision(ball, prevY)) {
        continue;
      }

      if (handleBlockCollision(ball, prevX, prevY)) {
        return true;
      }

      if (ball.y - ball.radius > PLAYFIELD.bottom) {
        return false;
      }
    }

    return true;
  }

  function updatePlaying(dtSec) {
    updateItems(dtSec);

    const currentBalls = [...balls];
    const activeBalls = [];

    for (const ball of currentBalls) {
      const keepBall = updateBall(ball, dtSec);

      if (destroyed) return;
      if (phase !== 'playing') return;

      if (keepBall) {
        activeBalls.push(ball);
      }
    }

    balls = activeBalls;

    if (balls.length > 0) {
      return;
    }

    const result = loseBall(session);

    if (result.gameOver) {
      onFinish(result.result);
      destroy();
      return;
    }

    prepareAfterMiss();
  }

  function update(dtMs) {
    const dtSec = Math.min(dtMs / 1000, 1 / 30);
    updatePaddle(dtSec);

    if (phase === 'serve') {
      const servedBall = balls[0];
      if (servedBall) {
        servedBall.x = paddle.x + paddle.width / 2;
        servedBall.y = paddle.y - servedBall.radius - 2;
      }

      if (pointerController.consumeLaunchRequest()) {
        phase = 'playing';
        banner = null;
      }
      return;
    }

    pointerController.consumeLaunchRequest();

    if (phase === 'stage-transition') {
      phaseTimer -= dtMs;
      if (phaseTimer > 0) return;

      const stageAdvance = advanceStage(session);

      if (stageAdvance.finished) {
        onFinish(stageAdvance.result);
        destroy();
        return;
      }

      prepareStage(stageAdvance.stage);
      return;
    }

    updatePlaying(dtSec);
  }

  function render() {
    renderer.renderFrame({
      session,
      stage,
      playfield: PLAYFIELD,
      blocks: stageLayout.blocks,
      paddle,
      balls,
      items,
      banner,
    });
  }

  function loop(timestamp) {
    if (destroyed || paused) return;

    if (!lastTime) {
      lastTime = timestamp;
    }

    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    if (destroyed) return;
    render();

    rafId = requestAnimationFrame(loop);
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape' || destroyed || paused) {
      return;
    }

    event.preventDefault();
    onPause();
  }

  function pause() {
    if (destroyed) return;
    paused = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function resume() {
    if (destroyed) return;
    paused = false;
    lastTime = null;
    rafId = requestAnimationFrame(loop);
  }

  function destroy() {
    destroyed = true;
    window.removeEventListener('keydown', handleKeyDown);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return {
    start() {
      window.addEventListener('keydown', handleKeyDown);
      render();
      rafId = requestAnimationFrame(loop);
    },
    pause,
    resume,
    destroy,
  };
}
