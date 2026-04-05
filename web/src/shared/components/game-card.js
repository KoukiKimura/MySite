export const GameCard = {
  /**
   * @param {{ id: string, title: string, description: string, thumbnail: string, path: string, status: string }} gameData
   * @returns {HTMLElement}
   */
  create(gameData) {
    const article = document.createElement('article');
    article.className = 'game-card';

    if (gameData.status === 'coming-soon') {
      article.classList.add('game-card--coming-soon');
      article.innerHTML = `
        <div class="game-card__link game-card__link--disabled">
          <div class="game-card__thumb">
            <img class="game-card__img"
                 src="/assets/img/games/coming-soon.png"
                 alt="Coming Soon"
                 loading="lazy" width="320" height="180">
            <span class="game-card__badge">Coming Soon</span>
          </div>
          <div class="game-card__body">
            <h3 class="game-card__title">${escapeHtml(gameData.title)}</h3>
            <p class="game-card__desc">${escapeHtml(gameData.description)}</p>
          </div>
        </div>
      `;
    } else {
      article.innerHTML = `
        <a href="#${escapeAttr(gameData.path)}" class="game-card__link">
          <div class="game-card__thumb">
            <img class="game-card__img"
                 src="${escapeAttr(gameData.thumbnail)}"
                 alt="${escapeAttr(gameData.title)}"
                 loading="lazy" width="320" height="180">
          </div>
          <div class="game-card__body">
            <h3 class="game-card__title">${escapeHtml(gameData.title)}</h3>
            <p class="game-card__desc">${escapeHtml(gameData.description)}</p>
          </div>
        </a>
      `;
    }

    return article;
  },
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
