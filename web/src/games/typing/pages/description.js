import { getPortalContext, getSiteMode } from '../../../shared/state/site-mode.js';
import { mockAuthRepository } from '../../../user/repository/mock-auth-repository.js';
import { mockRecordRepository } from '../../../user/repository/mock-record-repository.js';

function isMobileDevice() {
  return navigator.maxTouchPoints > 0 && window.innerWidth < 1024;
}

export default {
  create() {
    const mode = getSiteMode();
    const portalContext = getPortalContext();
    const user = mockAuthRepository.getCurrentUser();
    const bestRecord = mockRecordRepository.getBest({
      gameId: 'typing',
      mode,
      userName: user?.name,
    });
    const latestRecord = mockRecordRepository.list({ gameId: 'typing', mode })[0] ?? null;
    const backPath = portalContext?.lastPortalRoute ?? `/${mode}`;

    const page = document.createElement('div');
    page.className = 'page-game-desc';
    page.innerHTML = `
      <section class="game-desc">
        <div class="game-desc__back">
          <a href="#${backPath}" class="info-page__link">戻る</a>
        </div>
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
        <div class="game-desc__record-grid">
          <article class="portal-side-panel">
            <h2 class="portal-side-panel__title">自己ベスト</h2>
            <p class="portal-side-panel__body">${bestRecord ? `${bestRecord.score.toLocaleString()} 点 / ${bestRecord.wpm.toFixed(1)} WPM` : 'まだ記録がありません。'}</p>
          </article>
          <article class="portal-side-panel">
            <h2 class="portal-side-panel__title">最近のプレイ</h2>
            <p class="portal-side-panel__body">${latestRecord ? `${latestRecord.accuracy.toFixed(1)}% / ${new Date(latestRecord.createdAt).toLocaleString('ja-JP')}` : 'まだプレイされていません。'}</p>
          </article>
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
