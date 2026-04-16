let _footerEl = null;

export const Footer = {
  create() {
    _footerEl = document.createElement('footer');
    _footerEl.className = 'footer';
    _footerEl.innerHTML = `
      <div class="footer__inner">
        <nav class="footer__nav" aria-label="フッターリンク">
          <a href="#/parents" class="footer__link">保護者向け案内</a>
          <a href="#/guide" class="footer__link">使い方</a>
          <a href="#/policy/content" class="footer__link">掲載基準</a>
          <a href="#/policy/privacy" class="footer__link">プライバシー</a>
          <a href="#/contact" class="footer__link">お問い合わせ</a>
        </nav>
        <small class="footer__copyright">
          &copy; 2026 ペンギンげーむず！ All rights reserved.
        </small>
      </div>
    `;
    return _footerEl;
  },

  show() {
    if (_footerEl) _footerEl.hidden = false;
  },

  hide() {
    if (_footerEl) _footerEl.hidden = true;
  },
};
