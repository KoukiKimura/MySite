import './shared/styles/main.css';

function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="page-container"><h1>ペンギンげーむず！</h1><p>環境構築完了</p></div>';
}

document.addEventListener('DOMContentLoaded', initApp);
