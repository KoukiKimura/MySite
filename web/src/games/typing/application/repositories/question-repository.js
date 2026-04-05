/**
 * 出題データリポジトリのインターフェース定義 (JSDoc型)
 *
 * @typedef {Object} QuestionRepository
 * @property {function(string, string): Promise<Array<{display: string, reading: string}>>} fetchQuestions
 *   出題データを取得する
 *   @param {string} questionMode - 出題モード ('ja-romaji' | 'en-word')
 *   @param {string} difficulty   - 難易度 ('easy' | 'normal' | 'hard')
 *   @returns {Promise<Array>} 問題の生データ配列
 */
