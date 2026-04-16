import { escapeAttr, escapeHtml } from '../utils/escape.js';

export const FeatureCard = {
  create({ id, title, description, imageUrl = '', linkPath = '', mode = 'kids', tone = 'sunny' }) {
    const article = document.createElement('article');
    article.className = `feature-card feature-card--${escapeAttr(mode)} feature-card--${escapeAttr(tone)}`;
    article.dataset.featureId = String(id ?? '');

    const body = `
      ${imageUrl ? `<div class="feature-card__media"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(title)}" loading="lazy"></div>` : ''}
      <p class="feature-card__eyebrow">${mode === 'teens' ? 'Topic' : '特集'}</p>
      <h3 class="feature-card__title">${escapeHtml(title)}</h3>
      <p class="feature-card__desc">${escapeHtml(description)}</p>
    `;

    if (linkPath) {
      article.innerHTML = `<a href="#${escapeAttr(linkPath)}" class="feature-card__link">${body}</a>`;
    } else {
      article.innerHTML = `<div class="feature-card__link feature-card__link--static">${body}</div>`;
    }

    return article;
  },
};
