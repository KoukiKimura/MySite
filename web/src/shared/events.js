/**
 * カスタムイベントを発火する
 * @param {string} eventName
 * @param {Object} detail
 */
export function emitEvent(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * カスタムイベントを購読する
 * @param {string} eventName
 * @param {function(CustomEvent): void} handler
 * @returns {function(): void} 購読解除関数
 */
export function onEvent(eventName, handler) {
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
