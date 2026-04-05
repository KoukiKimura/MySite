export function createJsonQuestionRepository() {
  const cache = new Map();

  return {
    async fetchQuestions(questionMode, difficulty) {
      const fileName = `${questionMode}-${difficulty}.json`;
      if (cache.has(fileName)) {
        return cache.get(fileName);
      }

      const url = new URL(`../data/${fileName}`, import.meta.url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`出題データの取得に失敗: ${fileName} (${response.status})`);
      }
      const data = await response.json();
      const questions = data.questions;
      cache.set(fileName, questions);
      return questions;
    },
  };
}
