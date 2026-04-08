import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../canvas/breakout-canvas.js';

export function createPointerController(canvasElement, eventTarget = canvasElement) {
  let targetX = LOGICAL_WIDTH / 2;
  let pointerY = LOGICAL_HEIGHT / 2;
  let launchRequested = false;

  function updatePointer(clientX, clientY) {
    const rect = canvasElement.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    targetX = ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
    pointerY = ((clientY - rect.top) / rect.height) * LOGICAL_HEIGHT;
  }

  function handlePointerMove(event) {
    updatePointer(event.clientX, event.clientY);
  }

  function handlePointerDown(event) {
    updatePointer(event.clientX, event.clientY);

    if (event.button === 2) {
      launchRequested = true;
      event.preventDefault?.();
    }
  }

  function handleContextMenu(event) {
    event.preventDefault?.();
  }

  eventTarget.addEventListener('pointermove', handlePointerMove);
  eventTarget.addEventListener('pointerdown', handlePointerDown);
  eventTarget.addEventListener('contextmenu', handleContextMenu);

  return {
    getTargetX() {
      return targetX;
    },
    getPointerY() {
      return pointerY;
    },
    consumeLaunchRequest() {
      const requested = launchRequested;
      launchRequested = false;
      return requested;
    },
    destroy() {
      eventTarget.removeEventListener('pointermove', handlePointerMove);
      eventTarget.removeEventListener('pointerdown', handlePointerDown);
      eventTarget.removeEventListener('contextmenu', handleContextMenu);
    },
  };
}
