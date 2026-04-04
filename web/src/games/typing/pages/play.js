export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-play';
    page.innerHTML = '<p>ゲーム画面（Phase 4 で実装）</p>';
    return page;
  },
  destroy() {
    // Canvas / ゲームループのクリーンアップ（Phase 4 で実装）
  },
};
