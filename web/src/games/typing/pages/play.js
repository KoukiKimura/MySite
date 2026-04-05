import { createTypingGame } from '../index.js';

let gameInstance = null;

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-play typing-game-container';

    // マウント後に createTypingGame を呼ぶため requestAnimationFrame で遅延
    requestAnimationFrame(() => {
      if (document.body.contains(page)) {
        gameInstance = createTypingGame(page);
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
