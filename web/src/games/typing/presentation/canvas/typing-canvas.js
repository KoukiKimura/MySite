const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

export { LOGICAL_WIDTH, LOGICAL_HEIGHT };

export function createTypingCanvas(canvasElement) {
  const ctx = canvasElement.getContext('2d');

  function resize() {
    const parent = canvasElement.parentElement;
    const scaleX = parent.clientWidth / LOGICAL_WIDTH;
    const scaleY = parent.clientHeight / LOGICAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const displayWidth = Math.floor(LOGICAL_WIDTH * scale);
    const displayHeight = Math.floor(LOGICAL_HEIGHT * scale);
    const dpr = window.devicePixelRatio || 1;

    canvasElement.width = LOGICAL_WIDTH * dpr;
    canvasElement.height = LOGICAL_HEIGHT * dpr;
    canvasElement.style.width = `${displayWidth}px`;
    canvasElement.style.height = `${displayHeight}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function clear() {
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    getContext() { return ctx; },
    getCanvas() { return canvasElement; },
    clear,
    resize,
    destroy() {
      window.removeEventListener('resize', resize);
    },
  };
}
