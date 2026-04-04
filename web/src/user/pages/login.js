import { mockAuthRepository } from '../repository/mock-auth-repository.js';

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-login';

    const user = mockAuthRepository.getCurrentUser();

    if (user) {
      page.innerHTML = `
        <section class="login-form">
          <h1 class="login-form__title">ログイン中</h1>
          <p>ようこそ、<strong>${escapeHtml(user.name)}</strong> さん！</p>
          <button class="btn btn--primary login-form__logout" type="button">ログアウト</button>
        </section>
      `;
      page.querySelector('.login-form__logout').addEventListener('click', async () => {
        await mockAuthRepository.logout();
        location.hash = '#/';
      });
    } else {
      page.innerHTML = `
        <section class="login-form">
          <h1 class="login-form__title">ログイン</h1>
          <form class="login-form__form">
            <div class="login-form__field">
              <label class="login-form__label" for="username">ユーザー名</label>
              <input class="login-form__input" type="text" id="username"
                     placeholder="ユーザー名を入力" required maxlength="20">
            </div>
            <div class="login-form__field">
              <label class="login-form__label" for="password">パスワード</label>
              <input class="login-form__input" type="password" id="password"
                     placeholder="パスワードを入力" required>
            </div>
            <button class="login-form__submit btn btn--primary" type="submit">ログイン</button>
          </form>
          <div class="login-form__note">
            ⚠️ このページはモック画面です。任意のユーザー名とパスワードでログインできます。
          </div>
        </section>
      `;

      page.querySelector('.login-form__form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = page.querySelector('#username').value.trim();
        if (!username) return;
        await mockAuthRepository.login(username);
        location.hash = '#/';
      });
    }

    return page;
  },
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
