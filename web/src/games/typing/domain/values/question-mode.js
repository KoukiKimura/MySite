export const QuestionMode = Object.freeze({
  JA_ROMAJI: 'ja-romaji',
  EN_WORD:   'en-word',
});

const PREFIX_MAP = {
  [QuestionMode.JA_ROMAJI]: 'ja',
  [QuestionMode.EN_WORD]: 'en',
};

export function getDataFilePrefix(mode) {
  return PREFIX_MAP[mode] ?? null;
}
