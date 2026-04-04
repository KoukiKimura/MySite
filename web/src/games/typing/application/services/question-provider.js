import { createQuestion } from '../../domain/entities/question.js';

const MAX_TIME_LIMIT_QUESTIONS = 50;

/**
 * Fisher-Yates シャッフル（破壊的）
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 出題プロバイダーを生成する
 * @param {import('../repositories/question-repository.js').QuestionRepository} repository
 */
export function createQuestionProvider(repository) {
  return {
    /**
     * ゲーム設定に基づいて出題リストを生成する
     * @param {object} config - createGameConfig() で生成した設定
     * @returns {Promise<object[]>} Question エンティティの配列
     */
    async provide(config) {
      const rawList = await repository.fetchQuestions(config.questionMode, config.difficulty);
      const shuffled = shuffle([...rawList]);

      let selected;
      if (config.gameMode === 'fixed-count') {
        selected = shuffled.slice(0, config.questionCount);
      } else {
        selected = shuffled.slice(0, MAX_TIME_LIMIT_QUESTIONS);
      }

      return selected.map((raw) => createQuestion(raw));
    },
  };
}
