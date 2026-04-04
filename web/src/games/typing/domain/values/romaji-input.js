/**
 * ローマ字入力の状態を表す値オブジェクト
 * kana: 対象のかな文字列
 * patterns: 受理可能なローマ字パターンの配列（例: ['si','shi']）
 * accepted: 確定済みのローマ字文字列
 * candidates: まだ候補に残っているパターン配列
 */
export function createRomajiInput(kana, patterns) {
  return Object.freeze({
    kana,
    patterns: Object.freeze([...patterns]),
    accepted: '',
    candidates: Object.freeze([...patterns]),
  });
}

/**
 * 1文字入力を受けてローマ字入力状態を進める
 * @returns {{ ok: boolean, next: object }} ok=true なら入力受理
 */
export function advanceRomajiInput(input, char) {
  const pos = input.accepted.length;
  const nextAccepted = input.accepted + char;

  // 候補を絞り込む: pos 位置の文字が char と一致するパターンのみ残す
  const nextCandidates = input.candidates.filter(
    (p) => p.length > pos && p[pos] === char
  );

  if (nextCandidates.length === 0) {
    return { ok: false, next: input };
  }

  // いずれかのパターンと完全一致したら完了
  const completed = nextCandidates.some((p) => p === nextAccepted);

  return {
    ok: true,
    next: Object.freeze({
      kana: input.kana,
      patterns: input.patterns,
      accepted: nextAccepted,
      candidates: Object.freeze(nextCandidates),
    }),
    completed,
  };
}
