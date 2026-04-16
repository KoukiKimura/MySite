export const GameCard = {
  /**
   * @param {{ id: string, title: string, description: string, thumbnail: string, path: string, status: string }} gameData
   * @returns {HTMLElement}
   */
  create(gameData) {
    const article = document.createElement('article');
    article.className = 'game-card';
    article.dataset.category = gameData.category || 'all';

    const isComingSoon = gameData.status === 'coming-soon';
    if (isComingSoon) {
      article.classList.add('game-card--coming-soon');
    }

    const thumbContent = gameData.thumbnail
      ? `
        <img class="game-card__img"
             src="${escapeAttr(gameData.thumbnail)}"
             alt="${escapeAttr(gameData.title)}"
             loading="lazy" width="320" height="180">
      `
      : `
        <div class="game-card__placeholder">
          <span class="game-card__emoji">${escapeHtml(gameData.emoji || '🎮')}</span>
          <span class="game-card__placeholder-text">${escapeHtml(gameData.badgeText || 'Pick up')}</span>
        </div>
      `;

    const badgeLabel = isComingSoon ? 'Coming Soon' : (gameData.badge || '');
    const badgeMarkup = badgeLabel
      ? `<span class="game-card__badge">${escapeHtml(badgeLabel)}</span>`
      : '';

    const tagMarkup = Array.isArray(gameData.tags) && gameData.tags.length
      ? `
        <div class="game-card__tags">
          ${gameData.tags.slice(0, 3).map(tag => `<span class="game-card__tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      `
      : '';

    const cardBody = `
      <div class="game-card__thumb">
        ${thumbContent}
        ${badgeMarkup}
      </div>
      <div class="game-card__body">
        <h3 class="game-card__title">${escapeHtml(gameData.title)}</h3>
        <p class="game-card__desc">${escapeHtml(gameData.description)}</p>
        ${tagMarkup}
      </div>
    `;

    if (isComingSoon) {
      article.innerHTML = `
        <div class="game-card__link game-card__link--disabled">
          ${cardBody}
        </div>
      `;
    } else {
      article.innerHTML = `
        <a href="#${escapeAttr(gameData.path)}" class="game-card__link">
          ${cardBody}
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
