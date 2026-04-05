export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-about';
    page.innerHTML = `
      <section class="about">
        <h1 class="about__title">About</h1>
        <p class="about__text">
          「ペンギンげーむず！」は、ブラウザで遊べるHTML5ミニゲーム集です。
          インストール不要で、今すぐ楽しめます。
        </p>
        <h2 class="about__subtitle">技術について</h2>
        <p class="about__text">
          このサイトは HTML5 / CSS3 / JavaScript (ES6+) で構築されています。
          プログラミング教育の教材としても活用できます。
        </p>
      </section>
    `;
    return page;
  },
};
