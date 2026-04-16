import { Router } from '../../shared/router/router.js';
import { getSiteMode } from '../../shared/state/site-mode.js';
import { mockAuthRepository } from '../../user/repository/mock-auth-repository.js';
import { mockHistoryRepository } from '../../user/repository/mock-history-repository.js';
import { mockRecordRepository } from '../../user/repository/mock-record-repository.js';
import gameData from '../../portal/data/games.json';

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-admin';

    const user = mockAuthRepository.getCurrentUser();
    if (!user) {
      page.innerHTML = `
        <section class="info-page">
          <p class="info-page__eyebrow">admin</p>
          <h1 class="info-page__title">管理画面へ移動しています</h1>
          <p class="info-page__lead">ログインが必要です。</p>
        </section>
      `;
      queueMicrotask(() => Router.navigate('/login'));
      return page;
    }

    const mode = getSiteMode();
    const historyCount = mockHistoryRepository.list({ includeDeleted: true }).length;
    const recordCount = mockRecordRepository.list({ includeDeleted: true }).length;
    const availableGames = gameData.filter(game => game.status === 'available').length;

    page.innerHTML = `
      <section class="admin-dashboard">
        <header class="admin-dashboard__header">
          <p class="admin-dashboard__eyebrow">admin mock</p>
          <h1 class="admin-dashboard__title">管理画面</h1>
          <p class="admin-dashboard__lead">${escapeHtml(user.name)} さんでログイン中です。現段階では運営確認用のモックを表示します。</p>
        </header>
        <div class="admin-dashboard__grid">
          <article class="admin-panel">
            <h2>ダッシュボード</h2>
            <p>現在モード: ${escapeHtml(mode)}</p>
            <p>公開ゲーム数: ${availableGames}</p>
          </article>
          <article class="admin-panel">
            <h2>ローカル保存</h2>
            <p>検索履歴件数: ${historyCount}</p>
            <p>プレイ記録件数: ${recordCount}</p>
          </article>
          <article class="admin-panel">
            <h2>安全管理</h2>
            <p>掲載基準、外部リンク注意、プライバシー方針への導線を確認できます。</p>
          </article>
          <article class="admin-panel">
            <h2>将来監査枠</h2>
            <p>論理削除確認、権限管理、監査ログは DB 導入後に本実装予定です。</p>
          </article>
        </div>
      </section>
    `;

    return page;
  },
};
