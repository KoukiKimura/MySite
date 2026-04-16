import { createBreakoutGame } from '../index.js';

let gameInstance = null;

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-play breakout-game-container';

    requestAnimationFrame(() => {
      if (document.body.contains(page)) {
        gameInstance = createBreakoutGame(page);
      }
    });

    return page;
  },
  destroy() {
    if (gameInstance) {
      gameInstance.destroy();
      gameInstance = null;
    }
  },
};

