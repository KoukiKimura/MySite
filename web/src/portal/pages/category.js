import { GameCard } from '../../shared/components/game-card.js';
import { FeatureCard } from '../../shared/components/feature-card.js';
import { Router } from '../../shared/router/router.js';
import { setPortalContext, setSiteMode, SiteMode } from '../../shared/state/site-mode.js';
import { UIState } from '../../shared/state/ui-state.js';
import { filterCollection } from '../application/home-filters.js';
import { buildFeaturedOrder } from '../application/recommendation-service.js';
import { getCategoryContent, getCategoryMeta, isValidCategory } from '../data/category-content.js';
import { HOME_CONTENT } from '../data/home-content.js';
import { mockHistoryRepository } from '../../user/repository/mock-history-repository.js';
import { mockProfileRepository } from '../../user/repository/mock-profile-repository.js';
import { mockRecordRepository } from '../../user/repository/mock-record-repository.js';
import gameData from '../data/games.json';

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = String(value ?? '');
  return div.innerHTML;
}

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getSearchScope(mode, category) {
  return `category:${mode}:${category}`;
}

function toSearchableItems(items = [], category) {
  return items.map(item => ({
    ...item,
    category,
  }));
}

function renderEmptyState(mode) {
  return `
    <div class="portal-empty">
      <p class="portal-empty__title">みつからなかったよ</p>
      <p class="portal-empty__text">キーワードを変えるか、トップからさがしてみよう。</p>
      <a href="#/${escapeAttr(mode)}" class="portal-empty__link">トップへ戻る</a>
    </div>
  `;
}

let pageRef = null;
let state = null;
let clickHandler = null;
let inputHandler = null;
let submitHandler = null;

function getCurrentContent() {
  return state ? getCategoryContent(state.mode, state.category) : null;
}

function getCurrentMeta() {
  return state ? getCategoryMeta(state.mode, state.category) : null;
}

function getCategoryGames() {
  const content = getCurrentContent();
  const gameIds = content?.gameIds ?? [];

  return gameData
    .filter(game => gameIds.includes(game.id))
    .map(game => ({ ...game, category: state.category }));
}

function saveSearchHistory(trigger) {
  const query = state.query.trim();
  if (!query) {
    return;
  }

  mockHistoryRepository.save({
    mode: state.mode,
    route: `/${state.mode}/${state.category}`,
    category: state.category,
    query,
    trigger,
  });
}

function renderTopicList(items) {
  if (!items.length) {
    return '';
  }

  return `
    <div class="portal-topic-list">
      ${items.map(item => `
        <article class="portal-topic-card">
          <div class="portal-topic-card__meta">
            ${item.badge ? `<span class="portal-topic-card__badge">${escapeHtml(item.badge)}</span>` : ''}
            ${item.tags?.length ? `<span class="portal-topic-card__tags">${escapeHtml(item.tags.join(' / '))}</span>` : ''}
          </div>
          <h3 class="portal-topic-card__title">${escapeHtml(item.title)}</h3>
          <p class="portal-topic-card__desc">${escapeHtml(item.description)}</p>
          ${item.linkPath ? `<a href="#${escapeAttr(item.linkPath)}" class="portal-topic-card__link">開く</a>` : ''}
        </article>
      `).join('')}
    </div>
  `;
}

