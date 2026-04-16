import { createTypingGame } from '../index.js';
import { getSiteMode } from '../../../shared/state/site-mode.js';
import { mockAuthRepository } from '../../../user/repository/mock-auth-repository.js';
import { mockRecordRepository } from '../../../user/repository/mock-record-repository.js';

let gameInstance = null;

export default {
  create() {
    const page = document.createElement('div');
    page.className = 'page-play typing-game-container';

    // マウント後に createTypingGame を呼ぶため requestAnimationFrame で遅延
    requestAnimationFrame(() => {
      if (document.body.contains(page)) {
        gameInstance = createTypingGame(page, {
          onFinishResult(result, session) {
            const user = mockAuthRepository.getCurrentUser();
            mockRecordRepository.save({
              gameId: 'typing',
              gameMode: session?.config?.gameMode ?? 'standard',
              siteMode: getSiteMode(),
              userName: user?.name ?? 'ゲスト',
              score: result.total ?? 0,
              wpm: result.wpm ?? 0,
              accuracy: result.accuracy ?? 0,
            });
          },
        });
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
