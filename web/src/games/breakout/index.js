import { startGame } from './application/use-cases/start-game.js';
import {
  pauseSession,
  resumeSession,
  startSession,
} from './domain/entities/game-session.js';
import { createStaticStageRepository } from './infrastructure/repositories/static-stage-repository.js';
import { createBreakoutCanvas } from './presentation/canvas/breakout-canvas.js';
import { createBreakoutRenderer } from './presentation/canvas/breakout-renderer.js';
import { createPointerController } from './presentation/input/pointer-controller.js';
import { createMenuScreen } from './presentation/screens/menu-screen.js';
import { createPauseScreen } from './presentation/screens/pause-screen.js';
import { createPlayScreen } from './presentation/screens/play-screen.js';
import { createResultScreen } from './presentation/screens/result-screen.js';

export function createBreakoutGame(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'breakout-game-canvas';
  container.appendChild(canvas);

  const overlay = document.createElement('div');
  overlay.className = 'breakout-game-overlay';
  container.appendChild(overlay);

  const controls = document.createElement('div');
  controls.className = 'breakout-game-controls';
  controls.hidden = true;

  const pauseButton = document.createElement('button');
  pauseButton.type = 'button';
  pauseButton.className = 'breakout-pause-button';
  pauseButton.textContent = 'Pause';
  controls.appendChild(pauseButton);
  container.appendChild(controls);

  const stageRepository = createStaticStageRepository();
  const breakoutCanvas = createBreakoutCanvas(canvas);
  const renderer = createBreakoutRenderer(breakoutCanvas.getContext());
  const pointerController = createPointerController(canvas, container);

  let currentSession = null;
  let currentScreen = null;
  let currentOverlay = null;

  function clearScreen() {
    if (currentScreen) {
      currentScreen.destroy();
      currentScreen = null;
    }
  }

  function clearOverlay() {
    if (currentOverlay) {
      currentOverlay.destroy();
      currentOverlay = null;
    }
    overlay.innerHTML = '';
  }

  function setControlsVisible(visible) {
    controls.hidden = !visible;
  }

  async function createSession() {
    const session = await startGame({ stageRepository }, { maxLives: 3 });
    startSession(session);
    return session;
  }

  async function restartFromBeginning() {
    currentSession = await createSession();
    showPlayScreen(currentSession);
  }

  async function handleStartGame() {
    clearOverlay();

    try {
      await restartFromBeginning();
    } catch (error) {
      console.error('ブロック崩しの開始に失敗しました:', error);
      showMenuScreen();
    }
  }

  function showMenuScreen() {
    clearScreen();
    clearOverlay();
    setControlsVisible(false);
    renderer.clear();

    const menuScreen = createMenuScreen({
      onStart: handleStartGame,
    });

    overlay.appendChild(menuScreen.getElement());
    currentOverlay = menuScreen;
  }

  function showPlayScreen(session) {
    clearScreen();
    clearOverlay();
    setControlsVisible(true);
    breakoutCanvas.resize();

    const playScreen = createPlayScreen({
      session,
      renderer,
      pointerController,
      onPause() {
        if (!currentScreen) return;
        pauseSession(session);
        currentScreen.pause();
        showPauseScreen();
      },
      onFinish(result) {
        showResultScreen(result);
      },
    });

    currentScreen = playScreen;
    playScreen.start();
  }

  function showPauseScreen() {
    clearOverlay();
    setControlsVisible(false);

    const pauseScreen = createPauseScreen({
      onResume() {
        clearOverlay();
        setControlsVisible(true);
        if (!currentScreen || !currentSession) return;
        resumeSession(currentSession);
        currentScreen.resume();
      },
      async onRetry() {
        clearOverlay();
        clearScreen();
        setControlsVisible(false);

        try {
          await restartFromBeginning();
        } catch (error) {
          console.error('ブロック崩しの再開に失敗しました:', error);
          showMenuScreen();
        }
      },
      onMenu() {
        showMenuScreen();
      },
    });

    overlay.appendChild(pauseScreen.getElement());
    currentOverlay = pauseScreen;
  }

  function showResultScreen(result) {
    clearScreen();
    clearOverlay();
    setControlsVisible(false);

    const resultScreen = createResultScreen(result, {
      async onRetry() {
        clearOverlay();

        try {
          await restartFromBeginning();
        } catch (error) {
          console.error('ブロック崩しのリトライに失敗しました:', error);
          showMenuScreen();
        }
      },
      onMenu() {
        showMenuScreen();
      },
    });

    overlay.appendChild(resultScreen.getElement());
    currentOverlay = resultScreen;
  }

  function handlePauseClick() {
    if (!currentScreen || !currentSession) return;
    if (currentSession.state !== 'playing') return;

    pauseSession(currentSession);
    currentScreen.pause();
    showPauseScreen();
  }

  pauseButton.addEventListener('click', handlePauseClick);

  showMenuScreen();

  return {
    destroy() {
      pauseButton.removeEventListener('click', handlePauseClick);
      clearScreen();
      clearOverlay();
      pointerController.destroy();
      breakoutCanvas.destroy();
      canvas.remove();
      overlay.remove();
      controls.remove();
    },
  };
}
