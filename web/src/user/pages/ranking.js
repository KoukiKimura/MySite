import { mockRankingRepository } from '../repository/mock-ranking-repository.js';
import { getSiteMode } from '../../shared/state/site-mode.js';

export default {
  create() {
    const page = document.createElement('div');
    const mode = getSiteMode();
    page.className = 'page-ranking';
    page.innerHTML = `
      <section class="ranking">
        <h1 class="ranking__title">ランキング 🏆</h1>
        <p class="ranking__note">現在のモード: ${mode}</p>
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
        <div class="ranking__empty" hidden>まだ記録がありません。</div>
      </section>
    `;

    const tbody = page.querySelector('.ranking__tbody');
    const empty = page.querySelector('.ranking__empty');

    Promise.resolve(mockRankingRepository.getAll({ gameId: 'typing', mode })).then(rankings => {
      if (!rankings.length) {
        empty.hidden = false;
        return;
      }

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
