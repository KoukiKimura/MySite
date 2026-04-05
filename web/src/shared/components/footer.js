let _footerEl = null;

export const Footer = {
  create() {
    _footerEl = document.createElement('footer');
    _footerEl.className = 'footer';
    _footerEl.innerHTML = `
      <div class="footer__inner">
        <small class="footer__copyright">
          &copy; 2026 ペンギンげーむず！ All rights reserved.
        </small>
      </div>
    `;
    return _footerEl;
  },

  show() {
    if (_footerEl) _footerEl.style.removeProperty('display');
  },

  hide() {
    if (_footerEl) _footerEl.style.display = 'none';
  },
};