function renderSidebar() {
  const content = getCurrentContent();
  const homeContent = HOME_CONTENT[state.mode] ?? HOME_CONTENT[SiteMode.KIDS];
  const recommendationIds = content?.recommendationIds ?? [];
  const recommendations = homeContent.featureItems.filter(item => recommendationIds.includes(item.id));

  const linksEl = pageRef.querySelector('#category-safety-links');
  const recommendationEl = pageRef.querySelector('#category-recommendations');
  linksEl.innerHTML = `
    <h2 class="portal-sidebar__title">案内</h2>
    <div class="portal-sidebar__stack">
      ${(content?.sidebarLinks ?? []).map(link => `
        <a href="#${escapeAttr(link.path)}" class="portal-sidebar__link-card">
          <strong>${escapeHtml(link.title)}</strong>
          <span>${escapeHtml(link.description)}</span>
        </a>
      `).join('')}
    </div>
  `;

  recommendationEl.innerHTML = `
    <h2 class="portal-sidebar__title">おすすめ</h2>
    <div class="portal-sidebar__stack" id="category-recommendation-list"></div>
  `;

  const listEl = recommendationEl.querySelector('#category-recommendation-list');
  recommendations.forEach(item => {
    listEl.appendChild(FeatureCard.create(item));
  });
}

function renderCategorySections() {
  const content = getCurrentContent();
  const featureGrid = pageRef.querySelector('#category-feature-grid');
  const gamesGrid = pageRef.querySelector('#category-games-grid');
  const topicsArea = pageRef.querySelector('#category-topic-list');
  const keywordArea = pageRef.querySelector('#category-keywords');

  keywordArea.innerHTML = (content?.keywords ?? []).map(keyword => `
    <button type="button" class="portal-chip" data-category-keyword="${escapeAttr(keyword)}">${escapeHtml(keyword)}</button>
  `).join('');

  const profile = mockProfileRepository.get(state.mode);
  const orderedFeatures = buildFeaturedOrder({
    history: mockHistoryRepository.list({ mode: state.mode, category: state.category }),
    records: mockRecordRepository.list({ mode: state.mode }),
    profile,
    mode: state.mode,
    defaults: content?.featureItems ?? [],
  });

  const filteredFeatures = filterCollection(orderedFeatures, { query: state.query });
  const filteredTopics = filterCollection(toSearchableItems(content?.listItems ?? [], state.category), { query: state.query });
  const filteredGames = filterCollection(getCategoryGames(), { query: state.query });

  featureGrid.innerHTML = '';
  gamesGrid.innerHTML = '';
  topicsArea.innerHTML = '';

  if (!filteredFeatures.length && !filteredTopics.length && !filteredGames.length) {
    featureGrid.innerHTML = renderEmptyState(state.mode);
    return;
  }

  if (!filteredFeatures.length) {
    featureGrid.innerHTML = renderEmptyState(state.mode);
  } else {
    filteredFeatures.forEach(item => featureGrid.appendChild(FeatureCard.create(item)));
  }

  topicsArea.innerHTML = renderTopicList(filteredTopics);

  filteredGames.forEach(game => {
    gamesGrid.appendChild(GameCard.create(game));
  });
}

