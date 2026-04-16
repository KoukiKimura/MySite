import { mockAuthRepository } from '../repository/mock-auth-repository.js';
import { mockHistoryRepository } from '../repository/mock-history-repository.js';
import { mockProfileRepository } from '../repository/mock-profile-repository.js';
import { Router } from '../../shared/router/router.js';
import { getSiteMode, setSiteMode } from '../../shared/state/site-mode.js';

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
          <p class="login-form__note">好みのモード: ${escapeHtml(user.favoriteMode ?? getSiteMode())}</p>
          <div class="login-form__actions">
            <button class="btn btn--primary login-form__logout" type="button">ログアウト</button>
            <button class="btn login-form__reset-history" type="button">履歴をリセット</button>
            <button class="btn login-form__reset-profile" type="button">おすすめをリセット</button>
          </div>
        </section>
      `;
      page.querySelector('.login-form__logout').addEventListener('click', async () => {
        await mockAuthRepository.logout();
        Router.navigate('/');
      });
      page.querySelector('.login-form__reset-history').addEventListener('click', () => {
        mockHistoryRepository.reset(getSiteMode());
      });
      page.querySelector('.login-form__reset-profile').addEventListener('click', () => {
        mockProfileRepository.reset(getSiteMode());
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
            <div class="login-form__field">
              <label class="login-form__label" for="favoriteMode">よく使うモード</label>
              <select class="login-form__input" id="favoriteMode">
                <option value="kids">キッズ</option>
                <option value="teens">ティーンズβ</option>
              </select>
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
        const favoriteMode = page.querySelector('#favoriteMode').value;
        if (!username) return;
        await mockAuthRepository.login({ name: username, favoriteMode });
        setSiteMode(favoriteMode, 'login');
        Router.navigate(`/${favoriteMode}`);
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
