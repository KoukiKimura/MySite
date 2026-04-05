/**
 * リザルト画面 (G-5)
 * @param {object} result - calculateFinalResult() の戻り値
 * @param {{ onRetry, onMenu }} callbacks
 */
export function createResultScreen(result, callbacks) {
  const { onRetry, onMenu } = callbacks;

  const formatTime = (ms) => {
    const sec = Math.round(ms / 1000);
    return `${sec}秒`;
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'S': return '#FFD700';
      case 'A': return '#FF5722';
      case 'B': return '#2196F3';
      case 'C': return '#4CAF50';
      default:  return '#9E9E9E';
    }
  };

  const el = document.createElement('div');
  el.className = 'typing-result-screen';
  el.innerHTML = `
    <div class="typing-result-inner">
      <h2 class="typing-result-title">🎉 リザルト</h2>

      <div class="typing-result-rank" style="color: ${getRankColor(result.rank)}">
        ${result.rank}
      </div>

      <div class="typing-result-score">
        <span class="typing-result-total">${result.total.toLocaleString()}</span> 点
      </div>

      <table class="typing-result-table">
        <tr><td>正解タイプ数</td><td>${result.correctCount} 文字</td></tr>
        <tr><td>ミスタイプ数</td><td>${result.missCount} 回</td></tr>
        <tr><td>正確率</td><td>${result.accuracy.toFixed(1)} %</td></tr>
        <tr><td>WPM</td><td>${result.wpm.toFixed(1)}</td></tr>
        <tr><td>最大コンボ</td><td>${result.maxCombo}</td></tr>
        <tr><td>プレイ時間</td><td>${formatTime(result.elapsedTime)}</td></tr>
      </table>

      <div class="typing-result-buttons">
        <button class="typing-btn typing-retry-btn">🔄 リトライ</button>
        <button class="typing-btn typing-menu-btn">🏠 メニューへ</button>
      </div>
    </div>
  `;

  el.querySelector('.typing-retry-btn').addEventListener('click', onRetry);
  el.querySelector('.typing-menu-btn').addEventListener('click', onMenu);

  return {
    getElement() { return el; },
    destroy() { el.remove(); },
  };
}
