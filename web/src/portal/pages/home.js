import { GameCard } from '../../shared/components/game-card.js';
import gameData from '../data/games.json';

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-home';
    page.innerHTML = `
      <section class="hero">
        <div class="hero__inner">
          <h1 class="hero__title">
            <img src="/logo.png" alt="" class="hero__icon" aria-hidden="true" width="64" height="64">
            ペンギンげーむず！
          </h1>
          <p class="hero__subtitle">ブラウザで遊べるミニゲーム集</p>
        </div>
      </section>
      <section class="game-list">
        <h2 class="game-list__heading">ゲーム一覧</h2>
        <div class="game-list__grid" id="game-list-grid"></div>
      </section>
    `;

    const grid = page.querySelector('#game-list-grid');
    gameData.forEach(data => {
      grid.appendChild(GameCard.create(data));
    });

    return page;
  },
};
