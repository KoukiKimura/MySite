export function createMenuScreen({ onStart }) {
  const el = document.createElement('div');
  el.className = 'breakout-menu-screen';
  el.innerHTML = `
    <div class="breakout-menu-card">
      <p class="breakout-menu-card__eyebrow">Mouse Action Game</p>
      <h2 class="breakout-menu-card__title">ペンギンブロックブレイク</h2>
      <p class="breakout-menu-card__text">
        バーをマウスで動かし、右クリックでボールを発射して 1-1 から 2-5 まで突破します。
        バーに触れずにブロックを連続で壊すほどコンボ得点が伸び、落下アイテムで戦況も変化します。
      </p>
      <ul class="breakout-menu-card__rules">
        <li>サーブ開始と再開は右クリックで発射</li>
        <li>残機は 3。ボールを落とすと 1 減少</li>
        <li>追加ボールは全ボールを落とすまで有効</li>
        <li>後半 2-x は大型レイアウトの高難度ステージ</li>
      </ul>
      <div class="breakout-menu-card__actions">
        <button type="button" class="breakout-button breakout-button--primary">ゲーム開始</button>
        <a href="#/games/breakout" class="breakout-button breakout-button--ghost">説明ページへ戻る</a>
      </div>
    </div>
  `;

  const startButton = el.querySelector('.breakout-button--primary');
  startButton.addEventListener('click', onStart);

  return {
    getElement() {
      return el;
    },
    destroy() {
      startButton.removeEventListener('click', onStart);
      el.remove();
    },
  };
}
