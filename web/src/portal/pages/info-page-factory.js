import { getSiteMode } from '../../shared/state/site-mode.js';
import { escapeAttr, escapeHtml } from '../../shared/utils/escape.js';

export function createInfoPage({ slug, title, lead, sections = [], links = [] }) {
  const mode = getSiteMode();
  const page = document.createElement('div');
  page.className = `page-info page-info--${escapeAttr(slug)}`;
  page.innerHTML = `
    <section class="info-page">
      <p class="info-page__eyebrow">${escapeHtml(slug)}</p>
      <h1 class="info-page__title">${escapeHtml(title)}</h1>
      <p class="info-page__lead">${escapeHtml(lead)}</p>

      <div class="info-page__sections">
        ${sections.map(section => `
          <section class="info-page__section">
            <h2 class="info-page__section-title">${escapeHtml(section.heading)}</h2>
            ${(section.body ?? []).map(paragraph => `<p class="info-page__text">${escapeHtml(paragraph)}</p>`).join('')}
          </section>
        `).join('')}
      </div>

      <div class="info-page__actions">
        ${links.map(link => `<a href="#${escapeAttr(link.path)}" class="info-page__link">${escapeHtml(link.label)}</a>`).join('')}
        <a href="#/${escapeAttr(mode)}" class="info-page__link info-page__link--primary">ホームへ戻る</a>
      </div>
    </section>
  `;
  return page;
}
