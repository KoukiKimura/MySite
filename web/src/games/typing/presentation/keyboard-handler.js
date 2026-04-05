export function createKeyboardHandler() {
  let inputCallback = null;
  let escapeCallback = null;
  let enabled = false;

  function handleKeyDown(event) {
    if (!enabled) return;
    if (event.isComposing) return;

    if (event.key.length === 1 || event.key === 'Escape') {
      event.preventDefault();
    }

    if (event.key === 'Escape') {
      escapeCallback?.();
      return;
    }

    const key = event.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
      inputCallback?.(key);
      return;
    }

    if (event.key === '-') {
      inputCallback?.('-');
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return {
    onInput(cb) { inputCallback = cb; },
    onEscape(cb) { escapeCallback = cb; },
    enable() { enabled = true; },
    disable() { enabled = false; },
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
      inputCallback = null;
      escapeCallback = null;
    },
  };
}
