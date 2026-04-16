import { getSiteMode } from '../../shared/state/site-mode.js';

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-contact';

    const formUrl = import.meta.env.VITE_GOOGLE_FORM_URL;
    const hasValidUrl = formUrl && formUrl.trim() !== '' && !formUrl.includes('FORM_ID');
    const homePath = `/${getSiteMode()}`;

    page.innerHTML = `
      <section class="info-page">
        <p class="info-page__eyebrow">contact</p>
        <h1 class="info-page__title">お問い合わせ</h1>
        <p class="info-page__lead">ご意見やご要望はフォームからお送りください。</p>

        <div class="contact__form-wrapper">
          <iframe class="contact__iframe"
                  title="お問い合わせフォーム"
                  width="100%" height="600"
                  frameborder="0"
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  ${hasValidUrl ? '' : 'hidden'}></iframe>
          <div class="contact__fallback" ${hasValidUrl ? 'hidden' : ''}>
            <p>お問い合わせフォームは現在準備中です。</p>
          </div>
        </div>

        <div class="info-page__actions">
          <a href="#/parents" class="info-page__link">保護者向け案内</a>
          <a href="#/policy/privacy" class="info-page__link">プライバシー</a>
          <a href="#${homePath}" class="info-page__link info-page__link--primary">ホームへ戻る</a>
        </div>
      </section>
    `;

    if (hasValidUrl) {
      page.querySelector('.contact__iframe').src = formUrl;
    }

    return page;
  },
};
