import { Router } from './shared/router/router.js';
import { Header } from './shared/components/header.js';
import { Footer } from './shared/components/footer.js';
import { PageContainer } from './shared/components/page-container.js';
import { initializeSiteMode } from './shared/state/site-mode.js';
import './shared/styles/main.css';

function initApp() {
  const app = document.getElementById('app');
  initializeSiteMode();

  const header = Header.create();
  const pageContainer = PageContainer.create();
  const footer = Footer.create();

  app.appendChild(header);
  app.appendChild(pageContainer);
  app.appendChild(footer);

  Router.init(pageContainer, header, footer);
}

document.addEventListener('DOMContentLoaded', initApp);
