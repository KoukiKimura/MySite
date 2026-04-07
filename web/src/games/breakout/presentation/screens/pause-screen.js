export function createPauseScreen({ onResume, onRetry, onMenu }) {
  const el = document.createElement('div');
  el.className = 'breakout-pause-screen';
  el.innerHTML = `
    <div class="breakout-dialog">
      <p class="breakout-dialog__eyebrow">Paused</p>
      <h2 class="breakout-dialog__title">一時停止</h2>
      <p class="breakout-dialog__text">ゲームを再開するか、最初からやり直すかを選択できます。</p>
      <div class="breakout-dialog__actions">
        <button type="button" class="breakout-button breakout-button--primary" data-action="resume">再開</button>
        <button type="button" class="breakout-button breakout-button--secondary" data-action="retry">1-1からやり直す</button>
        <button type="button" class="breakout-button breakout-button--ghost" data-action="menu">説明ページへ戻る</button>
      </div>
    </div>
  `;

  const handleClick = (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;

    if (!action) return;

    if (action === 'resume') onResume();
    if (action === 'retry') onRetry();
    if (action === 'menu') onMenu();
  };

  el.addEventListener('click', handleClick);

  return {
    getElement() {
      return el;
    },
    destroy() {
      el.removeEventListener('click', handleClick);
      el.remove();
    },
  };
}

