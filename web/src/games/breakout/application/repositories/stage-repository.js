export function assertStageRepository(stageRepository) {
  if (!stageRepository || typeof stageRepository.findAll !== 'function') {
    throw new Error('StageRepository.findAll is required');
  }
}

