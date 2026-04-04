export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-home';
    page.innerHTML = `
      <section class="hero">
        <h1 class="hero__title">🐧 ペンギンげーむず！</h1>
        <p class="hero__subtitle">ブラウザで遊べるミニゲーム集</p>
      </section>
      <section class="game-list" id="game-list">
        <h2>ゲーム一覧</h2>
        <div class="game-list__grid" id="game-list-grid"></div>
      </section>
    `;
    return page;
  },
};
