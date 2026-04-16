export function createResultScreen(result, { onRetry, onMenu }) {
  const isClear = result.type === 'game-clear';

  const el = document.createElement('div');
  el.className = 'breakout-result-screen';
  el.innerHTML = `
    <div class="breakout-dialog breakout-dialog--result">
      <p class="breakout-dialog__eyebrow">${isClear ? 'Game Clear' : 'Game Over'}</p>
      <h2 class="breakout-dialog__title">${isClear ? '全ステージクリア' : 'ボール切れで終了'}</h2>
      <p class="breakout-dialog__text">
        ${isClear ? `全${escapeHtml(String(result.totalStages))}ステージを突破しました。` : `到達ステージは ${escapeHtml(result.reachedStageId ?? '1-1')} です。`}
      </p>
      <table class="breakout-result-table">
        <tr><th>総スコア</th><td>${escapeHtml(String(result.score))}</td></tr>
        <tr><th>最大コンボ</th><td>${escapeHtml(String(result.maxCombo))}</td></tr>
        <tr><th>クリア数</th><td>${escapeHtml(String(result.clearedStageCount))} / ${escapeHtml(String(result.totalStages))}</td></tr>
        <tr><th>残機</th><td>${escapeHtml(String(result.remainingLives))}</td></tr>
      </table>
      <div class="breakout-dialog__actions">
        <button type="button" class="breakout-button breakout-button--primary" data-action="retry">最初から再挑戦</button>
        <button type="button" class="breakout-button breakout-button--ghost" data-action="menu">説明ページへ戻る</button>
      </div>
    </div>
  `;

  const handleClick = (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;

    if (!action) return;

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

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
