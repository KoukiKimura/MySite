import { onEvent } from '../events.js';
import { Router } from '../router/router.js';
import { UIState } from '../state/ui-state.js';
import { getSiteMode, setSiteMode } from '../state/site-mode.js';
import { mockAuthRepository } from '../../user/repository/mock-auth-repository.js';
import { escapeHtml } from '../utils/escape.js';

let headerEl = null;
let mobileNav = null;
let menuButton = null;

function setMobileMenuOpen(open) {
  if (!menuButton || !mobileNav) {
    return;
  }

  UIState.setMobileMenuOpen(open);
  menuButton.setAttribute('aria-expanded', String(open));
  mobileNav.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}

function closeMobileMenu() {
  setMobileMenuOpen(false);
}

function updateTopLinks(mode) {
  if (!headerEl) {
    return;
  }

  const targetPath = mode === 'teens' ? '#/teens' : '#/kids';
  headerEl.querySelectorAll('#header__top-link, #header__mobile-top-link').forEach(link => {
    link.setAttribute('href', targetPath);
  });
}

function setActiveNav(path) {
  if (!headerEl) {
    return;
  }

  headerEl.querySelectorAll('.header__nav-item, .header__mobile-nav-item').forEach(element => {
    element.classList.remove('header__nav-item--active', 'header__mobile-nav-item--active');
  });

  let selector = null;
  if (path === '/' || path === '/kids' || path === '/teens' || path.startsWith('/kids/') || path.startsWith('/teens/')) {
    selector = '#header__top-link, #header__mobile-top-link';
  } else if (path === '/ranking') {
    selector = '[href="#/ranking"]';
  } else if (path === '/about') {
    selector = '[href="#/about"]';
  } else if (path === '/contact') {
    selector = '[href="#/contact"]';
  }

  if (!selector) {
    return;
  }

  headerEl.querySelectorAll(selector).forEach(element => {
    if (element.classList.contains('header__nav-item')) {
      element.classList.add('header__nav-item--active');
    }

    if (element.classList.contains('header__mobile-nav-item')) {
      element.classList.add('header__mobile-nav-item--active');
    }
  });
}

function updateAuthDisplay(user) {
  if (!headerEl) {
    return;
  }

  const desktopAuth = headerEl.querySelector('.header__auth');
  const mobileAuth = headerEl.querySelector('.header__mobile-auth');
  if (!desktopAuth || !mobileAuth) {
    return;
  }

  if (!user) {
    desktopAuth.innerHTML = '<a href="#/login" class="header__login-btn">ログイン</a>';
    mobileAuth.innerHTML = '<a href="#/login" class="header__mobile-nav-item">ログイン</a>';
    return;
  }

  desktopAuth.innerHTML = `
    <span class="header__user-name">${escapeHtml(user.name)}</span>
    <a href="#/admin" class="header__admin-link">管理画面</a>
  `;
  mobileAuth.innerHTML = `
    <a href="#/admin" class="header__mobile-nav-item">管理画面</a>
    <a href="#/login" class="header__mobile-nav-item">ログイン設定</a>
  `;
}

function updateModeDisplay(mode) {
  if (!headerEl) {
    return;
  }

  headerEl.querySelectorAll('[data-site-mode]').forEach(button => {
    const isActive = button.dataset.siteMode === mode;
    button.classList.toggle('header__site-switch-btn--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  updateTopLinks(mode);
}

function handleModeSwitch(mode) {
  if (!mode) {
    return;
  }

  setSiteMode(mode, 'header-switch');
  Router.navigate(`/${mode}`);
  closeMobileMenu();
}

export const Header = {
  create() {
    headerEl = document.createElement('header');
    headerEl.className = 'header';
    headerEl.innerHTML = `
      <div class="header__inner">
        <a href="#/" class="header__logo">
          <img src="/logo.png" alt="ペンギンげーむず！" class="header__logo-icon" width="32" height="32">
          <span class="header__logo-text">ペンギンげーむず！</span>
        </a>
        <div class="header__site-switch" role="group" aria-label="サイト切替">
          <button type="button" class="header__site-switch-btn" data-site-mode="kids" aria-pressed="true">キッズ</button>
          <button type="button" class="header__site-switch-btn" data-site-mode="teens" aria-pressed="false">ティーンズβ</button>
        </div>
        <nav class="header__nav">
          <a href="#/kids" class="header__nav-item header__nav-item--active" id="header__top-link">トップ</a>
          <a href="#/ranking" class="header__nav-item">ランキング</a>
          <a href="#/about" class="header__nav-item">About</a>
          <a href="#/contact" class="header__nav-item">お問い合わせ</a>
        </nav>
        <div class="header__auth"></div>
        <button class="header__menu-btn" type="button" aria-label="メニュー" aria-expanded="false">
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
        <a href="#/kids" class="header__mobile-nav-item" id="header__mobile-top-link">トップ</a>
        <a href="#/ranking" class="header__mobile-nav-item">ランキング</a>
        <a href="#/parents" class="header__mobile-nav-item">保護者向け案内</a>
        <a href="#/guide" class="header__mobile-nav-item">使い方</a>
        <a href="#/about" class="header__mobile-nav-item">About</a>
        <a href="#/contact" class="header__mobile-nav-item">お問い合わせ</a>
        <div class="header__mobile-auth"></div>
      </nav>
    `;

    menuButton = headerEl.querySelector('.header__menu-btn');
    mobileNav = headerEl.querySelector('.header__mobile-nav');

    menuButton.addEventListener('click', () => {
      setMobileMenuOpen(!UIState.getMobileMenuOpen());
    });

    headerEl.addEventListener('click', event => {
      const siteModeButton = event.target.closest('[data-site-mode]');
      if (siteModeButton) {
        event.preventDefault();
        handleModeSwitch(siteModeButton.dataset.siteMode);
      }
    });

    mobileNav.addEventListener('click', event => {
      if (event.target.classList.contains('header__mobile-nav-item')) {
        closeMobileMenu();
      }
    });

    onEvent('route-change', event => {
      setActiveNav(event.detail.path);
    });

    onEvent('auth-change', event => {
      updateAuthDisplay(event.detail.user);
    });

    onEvent('site-mode-change', event => {
      updateModeDisplay(event.detail.mode);
    });

    updateModeDisplay(getSiteMode());
    updateAuthDisplay(mockAuthRepository.getCurrentUser());
    setActiveNav(Router.getCurrentPath());
    closeMobileMenu();

    return headerEl;
  },

  show() {
    if (headerEl) {
      headerEl.hidden = false;
    }
  },

  hide() {
    if (headerEl) {
      headerEl.hidden = true;
    }
    closeMobileMenu();
  },

  setActiveNav,
};
