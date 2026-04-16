import { Router } from '../router/router.js';
import { escapeAttr, escapeHtml } from '../utils/escape.js';

export const CategoryRail = {
  create({ categories = [], mode = 'kids' }) {
    const rail = document.createElement('nav');
    rail.className = `category-rail category-rail--${escapeAttr(mode)}`;
    rail.setAttribute('aria-label', 'カテゴリ');

    rail.innerHTML = categories.map(category => `
      <button
        type="button"
        class="category-rail__item"
        data-category-id="${escapeAttr(category.id)}"
        aria-label="${escapeAttr(category.label)}"
      >
        <span class="category-rail__icon" aria-hidden="true">${escapeHtml(category.icon ?? '•')}</span>
        <span class="category-rail__label">${escapeHtml(category.label)}</span>
      </button>
    `).join('');

    rail.addEventListener('click', event => {
      const target = event.target.closest('[data-category-id]');
      if (!target) {
        return;
      }

      const categoryId = target.dataset.categoryId;
      if (!categoryId) {
        return;
      }

      Router.navigate(`/${mode}/${categoryId}`);
    });

    return rail;
  },
};
