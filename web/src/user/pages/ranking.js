import { mockRankingRepository } from '../repository/mock-ranking-repository.js';

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-ranking';
    page.innerHTML = `
      <section class="ranking">
        <h1 class="ranking__title">ランキング 🏆</h1>
        <table class="ranking__table">
          <thead class="ranking__thead">
            <tr>
              <th class="ranking__th">順位</th>
              <th class="ranking__th">プレイヤー</th>
              <th class="ranking__th">スコア</th>
              <th class="ranking__th">WPM</th>
              <th class="ranking__th">正確率</th>
            </tr>
          </thead>
          <tbody class="ranking__tbody"></tbody>
        </table>
        <div class="ranking__note">
          ⚠️ ランキング機能は準備中です（ダミーデータを表示中）
        </div>
      </section>
    `;

    const tbody = page.querySelector('.ranking__tbody');

    mockRankingRepository.getAll().then(rankings => {
      rankings.forEach(entry => {
        const tr = document.createElement('tr');
        tr.className = 'ranking__row';
        tr.innerHTML = `
          <td class="ranking__cell ranking__cell--rank">${entry.rank}</td>
          <td class="ranking__cell">${escapeHtml(entry.userName)}</td>
          <td class="ranking__cell ranking__cell--score">${entry.score.toLocaleString()}</td>
          <td class="ranking__cell">${entry.wpm.toFixed(1)}</td>
          <td class="ranking__cell">${entry.accuracy.toFixed(1)}%</td>
        `;
        tbody.appendChild(tr);
      });
    });

    return page;
  },
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
