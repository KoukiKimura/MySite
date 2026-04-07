export function createStageState(definition) {
  if (!definition || !Array.isArray(definition.rows) || definition.rows.length === 0) {
    throw new Error('Stage definition.rows is required');
  }

  const columnCount = Math.max(...definition.rows.map((row) => row.length));
  const blocks = [];

  definition.rows.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell !== '1') return;
      blocks.push({
        id: `${definition.id}-${rowIndex}-${columnIndex}`,
        row: rowIndex,
        column: columnIndex,
        destroyed: false,
      });
    });
  });

  return {
    id: definition.id,
    label: definition.label,
    ballSpeed: definition.ballSpeed,
    paddleWidth: definition.paddleWidth,
    theme: { ...definition.theme },
    rowCount: definition.rows.length,
    columnCount,
    blocks,
  };
}

export function countRemainingBlocks(stage) {
  return stage.blocks.reduce((count, block) => count + (block.destroyed ? 0 : 1), 0);
}

export function hasRemainingBlocks(stage) {
  return countRemainingBlocks(stage) > 0;
}

export function markBlockDestroyed(stage, blockId) {
  const block = stage.blocks.find((item) => item.id === blockId);

  if (!block || block.destroyed) {
    return false;
  }

  block.destroyed = true;
  return true;
}

