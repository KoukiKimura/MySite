export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-contact';

    const formUrl = import.meta.env.VITE_GOOGLE_FORM_URL;
    const hasValidUrl = formUrl && formUrl.trim() !== '' && !formUrl.includes('FORM_ID');

    page.innerHTML = `
      <section class="contact">
        <h1 class="contact__title">お問い合わせ</h1>
        <p class="contact__text">
          ご意見・ご要望はこちらのフォームからお送りください。
        </p>
        <div class="contact__form-wrapper">
          <iframe class="contact__iframe"
                  title="お問い合わせフォーム"
                  width="100%" height="600" frameborder="0"
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  ${hasValidUrl ? '' : 'hidden'}></iframe>
          <div class="contact__fallback" ${hasValidUrl ? 'hidden' : ''}>
            <p>お問い合わせフォームは現在準備中です。</p>
          </div>
        </div>
      </section>
    `;

    if (hasValidUrl) {
      page.querySelector('.contact__iframe').src = formUrl;
    }

    return page;
  },
};
