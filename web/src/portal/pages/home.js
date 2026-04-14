import { GameCard } from '../../shared/components/game-card.js';
import { onEvent } from '../../shared/events.js';
import { getSiteMode, setSiteMode, SiteMode } from '../../shared/state/site-mode.js';
import { countMatches, filterCollection } from '../application/home-filters.js';
import { HOME_MODES } from '../data/home-content.js';
import gameData from '../data/games.json';

let _page = null;
let _state = null;
let _unsubscribeSiteMode = null;
let _handleClick = null;
let _handleInput = null;
let _handleSubmit = null;

function getModeConfig(mode = getSiteMode()) {
  return HOME_MODES[mode] ?? HOME_MODES[SiteMode.KIDS];
}

function getDefaultTab(modeConfig = getModeConfig()) {
  return modeConfig.tabs[0]?.id ?? 'all';
}

function resetState() {
  const modeConfig = getModeConfig();
  _state = {
    query: '',
    activeTab: getDefaultTab(modeConfig),
  };
}

function ensureActiveTab(modeConfig) {
  if (!modeConfig.tabs.some(tab => tab.id === _state.activeTab)) {
    _state.activeTab = getDefaultTab(modeConfig);
  }
}

function renderKeywordButtons(modeConfig) {
  return modeConfig.keywords.map(keyword => `
    <button type="button" class="portal-chip" data-home-keyword="${escapeAttr(keyword)}">${escapeHtml(keyword)}</button>
  `).join('');
}

function renderHighlights(modeConfig) {
  return modeConfig.highlights.map(item => `
    <article class="portal-highlight">
      <h2 class="portal-highlight__title">${escapeHtml(item.title)}</h2>
      <p class="portal-highlight__text">${escapeHtml(item.description)}</p>
    </article>
  `).join('');
}

function renderSidePanels(modeConfig) {
  return modeConfig.sidePanels.map(panel => `
    <section class="portal-side-panel portal-side-panel--${escapeAttr(panel.tone || 'sky')}">
      <h2 class="portal-side-panel__title">${escapeHtml(panel.title)}</h2>
      ${panel.body ? `<p class="portal-side-panel__body">${escapeHtml(panel.body)}</p>` : ''}
      ${panel.items?.length ? `
        <ul class="portal-side-panel__list">
          ${panel.items.map(item => `<li class="portal-side-panel__item">${escapeHtml(item)}</li>`).join('')}
        </ul>
      ` : ''}
    </section>
  `).join('');
}

function renderTabs(modeConfig) {
  const tabsEl = _page.querySelector('#portal-tabs');
  if (!tabsEl) return;

  tabsEl.innerHTML = modeConfig.tabs.map(tab => {
    const isActive = tab.id === _state.activeTab;

    return `
      <button
        type="button"
        class="portal-tab${isActive ? ' portal-tab--active' : ''}"
        data-home-tab="${escapeAttr(tab.id)}"
        role="tab"
        aria-selected="${String(isActive)}"
      >
        ${escapeHtml(tab.label)}
      </button>
    `;
  }).join('');
}

function renderFeatureCard(item) {
  const innerContent = `
    <span class="portal-feature-card__eyebrow">${escapeHtml(item.eyebrow)}</span>
    <h3 class="portal-feature-card__title">${escapeHtml(item.title)}</h3>
    <p class="portal-feature-card__desc">${escapeHtml(item.description)}</p>
    <div class="portal-feature-card__meta">
      <span class="portal-feature-card__badge">${escapeHtml(item.badge || 'Pick')}</span>
      <span class="portal-feature-card__action">${escapeHtml(item.actionLabel || 'ひらく')}</span>
    </div>
  `;

  const frame = item.href
    ? `<a href="${escapeAttr(item.href)}" class="portal-feature-card__link">${innerContent}</a>`
    : `<div class="portal-feature-card__link portal-feature-card__link--static">${innerContent}</div>`;

  return `
    <article class="portal-feature-card portal-feature-card--${escapeAttr(item.category)}">
      ${frame}
    </article>
  `;
}

function renderEmptyState(title, description) {
  return `
    <div class="portal-empty">
      <h3 class="portal-empty__title">${escapeHtml(title)}</h3>
      <p class="portal-empty__text">${escapeHtml(description)}</p>
    </div>
  `;
}

