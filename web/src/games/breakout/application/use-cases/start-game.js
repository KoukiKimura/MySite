import { createGameSession } from '../../domain/entities/game-session.js';
import { assertStageRepository } from '../repositories/stage-repository.js';

export async function startGame({ stageRepository }, options = {}) {
  assertStageRepository(stageRepository);

  const stages = await stageRepository.findAll();

  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error('No stages available');
  }

  return createGameSession(stages, options);
}

