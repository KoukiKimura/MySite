import { describe, expect, it } from 'vitest';

import {
  ITEM_TYPES,
  adjustPaddleScale,
  adjustPaddleSpeedScale,
  maybeCreateItemDrop,
} from './item-drop.js';

function createSequence(values) {
  let index = 0;
  return () => values[index++];
}

describe('item-drop', () => {
  it('returns null when the drop roll misses', () => {
    const item = maybeCreateItemDrop(
      { x: 10, y: 20, width: 30, height: 40 },
      () => 0.9
    );

    expect(item).toBeNull();
  });

  it('creates an item at the block center when the drop roll hits', () => {
    const rng = createSequence([0.1, 0.0]);
    const item = maybeCreateItemDrop(
      { x: 10, y: 20, width: 30, height: 40 },
      rng
    );

    expect(item.type).toBe(ITEM_TYPES.EXTRA_BALL);
    expect(item.x).toBe(25);
    expect(item.y).toBe(40);
  });

  it('clamps paddle width scale changes within the configured range', () => {
    expect(adjustPaddleScale(1.55, 1)).toBe(1.6);
    expect(adjustPaddleScale(0.8, -1)).toBe(0.75);
  });

  it('clamps paddle speed scale changes within the configured range', () => {
    expect(adjustPaddleSpeedScale(1.55, 1)).toBe(1.6);
    expect(adjustPaddleSpeedScale(0.8, -1)).toBe(0.75);
  });
});