function getVisibleGames(mode) {
  if (mode === SiteMode.KIDS) {
    return filterCollection(gameData, {
      query: _state.query,
      activeTab: _state.activeTab,
    });
  }

  return filterCollection(gameData, {
    query: _state.query,
    activeTab: 'all',
  });
}

function renderSummary(modeConfig, featuredItems, games) {
  const summaryEl = _page.querySelector('#portal-summary');
  if (!summaryEl) return;

  const activeTabLabel = modeConfig.tabs.find(tab => tab.id === _state.activeTab)?.label ?? modeConfig.tabs[0]?.label ?? 'ぜんぶ';
  const filters = [];

  if (_state.query) {
    filters.push(`「${_state.query}」`);
  }

  if (_state.activeTab !== getDefaultTab(modeConfig)) {
    filters.push(activeTabLabel);
  }

  const filterLabel = filters.length ? filters.join(' / ') : modeConfig.summaryDefault;
  const totalCount = countMatches(featuredItems, games);

  summaryEl.innerHTML = `
    <p class="portal-summary__lead">${escapeHtml(filterLabel)} の結果 <strong class="portal-summary__count">${totalCount}件</strong></p>
    <p class="portal-summary__meta">${escapeHtml(modeConfig.summaryMeta)}</p>
  `;
}

function renderFeaturedSection(modeConfig, featuredItems) {
  const featuredEl = _page.querySelector('#portal-feature-grid');
  if (!featuredEl) return;

  if (!featuredItems.length) {
    featuredEl.innerHTML = renderEmptyState(modeConfig.emptyTitle, modeConfig.emptyDescription);
    return;
  }

  featuredEl.innerHTML = featuredItems.map(renderFeatureCard).join('');
}

function renderGamesSection(modeConfig, games) {
  const gamesEl = _page.querySelector('#portal-games-grid');
  if (!gamesEl) return;

  gamesEl.innerHTML = '';

  if (!games.length) {
    gamesEl.innerHTML = renderEmptyState(modeConfig.emptyTitle, modeConfig.emptyDescription);
    return;
  }

  games.forEach(game => {
    gamesEl.appendChild(GameCard.create(game));
  });
}

function renderDynamicSections() {
  if (!_page || !_state) return;

  const mode = getSiteMode();
  const modeConfig = getModeConfig(mode);
  ensureActiveTab(modeConfig);

  const featuredItems = filterCollection(modeConfig.featuredItems, {
    query: _state.query,
    activeTab: _state.activeTab,
  });
  const games = getVisibleGames(mode);

  renderTabs(modeConfig);
  renderSummary(modeConfig, featuredItems, games);
  renderFeaturedSection(modeConfig, featuredItems);
  renderGamesSection(modeConfig, games);
}

