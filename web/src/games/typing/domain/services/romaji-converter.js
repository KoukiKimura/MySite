/** ローマ字変換テーブル */
const ROMAJI_TABLE = {
  // 基本五十音
  'あ': ['a'],   'い': ['i'],   'う': ['u'],   'え': ['e'],   'お': ['o'],
  'か': ['ka'],  'き': ['ki'],  'く': ['ku'],  'け': ['ke'],  'こ': ['ko'],
  'さ': ['sa'],  'し': ['si', 'shi', 'ci'],
  'す': ['su'],  'せ': ['se'],  'そ': ['so'],
  'た': ['ta'],  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],  'て': ['te'],  'と': ['to'],
  'な': ['na'],  'に': ['ni'],  'ぬ': ['nu'],  'ね': ['ne'],  'の': ['no'],
  'は': ['ha'],  'ひ': ['hi'],  'ふ': ['hu', 'fu'],
  'へ': ['he'],  'ほ': ['ho'],
  'ま': ['ma'],  'み': ['mi'],  'む': ['mu'],  'め': ['me'],  'も': ['mo'],
  'や': ['ya'],  'ゆ': ['yu'],  'よ': ['yo'],
  'ら': ['ra'],  'り': ['ri'],  'る': ['ru'],  'れ': ['re'],  'ろ': ['ro'],
  'わ': ['wa'],  'を': ['wo'],

  // 濁音
  'が': ['ga'],  'ぎ': ['gi'],  'ぐ': ['gu'],  'げ': ['ge'],  'ご': ['go'],
  'ざ': ['za'],  'じ': ['zi', 'ji'],
  'ず': ['zu'],  'ぜ': ['ze'],  'ぞ': ['zo'],
  'だ': ['da'],  'ぢ': ['di'],  'づ': ['du', 'zu'],
  'で': ['de'],  'ど': ['do'],
  'ば': ['ba'],  'び': ['bi'],  'ぶ': ['bu'],  'べ': ['be'],  'ぼ': ['bo'],

  // 半濁音
  'ぱ': ['pa'],  'ぴ': ['pi'],  'ぷ': ['pu'],  'ぺ': ['pe'],  'ぽ': ['po'],

  // 拗音
  'きゃ': ['kya'],  'きゅ': ['kyu'],  'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'],  'しゅ': ['syu', 'shu'],  'しょ': ['syo', 'sho'],
  'ちゃ': ['tya', 'cha', 'cya'],  'ちゅ': ['tyu', 'chu', 'cyu'],  'ちょ': ['tyo', 'cho', 'cyo'],
  'にゃ': ['nya'],  'にゅ': ['nyu'],  'にょ': ['nyo'],
  'ひゃ': ['hya'],  'ひゅ': ['hyu'],  'ひょ': ['hyo'],
  'みゃ': ['mya'],  'みゅ': ['myu'],  'みょ': ['myo'],
  'りゃ': ['rya'],  'りゅ': ['ryu'],  'りょ': ['ryo'],
  'ぎゃ': ['gya'],  'ぎゅ': ['gyu'],  'ぎょ': ['gyo'],
  'じゃ': ['zya', 'ja', 'jya'],  'じゅ': ['zyu', 'ju', 'jyu'],  'じょ': ['zyo', 'jo', 'jyo'],
  'びゃ': ['bya'],  'びゅ': ['byu'],  'びょ': ['byo'],
  'ぴゃ': ['pya'],  'ぴゅ': ['pyu'],  'ぴょ': ['pyo'],

  // 特殊
  'ー': ['-'],
};

const YOUON_SUFFIXES = new Set(['ゃ', 'ゅ', 'ょ']);
const VOWEL_KANA = new Set(['あ', 'い', 'う', 'え', 'お']);
const NA_ROW = new Set(['な', 'に', 'ぬ', 'ね', 'の']);
const YA_ROW = new Set(['や', 'ゆ', 'よ']);

/**
 * ひらがな文字列をかなチャンクに分解する
 * @param {string} reading
 * @returns {string[]}
 */
export function decompose(reading) {
  const chunks = [];
  let i = 0;
  while (i < reading.length) {
    // 拗音（2文字チャンク）
    if (i + 1 < reading.length && YOUON_SUFFIXES.has(reading[i + 1])) {
      chunks.push(reading[i] + reading[i + 1]);
      i += 2;
    } else {
      chunks.push(reading[i]);
      i += 1;
    }
  }
  return chunks;
}

/**
 * 「ん」のローマ字パターンを返す
 * @param {string|null} nextChunk - 次のかなチャンク
 * @returns {string[]}
 */
export function getNPatterns(nextChunk) {
  if (nextChunk === null) return ['nn'];
  const first = nextChunk[0];
  if (VOWEL_KANA.has(first) || NA_ROW.has(first) || YA_ROW.has(first)) {
    return ['nn'];
  }
  return ['n', 'nn'];
}

/**
 * 「っ」+次チャンクの結合ローマ字パターンを返す
 * @param {string[]} nextPatterns - 次チャンクのローマ字パターン配列
 * @returns {string[]}
 */
export function getTsuPatterns(nextPatterns) {
  if (!nextPatterns || nextPatterns.length === 0) {
    return ['xtu', 'xtsu'];
  }
  const combined = [];
  // 先頭子音を重ねたパターン
  for (const pattern of nextPatterns) {
    combined.push(pattern[0] + pattern);
  }
  // xtu/xtsu プレフィックス
  for (const pattern of nextPatterns) {
    combined.push('xtu' + pattern);
    combined.push('xtsu' + pattern);
  }
  return combined;
}

/**
 * ひらがな文字列から照合用データを生成する
 * @param {string} reading
 * @returns {Array<{ kana: string, patterns: string[] }>}
 */
export function buildMatchData(reading) {
  const chunks = decompose(reading);
  const result = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const nextChunk = i + 1 < chunks.length ? chunks[i + 1] : null;

    if (chunk === 'ん') {
      result.push({ kana: chunk, patterns: getNPatterns(nextChunk) });
    } else if (chunk === 'っ') {
      if (nextChunk) {
        const nextPatterns = ROMAJI_TABLE[nextChunk];
        const combinedPatterns = getTsuPatterns(nextPatterns);
        result.push({ kana: 'っ' + nextChunk, patterns: combinedPatterns });
        i++; // 次チャンクをスキップ
      } else {
        result.push({ kana: chunk, patterns: ['xtu', 'xtsu'] });
      }
    } else {
      const patterns = ROMAJI_TABLE[chunk];
      if (patterns) {
        result.push({ kana: chunk, patterns });
      }
    }
  }

  return result;
}
