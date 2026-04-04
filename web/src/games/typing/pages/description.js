export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-description';
    page.innerHTML = `
      <h1>タイピングペンギン</h1>
      <p>ローマ字タイピングで腕試し！日本語の問題をローマ字で入力するタイピングゲームです。</p>
      <p><strong>PC推奨</strong> — 物理キーボードが必要です。</p>
      <a href="#/games/typing/play" class="btn btn--primary">ゲームを始める</a>
    `;
    return page;
  },
};
