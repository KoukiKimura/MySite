function isMobileDevice() {
  return navigator.maxTouchPoints > 0 && window.innerWidth < 1024;
}

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-game-desc';
    page.innerHTML = `
      <section class="game-desc">
        <h1 class="game-desc__title"><img src="/logo.png" alt="" width="36" height="36" style="vertical-align:middle;margin-right:8px;">タイピングペンギン</h1>
        <p class="game-desc__text">
          日本語や英語の単語をローマ字でタイピング！
          正確さとスピードでスコアを競おう。
        </p>
        <div class="game-desc__rules">
          <h2 class="game-desc__rules-title">遊び方</h2>
          <ol class="game-desc__rules-list">
            <li>出題モード・ゲームモード・難易度を選択</li>
            <li>カウントダウン後にゲーム開始</li>
            <li>表示される単語をローマ字で入力</li>
            <li>正確さとスピードでスコアが決まる</li>
          </ol>
        </div>
        <div class="game-desc__mobile-warning" hidden>
          <p>⚠️ このゲームは物理キーボードでのプレイを推奨しています。PCからアクセスしてください。</p>
        </div>
        <div class="game-desc__actions">
          <a href="#/games/typing/play" class="game-desc__play-btn btn btn--primary">プレイ開始</a>
        </div>
      </section>
    `;

    if (isMobileDevice()) {
      page.querySelector('.game-desc__mobile-warning').hidden = false;
      const playBtn = page.querySelector('.game-desc__play-btn');
      playBtn.classList.add('game-desc__play-btn--disabled');
      playBtn.style.pointerEvents = 'none';
      playBtn.style.opacity = '0.5';
    }

    return page;
  },
};
