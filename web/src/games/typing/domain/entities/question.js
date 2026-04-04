let questionIdSeq = 0;

/**
 * 問題エンティティを生成する
 * @param {{ display: string, reading: string }} raw - 問題の元データ
 * @returns {Readonly<{ id: number, display: string, reading: string }>}
 */
export function createQuestion(raw) {
  questionIdSeq += 1;
  return Object.freeze({
    id: questionIdSeq,
    display: raw.display,
    reading: raw.reading,
  });
}

/** テスト用: ID連番をリセットする */
export function _resetQuestionIdSeq() {
  questionIdSeq = 0;
}