function renderCategoryPage() {
  const meta = getCurrentMeta();
  const content = getCurrentContent();

  pageRef.className = `page-category page-category--${state.mode}`;
  pageRef.innerHTML = `
    <section class="category-hero">
      <nav class="category-breadcrumb">
        <a href="#/${escapeAttr(state.mode)}">トップ</a>
        <span>/</span>
        <span>${escapeHtml(meta?.label ?? '')}</span>
      </nav>

      <div class="category-hero__headline">
        <span class="category-hero__icon" aria-hidden="true">${escapeHtml(meta?.icon ?? '')}</span>
        <div>
          <h1 class="category-hero__title">${escapeHtml(content?.title ?? meta?.label ?? '')}</h1>
          <p class="category-hero__text">${escapeHtml(content?.description ?? meta?.description ?? '')}</p>
        </div>
      </div>

      <form class="portal-search" id="category-search-form">
        <div class="portal-search__field">
          <input
            id="category-search-input"
            class="portal-search__input"
            type="search"
            placeholder="${escapeAttr(content?.searchPlaceholder ?? 'このカテゴリでさがす')}"
            value="${escapeAttr(state.query)}"
          >
          <button type="submit" class="portal-search__button">このカテゴリでさがす</button>
        </div>
      </form>
    </section>

    <div class="portal-layout">
      <section class="portal-main">
        <section class="portal-section">
          <div class="portal-keywords" id="category-keywords"></div>
        </section>
        <section class="portal-section">
          <div class="portal-section__header">
            <div>
              <p class="portal-section__eyebrow">featured</p>
              <h2 class="portal-section__title">特集カード</h2>
            </div>
          </div>
          <div class="portal-feature-grid" id="category-feature-grid"></div>
        </section>
        <section class="portal-section">
          <div class="portal-section__header">
            <div>
              <p class="portal-section__eyebrow">topics</p>
              <h2 class="portal-section__title">関連トピック</h2>
            </div>
          </div>
          <div id="category-topic-list"></div>
        </section>
        <section class="portal-section">
          <div class="portal-section__header">
            <div>
              <p class="portal-section__eyebrow">games</p>
              <h2 class="portal-section__title">カテゴリに関連するゲーム</h2>
            </div>
          </div>
          <div class="game-list__grid portal-games-grid" id="category-games-grid"></div>
        </section>
      </section>

      <aside class="portal-sidebar">
        <section class="portal-sidebar__section" id="category-safety-links"></section>
        <section class="portal-sidebar__section" id="category-recommendations"></section>
      </aside>
    </div>
  `;

  renderCategorySections();
  renderSidebar();
}

function handleClick(event) {
  const keywordButton = event.target.closest('[data-category-keyword]');
  if (!keywordButton) {
    return;
  }

  state.query = keywordButton.dataset.categoryKeyword ?? '';
  UIState.setSearchQuery(getSearchScope(state.mode, state.category), state.query);
  const input = pageRef.querySelector('#category-search-input');
  if (input) {
    input.value = state.query;
  }
  saveSearchHistory('keyword');
  renderCategorySections();
}

function handleInput(event) {
  const input = event.target.closest('#category-search-input');
  if (!input) {
    return;
  }

  state.query = input.value.trim();
  UIState.setSearchQuery(getSearchScope(state.mode, state.category), state.query);
  renderCategorySections();
}

function handleSubmit(event) {
  if (!event.target.closest('#category-search-form')) {
    return;
  }

  event.preventDefault();
  state.query = pageRef.querySelector('#category-search-input')?.value.trim() ?? '';
  UIState.setSearchQuery(getSearchScope(state.mode, state.category), state.query);
  saveSearchHistory('submit');
  renderCategorySections();
}

export default {
  create({ path, params }) {
    const mode = params?.mode ?? SiteMode.KIDS;
    const category = params?.category ?? '';

    if (!isValidCategory(mode, category)) {
      const page = document.createElement('div');
      page.className = 'page-category page-category--empty';
      page.innerHTML = renderEmptyState(mode);
      queueMicrotask(() => Router.navigate(`/${mode}`));
      return page;
    }

    setSiteMode(mode, 'route');
    setPortalContext({ lastPortalRoute: path, mode, category });

    state = {
      mode,
      category,
      query: UIState.getSearchQuery(getSearchScope(mode, category)),
    };

    pageRef = document.createElement('div');
    clickHandler = handleClick;
    inputHandler = handleInput;
    submitHandler = handleSubmit;

    pageRef.addEventListener('click', clickHandler);
    pageRef.addEventListener('input', inputHandler);
    pageRef.addEventListener('submit', submitHandler);

    renderCategoryPage();
    return pageRef;
  },

  destroy() {
    if (pageRef && clickHandler) {
      pageRef.removeEventListener('click', clickHandler);
    }

    if (pageRef && inputHandler) {
      pageRef.removeEventListener('input', inputHandler);
    }

    if (pageRef && submitHandler) {
      pageRef.removeEventListener('submit', submitHandler);
    }

    pageRef = null;
    state = null;
    clickHandler = null;
    inputHandler = null;
    submitHandler = null;
  },
};
