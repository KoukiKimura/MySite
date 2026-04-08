function isMobileDevice() {
  return navigator.maxTouchPoints > 0 && window.innerWidth < 1024;
}

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-game-desc';
    page.innerHTML = `
      <section class="game-desc">
        <h1 class="game-desc__title">
          <img src="/logo.png" alt="" width="36" height="36" style="vertical-align:middle;margin-right:8px;">
          ペンギンブロックブレイク
        </h1>
        <p class="game-desc__text">
          マウスでバーを動かし、右クリックでボールを発射してブロックを壊すアクションゲームです。
          後半の 2-x ステージは盤面が広くなり、アイテム運も絡みます。
        </p>
        <div class="game-desc__rules">
          <h2 class="game-desc__rules-title">遊び方</h2>
          <ol class="game-desc__rules-list">
            <li>マウスでバーを左右に動かす</li>
            <li>右クリックでボールを発射する</li>
            <li>ボールを落とさずブロックを全部壊す</li>
            <li>落下アイテムで追加ボールやバーの強化・弱体化が発生する</li>
            <li>残機 0 でゲームオーバー、再挑戦は最初から</li>
          </ol>
        </div>
        <div class="breakout-desc__note">
          ブロックを壊す基本点は 100 点です。バーに触れずに連続破壊すると、2個目以降はコンボボーナスが上乗せされます。
        </div>
        <div class="game-desc__mobile-warning" hidden>
          <p>このゲームはマウス操作前提のため、PCブラウザでのプレイを推奨します。</p>
        </div>
        <div class="game-desc__actions">
          <a href="#/games/breakout/play" class="game-desc__play-btn btn btn--primary">プレイ開始</a>
        </div>
      </section>
    `;

    if (isMobileDevice()) {
      page.querySelector('.game-desc__mobile-warning').hidden = false;
    }

    return page;
  },
};
