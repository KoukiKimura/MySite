import { createStageState } from '../../domain/entities/stage-state.js';
import { STAGE_DEFINITIONS } from '../data/stages.js';

export function createStaticStageRepository() {
  return {
    async findAll() {
      return STAGE_DEFINITIONS.map((definition) => createStageState(definition));
    },
  };
}

