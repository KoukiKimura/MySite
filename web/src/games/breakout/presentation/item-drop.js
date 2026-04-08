export const ITEM_TYPES = Object.freeze({
  EXTRA_BALL: 'extra-ball',
  PADDLE_WIDER: 'paddle-wider',
  PADDLE_FASTER: 'paddle-faster',
  PADDLE_NARROWER: 'paddle-narrower',
  PADDLE_SLOWER: 'paddle-slower',
});

export const ITEM_DROP_CHANCE = 0.24;
export const ITEM_RADIUS = 16;
export const ITEM_FALL_SPEED = 180;
export const MAX_ACTIVE_BALLS = 4;

export const PADDLE_SCALE_STEP = 0.1;
export const PADDLE_SCALE_MIN = 0.75;
export const PADDLE_SCALE_MAX = 1.6;

export const PADDLE_SPEED_STEP = 0.1;
export const PADDLE_SPEED_MIN = 0.75;
export const PADDLE_SPEED_MAX = 1.6;

const ITEM_TABLE = Object.freeze([
  { type: ITEM_TYPES.EXTRA_BALL, weight: 22 },
  { type: ITEM_TYPES.PADDLE_WIDER, weight: 24 },
  { type: ITEM_TYPES.PADDLE_FASTER, weight: 24 },
  { type: ITEM_TYPES.PADDLE_NARROWER, weight: 15 },
  { type: ITEM_TYPES.PADDLE_SLOWER, weight: 15 },
]);

const ITEM_VISUALS = Object.freeze({
  [ITEM_TYPES.EXTRA_BALL]: { label: '+B', fill: '#ffe48a', stroke: '#fff4c1' },
  [ITEM_TYPES.PADDLE_WIDER]: { label: 'W+', fill: '#6ef0e8', stroke: '#bafaf3' },
  [ITEM_TYPES.PADDLE_FASTER]: { label: 'S+', fill: '#7fb7ff', stroke: '#c5deff' },
  [ITEM_TYPES.PADDLE_NARROWER]: { label: 'W-', fill: '#ff9c8b', stroke: '#ffd1c7' },
  [ITEM_TYPES.PADDLE_SLOWER]: { label: 'S-', fill: '#d68bff', stroke: '#eed2ff' },
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundScale(value) {
  return Number(value.toFixed(2));
}

function pickItemType(randomValue) {
  const totalWeight = ITEM_TABLE.reduce((sum, item) => sum + item.weight, 0);
  let cursor = clamp(randomValue, 0, 0.999999) * totalWeight;

  for (const item of ITEM_TABLE) {
    cursor -= item.weight;
    if (cursor < 0) {
      return item.type;
    }
  }

  return ITEM_TABLE[ITEM_TABLE.length - 1].type;
}

export function maybeCreateItemDrop(sourceRect, rng = Math.random) {
  if (!sourceRect) {
    throw new Error('sourceRect is required');
  }

  if (rng() > ITEM_DROP_CHANCE) {
    return null;
  }

  return {
    type: pickItemType(rng()),
    x: sourceRect.x + sourceRect.width / 2,
    y: sourceRect.y + sourceRect.height / 2,
    radius: ITEM_RADIUS,
    vy: ITEM_FALL_SPEED,
  };
}

export function adjustPaddleScale(currentScale, direction) {
  if (direction !== 1 && direction !== -1) {
    throw new Error(`Invalid paddle scale direction: ${direction}`);
  }

  return roundScale(clamp(
    currentScale + PADDLE_SCALE_STEP * direction,
    PADDLE_SCALE_MIN,
    PADDLE_SCALE_MAX
  ));
}

export function adjustPaddleSpeedScale(currentScale, direction) {
  if (direction !== 1 && direction !== -1) {
    throw new Error(`Invalid paddle speed direction: ${direction}`);
  }

  return roundScale(clamp(
    currentScale + PADDLE_SPEED_STEP * direction,
    PADDLE_SPEED_MIN,
    PADDLE_SPEED_MAX
  ));
}

export function getItemVisual(type) {
  const visual = ITEM_VISUALS[type];

  if (!visual) {
    throw new Error(`Unknown item type: ${type}`);
  }

  return visual;
}
