export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-not-found';
    page.innerHTML = `
      <h1>404</h1>
      <p>ページが見つかりませんでした。</p>
      <a href="#/">トップに戻る</a>
    `;
    return page;
  },
};
