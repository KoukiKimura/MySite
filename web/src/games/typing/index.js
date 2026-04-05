import { createJsonQuestionRepository } from '../infrastructure/repositories/json-question-repository.js';
import { createQuestionProvider } from '../application/services/question-provider.js';
import { startGame } from '../application/use-cases/start-game.js';
import { processInput } from '../application/use-cases/process-input.js';
import { finishGame } from '../application/use-cases/finish-game.js';
import { startSession, pauseSession, resumeSession } from '../domain/entities/game-session.js';

import { createTypingCanvas } from './canvas/typing-canvas.js';
import { createTextRenderer } from './canvas/text-renderer.js';
import { createEffectRenderer } from './canvas/effect-renderer.js';
import { createKeyboardHandler } from './keyboard-handler.js';

import { createMenuScreen } from './screens/menu-screen.js';
import { createCountdownScreen } from './screens/countdown-screen.js';
import { createPlayScreen } from './screens/play-screen.js';
import { createPauseScreen } from './screens/pause-screen.js';
import { createResultScreen } from './screens/result-screen.js';

export function createTypingGame(container) {
  // canvas 要素を生成してコンテナに追加
  const canvas = document.createElement('canvas');
  canvas.className = 'typing-game-canvas';
  container.appendChild(canvas);

  // DOM オーバーレイ（メニュー/リザルトなどの HTML 画面用）
  const overlay = document.createElement('div');
  overlay.className = 'typing-game-overlay';
  container.appendChild(overlay);

  // インフラ層
  const questionRepository = createJsonQuestionRepository();

  // アプリケーション層
  const questionProvider = createQuestionProvider(questionRepository);

  // プレゼンテーション層
  const typingCanvas = createTypingCanvas(canvas);
  const ctx = typingCanvas.getContext();
  const textRenderer = createTextRenderer(ctx);
  const effectRenderer = createEffectRenderer(ctx);
  const keyboardHandler = createKeyboardHandler();

  let currentScreen = null;   // 現在のキャンバス画面
  let currentOverlay = null;  // 現在のDOM画面
  let currentSession = null;

  function clearOverlay() {
    if (currentOverlay) {
      currentOverlay.destroy();
      currentOverlay = null;
    }
    overlay.innerHTML = '';
  }

  function clearScreen() {
    if (currentScreen) {
      currentScreen.destroy();
      currentScreen = null;
    }
  }

  function showScreen(name, ...args) {
    switch (name) {
      case 'menu':
        showMenuScreen();
        break;
      case 'countdown':
        showCountdownScreen(args[0]);
        break;
      case 'play':
        showPlayScreen(args[0]);
        break;
      case 'pause':
        showPauseScreen();
        break;
      case 'result':
        showResultScreen(args[0]);
        break;
    }
  }

  function showMenuScreen() {
    clearScreen();
    clearOverlay();
    typingCanvas.clear();
    canvas.style.display = 'none';

    const menuScreen = createMenuScreen(async (config) => {
      // メニュー非表示 → ゲーム開始
      menuScreen.destroy();
      overlay.innerHTML = '';

      try {
        currentSession = await startGame({ questionProvider }, config);
        showScreen('countdown', currentSession);
      } catch (err) {
        console.error('ゲーム開始に失敗しました:', err);
        showScreen('menu');
      }
    });

    overlay.appendChild(menuScreen.getElement());
    currentOverlay = menuScreen;
  }

  function showCountdownScreen(session) {
    clearScreen();
    canvas.style.display = 'block';
    typingCanvas.resize();

    const countdown = createCountdownScreen(ctx, () => {
      startSession(session);
      showScreen('play', session);
    });
    currentScreen = countdown;
    countdown.start();
  }

  function showPlayScreen(session) {
    clearScreen();
    clearOverlay();
    canvas.style.display = 'block';

    const playScreen = createPlayScreen(ctx, session, {
      textRenderer,
      effectRenderer,
      keyboardHandler,
      processInput,
      finishGame,
      onFinish(result) {
        showScreen('result', result);
      },
      onPause() {
        playScreen.pause();
        pauseSession(session);
        showScreen('pause');
      },
    });

    currentScreen = playScreen;
    playScreen.start();
  }

  let pauseScreenInstance = null;

  function showPauseScreen() {
    if (pauseScreenInstance) {
      pauseScreenInstance.destroy();
    }
    pauseScreenInstance = createPauseScreen(ctx, canvas, {
      onResume() {
        pauseScreenInstance.destroy();
        pauseScreenInstance = null;
        resumeSession(currentSession);
        if (currentScreen) currentScreen.resume();
      },
      onRetry() {
        pauseScreenInstance.destroy();
        pauseScreenInstance = null;
        retryGame();
      },
      onMenu() {
        pauseScreenInstance.destroy();
        pauseScreenInstance = null;
        showScreen('menu');
      },
    });
    pauseScreenInstance.show();
  }

  function showResultScreen(result) {
    clearScreen();
    canvas.style.display = 'none';
    clearOverlay();

    const resultScreen = createResultScreen(result, {
      onRetry() {
        resultScreen.destroy();
        overlay.innerHTML = '';
        retryGame();
      },
      onMenu() {
        resultScreen.destroy();
        overlay.innerHTML = '';
        showScreen('menu');
      },
    });

    overlay.appendChild(resultScreen.getElement());
    currentOverlay = resultScreen;
  }

  async function retryGame() {
    if (!currentSession) { showScreen('menu'); return; }
    const config = currentSession.config;
    try {
      currentSession = await startGame({ questionProvider }, config);
      showScreen('countdown', currentSession);
    } catch (err) {
      console.error('リトライに失敗しました:', err);
      showScreen('menu');
    }
  }

  // 初期画面
  showScreen('menu');

  return {
    destroy() {
      clearScreen();
      clearOverlay();
      if (pauseScreenInstance) {
        pauseScreenInstance.destroy();
        pauseScreenInstance = null;
      }
      keyboardHandler.destroy();
      typingCanvas.destroy();
      canvas.remove();
      overlay.remove();
    },
  };
}
