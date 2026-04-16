import { onEvent } from '../events.js';
import { getSiteMode, setSiteMode } from '../state/site-mode.js';

let _headerEl = null;
let _mobileNav = null;
let _menuBtn = null;

function _closeMobileMenu() {
  if (!_menuBtn || !_mobileNav) return;
  _menuBtn.setAttribute('aria-expanded', 'false');
  _mobileNav.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function _setActiveNav(path) {
  if (!_headerEl) return;
  _headerEl.querySelectorAll('.header__nav-item, .header__mobile-nav-item').forEach(el => {
    el.classList.remove('header__nav-item--active', 'header__mobile-nav-item--active');
  });

  let selector = null;
  if (path === '/') selector = '[href="#/"]';
  else if (path === '/ranking') selector = '[href="#/ranking"]';
  else if (path === '/about') selector = '[href="#/about"]';
  else if (path === '/contact') selector = '[href="#/contact"]';

  if (selector) {
    _headerEl.querySelectorAll(selector).forEach(el => {
      if (el.classList.contains('header__nav-item')) {
        el.classList.add('header__nav-item--active');
      }
      if (el.classList.contains('header__mobile-nav-item')) {
        el.classList.add('header__mobile-nav-item--active');
      }
    });
  }
}

function _updateAuthDisplay(user) {
  if (!_headerEl) return;
  const loginBtn = _headerEl.querySelector('.header__login-btn');
  const userName = _headerEl.querySelector('.header__user-name');
  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userName) {
      userName.textContent = user.name;
      userName.style.display = '';
    }
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (userName) userName.style.display = 'none';
  }
}

function _updateModeDisplay(mode) {
  if (!_headerEl) return;

  _headerEl.querySelectorAll('[data-site-mode]').forEach(button => {
    const isActive = button.dataset.siteMode === mode;
    button.classList.toggle('header__site-switch-btn--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function _handleModeSwitch(targetMode) {
  if (!targetMode) return;

  setSiteMode(targetMode);
  _updateModeDisplay(targetMode);

  if (location.hash.slice(1) !== '/') {
    location.hash = '#/';
  }

  _closeMobileMenu();
}

export const Header = {
  create() {
    _headerEl = document.createElement('header');
    _headerEl.className = 'header';

    _headerEl.innerHTML = `
      <div class="header__inner">
        <a href="#/" class="header__logo">
          <img src="/logo.png" alt="ペンギン" class="header__logo-icon" width="32" height="32">
          <span class="header__logo-text">ペンギンげーむず！</span>
        </a>
        <div class="header__site-switch" role="group" aria-label="サイト切替">
          <button type="button" class="header__site-switch-btn" data-site-mode="kids" aria-pressed="true">キッズ</button>
          <button type="button" class="header__site-switch-btn" data-site-mode="teens" aria-pressed="false">ティーンズβ</button>
        </div>
        <nav class="header__nav">
          <a href="#/" class="header__nav-item header__nav-item--active">トップ</a>
          <a href="#/ranking" class="header__nav-item">ランキング</a>
          <a href="#/about" class="header__nav-item">About</a>
          <a href="#/contact" class="header__nav-item">お問い合わせ</a>
        </nav>
        <div class="header__auth">
          <a href="#/login" class="header__login-btn">ログイン</a>
          <span class="header__user-name" style="display:none"></span>
        </div>
        <button class="header__menu-btn" aria-label="メニュー" aria-expanded="false">
          <span class="header__menu-icon"></span>
        </button>
      </div>
      <nav class="header__mobile-nav" hidden>
        <div class="header__mobile-tools">
          <p class="header__mobile-tools-label">サイト切替</p>
          <div class="header__site-switch header__site-switch--mobile" role="group" aria-label="サイト切替">
            <button type="button" class="header__site-switch-btn" data-site-mode="kids" aria-pressed="true">キッズ</button>
            <button type="button" class="header__site-switch-btn" data-site-mode="teens" aria-pressed="false">ティーンズβ</button>
          </div>
        </div>
        <a href="#/" class="header__mobile-nav-item">トップ</a>
        <a href="#/ranking" class="header__mobile-nav-item">ランキング</a>
        <a href="#/about" class="header__mobile-nav-item">About</a>
        <a href="#/contact" class="header__mobile-nav-item">お問い合わせ</a>
        <a href="#/login" class="header__mobile-nav-item">ログイン</a>
      </nav>
    `;

    _menuBtn = _headerEl.querySelector('.header__menu-btn');
    _mobileNav = _headerEl.querySelector('.header__mobile-nav');

    _menuBtn.addEventListener('click', () => {
      const expanded = _menuBtn.getAttribute('aria-expanded') === 'true';
      _menuBtn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        _mobileNav.setAttribute('hidden', '');
        document.body.style.overflow = '';
      } else {
        _mobileNav.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
    });

    _headerEl.addEventListener('click', (e) => {
      const switchButton = e.target.closest('[data-site-mode]');
      if (switchButton) {
        e.preventDefault();
        _handleModeSwitch(switchButton.dataset.siteMode);
      }
    });

    _mobileNav.addEventListener('click', (e) => {
      if (e.target.classList.contains('header__mobile-nav-item')) {
        _closeMobileMenu();
      }
    });

    onEvent('route-change', (evt) => {
      _setActiveNav(evt.detail.path);
    });

    onEvent('auth-change', (evt) => {
      _updateAuthDisplay(evt.detail.user);
    });

    onEvent('site-mode-change', (evt) => {
      _updateModeDisplay(evt.detail.mode);
    });

    _updateModeDisplay(getSiteMode());

    return _headerEl;
  },

  show() {
    if (_headerEl) _headerEl.style.removeProperty('display');
  },

  hide() {
    if (_headerEl) _headerEl.style.display = 'none';
    _closeMobileMenu();
  },

  setActiveNav: _setActiveNav,
};
