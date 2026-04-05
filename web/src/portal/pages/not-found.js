export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-not-found';
    page.innerHTML = `
      <section class="not-found">
        <h1 class="not-found__title">404</h1>
        <p class="not-found__text">ページが見つかりませんでした。</p>
        <a href="#/" class="btn btn--primary">トップに戻る</a>
      </section>
    `;
    return page;
  },
};
