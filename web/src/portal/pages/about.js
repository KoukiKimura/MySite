export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-about';
    page.innerHTML = '<h1>About</h1><p>ペンギンげーむず！はブラウザで遊べるHTML5ミニゲーム集です。</p>';
    return page;
  },
};
