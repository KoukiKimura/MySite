const CONFIG_TABLE = {
  'time-limit': {
    easy:   { timeLimit: 90,  questionCount: 0 },
    normal: { timeLimit: 60,  questionCount: 0 },
    hard:   { timeLimit: 45,  questionCount: 0 },
  },
  'fixed-count': {
    easy:   { timeLimit: 0, questionCount: 10 },
    normal: { timeLimit: 0, questionCount: 15 },
    hard:   { timeLimit: 0, questionCount: 20 },
  },
};

export function createGameConfig(gameMode, difficulty, questionMode) {
  const modeConfig = CONFIG_TABLE[gameMode];
  if (!modeConfig) throw new Error(`Invalid gameMode: ${gameMode}`);
  const diffConfig = modeConfig[difficulty];
  if (!diffConfig) throw new Error(`Invalid difficulty: ${difficulty}`);

  return Object.freeze({
    gameMode,
    difficulty,
    questionMode,
    timeLimit: diffConfig.timeLimit,
    questionCount: diffConfig.questionCount,
  });
}
