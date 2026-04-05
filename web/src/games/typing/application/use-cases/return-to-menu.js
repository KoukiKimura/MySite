/**
 * UC-5: メニューに戻る
 *
 * @param {object} session - 現在のセッション（破棄対象）
 * @param {function} showScreen - 画面遷移関数 ('menu' | 'countdown' | 'play' | 'result')
 */
export function returnToMenu(session, showScreen) {
  // セッションはこの関数の呼び出し元で参照を断ち切る（null代入はプレゼンテーション層の責務）
  showScreen('menu');
}
