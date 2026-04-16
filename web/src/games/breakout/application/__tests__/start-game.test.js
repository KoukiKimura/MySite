import { describe, expect, it, vi } from 'vitest';
import { startGame } from '../use-cases/start-game.js';
import { createStageState } from '../../domain/entities/stage-state.js';

function makeStage(id) {
  return createStageState({
    id,
    label: `STAGE ${id}`,
    ballSpeed: 320,
    paddleWidth: 148,
    rows: ['11'],
    theme: {
      backgroundTop: '#000',
      backgroundBottom: '#111',
      block: '#222',
      blockAlt: '#333',
      accent: '#444',
      frame: '#555',
    },
  });
}

describe('startGame', () => {
  it('READY 状態のセッションを返す', async () => {
    const stageRepository = {
      findAll: vi.fn().mockResolvedValue([
        makeStage('1-1'),
        makeStage('1-2'),
        makeStage('1-3'),
        makeStage('1-4'),
        makeStage('1-5'),
      ]),
    };

    const session = await startGame({ stageRepository }, { maxLives: 3 });

    expect(stageRepository.findAll).toHaveBeenCalledTimes(1);
    expect(session.state).toBe('ready');
    expect(session.stages).toHaveLength(5);
    expect(session.currentStage.id).toBe('1-1');
  });

  it('リポジトリが空配列を返したらエラー', async () => {
    const stageRepository = {
      findAll: vi.fn().mockResolvedValue([]),
    };

    await expect(startGame({ stageRepository })).rejects.toThrow();
  });
});

