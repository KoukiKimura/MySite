import { describe, expect, it } from 'vitest';
import {
  countRemainingBlocks,
  createStageState,
  markBlockDestroyed,
} from '../entities/stage-state.js';

const definition = {
  id: '1-1',
  label: 'STAGE 1-1',
  ballSpeed: 320,
  paddleWidth: 148,
  rows: [
    '101',
    '011',
  ],
  theme: {
    backgroundTop: '#000',
    backgroundBottom: '#111',
    block: '#222',
    blockAlt: '#333',
    accent: '#444',
    frame: '#555',
  },
};

describe('StageState', () => {
  it('rows からブロック一覧を生成する', () => {
    const stage = createStageState(definition);
    expect(stage.columnCount).toBe(3);
    expect(stage.blocks).toHaveLength(4);
    expect(countRemainingBlocks(stage)).toBe(4);
  });

  it('markBlockDestroyed で破壊済みにできる', () => {
    const stage = createStageState(definition);
    const targetId = stage.blocks[0].id;

    expect(markBlockDestroyed(stage, targetId)).toBe(true);
    expect(markBlockDestroyed(stage, targetId)).toBe(false);
    expect(countRemainingBlocks(stage)).toBe(3);
  });
});

