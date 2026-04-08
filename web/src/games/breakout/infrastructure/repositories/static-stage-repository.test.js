import { describe, expect, it } from 'vitest';

import { createStaticStageRepository } from './static-stage-repository.js';

describe('createStaticStageRepository', () => {
  it('returns 10 stages through 2-5 and expands the phase 2 board', async () => {
    const repository = createStaticStageRepository();

    const stages = await repository.findAll();

    expect(stages).toHaveLength(10);
    expect(stages[0].id).toBe('1-1');
    expect(stages[5].id).toBe('2-1');
    expect(stages[9].id).toBe('2-5');
    expect(stages[5].columnCount).toBeGreaterThan(stages[0].columnCount);
    expect(stages[5].rowCount).toBeGreaterThan(stages[0].rowCount);
  });
});
