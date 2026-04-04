export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-contact';

    const formUrl = import.meta.env.VITE_GOOGLE_FORM_URL;
    if (formUrl && formUrl !== '' && !formUrl.includes('FORM_ID')) {
      page.innerHTML = `
        <h1>お問い合わせ</h1>
        <iframe src="${formUrl}" class="contact-iframe"
                sandbox="allow-forms allow-scripts allow-same-origin"
                title="お問い合わせフォーム"
                loading="lazy"></iframe>
      `;
    } else {
      page.innerHTML = `
        <h1>お問い合わせ</h1>
        <p>お問い合わせフォームは現在準備中です。</p>
      `;
    }
    return page;
  },
};