function renderScaffold() {
  if (!_page || !_state) return;

  const modeConfig = getModeConfig();

  _page.className = 'page-home';
  _page.innerHTML = `
    <section class="portal-hero portal-hero--${escapeAttr(modeConfig.theme)}">
      <div class="portal-hero__content">
        <p class="portal-hero__eyebrow">${escapeHtml(modeConfig.eyebrow)} / ${escapeHtml(modeConfig.modeLabel)}</p>
        <h1 class="portal-hero__title">${escapeHtml(modeConfig.title)}</h1>
        <p class="portal-hero__subtitle">${escapeHtml(modeConfig.description)}</p>

        <div class="portal-hero__actions">
          <a href="${escapeAttr(modeConfig.primaryAction.href)}" class="portal-action portal-action--primary">${escapeHtml(modeConfig.primaryAction.label)}</a>
          <button type="button" class="portal-action portal-action--secondary" data-site-mode="${escapeAttr(modeConfig.secondaryAction.mode)}">
            ${escapeHtml(modeConfig.secondaryAction.label)}
          </button>
        </div>

        <form class="portal-search" id="portal-search-form">
          <label class="sr-only" for="portal-search-input">${escapeHtml(modeConfig.searchLabel)}</label>
          <div class="portal-search__field">
            <input
              id="portal-search-input"
              class="portal-search__input"
              type="search"
              value="${escapeAttr(_state.query)}"
              placeholder="${escapeAttr(modeConfig.searchPlaceholder)}"
              autocomplete="off"
            >
            <button type="submit" class="portal-search__button">検索</button>
          </div>
          <p class="portal-search__hint">${escapeHtml(modeConfig.searchHint)}</p>
        </form>

        <div class="portal-keywords" aria-label="人気キーワード">
          ${renderKeywordButtons(modeConfig)}
        </div>
      </div>
      <div class="portal-hero__highlights">
        ${renderHighlights(modeConfig)}
      </div>
    </section>

    <div class="portal-layout">
      <section class="portal-main">
        <section class="portal-section portal-section--filters">
          <div class="portal-tabs" id="portal-tabs" role="tablist" aria-label="${escapeAttr(modeConfig.tabsAriaLabel)}"></div>
          <div class="portal-summary" id="portal-summary"></div>
        </section>

        <section class="portal-section">
          <div class="portal-section__header">
            <div>
              <p class="portal-section__eyebrow">${escapeHtml(modeConfig.featuredEyebrow)}</p>
              <h2 class="portal-section__title">${escapeHtml(modeConfig.featuredTitle)}</h2>
            </div>
            <p class="portal-section__text">${escapeHtml(modeConfig.featuredDescription)}</p>
          </div>
          <div class="portal-feature-grid" id="portal-feature-grid"></div>
        </section>

        <section class="portal-section">
          <div class="portal-section__header">
            <div>
              <p class="portal-section__eyebrow">games</p>
              <h2 class="portal-section__title">${escapeHtml(modeConfig.gamesTitle)}</h2>
            </div>
            <p class="portal-section__text">${escapeHtml(modeConfig.gamesDescription)}</p>
          </div>
          <div class="game-list__grid portal-games-grid" id="portal-games-grid"></div>
        </section>
      </section>

      <aside class="portal-sidebar" id="portal-sidebar">
        ${renderSidePanels(modeConfig)}
      </aside>
    </div>
  `;
}

function syncSearchInput() {
  const input = _page?.querySelector('#portal-search-input');
  if (input && input.value !== _state.query) {
    input.value = _state.query;
  }
}

function handleClick(event) {
  const tabButton = event.target.closest('[data-home-tab]');
  if (tabButton) {
    _state.activeTab = tabButton.dataset.homeTab || getDefaultTab(getModeConfig());
    renderDynamicSections();
    return;
  }

  const keywordButton = event.target.closest('[data-home-keyword]');
  if (keywordButton) {
    _state.query = keywordButton.dataset.homeKeyword || '';
    syncSearchInput();
    renderDynamicSections();
    return;
  }

  const siteModeButton = event.target.closest('[data-site-mode]');
  if (siteModeButton) {
    setSiteMode(siteModeButton.dataset.siteMode);
  }
}

function handleInput(event) {
  const input = event.target.closest('#portal-search-input');
  if (!input) return;

  _state.query = input.value.trim();
  renderDynamicSections();
}

function handleSubmit(event) {
  if (!event.target.closest('#portal-search-form')) return;
  event.preventDefault();
  renderDynamicSections();
}

export default {
  create() {
    resetState();

    _page = document.createElement('div');
    _handleClick = handleClick;
    _handleInput = handleInput;
    _handleSubmit = handleSubmit;

    _page.addEventListener('click', _handleClick);
    _page.addEventListener('input', _handleInput);
    _page.addEventListener('submit', _handleSubmit);

    renderScaffold();
    renderDynamicSections();

    _unsubscribeSiteMode = onEvent('site-mode-change', () => {
      resetState();
      renderScaffold();
      renderDynamicSections();
    });

    return _page;
  },

  destroy() {
    if (_page && _handleClick) {
      _page.removeEventListener('click', _handleClick);
    }

    if (_page && _handleInput) {
      _page.removeEventListener('input', _handleInput);
    }

    if (_page && _handleSubmit) {
      _page.removeEventListener('submit', _handleSubmit);
    }

    if (_unsubscribeSiteMode) {
      _unsubscribeSiteMode();
      _unsubscribeSiteMode = null;
    }

    _page = null;
    _state = null;
    _handleClick = null;
    _handleInput = null;
    _handleSubmit = null;
  },
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
