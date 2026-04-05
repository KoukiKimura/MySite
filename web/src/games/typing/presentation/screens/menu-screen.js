import { GameMode } from '../../domain/values/game-mode.js';
import { Difficulty } from '../../domain/values/difficulty.js';
import { QuestionMode } from '../../domain/values/question-mode.js';
import { createGameConfig } from '../../domain/values/game-config.js';

const DEFAULT_SELECTION = {
  questionMode: QuestionMode.JA_ROMAJI,
  gameMode: GameMode.TIME_LIMIT,
  difficulty: 'easy',
};

/**
 * メニュー画面 (G-1)
 * @param {function(object): void} onStart - GameConfig を引数に呼ばれるコールバック
 */
export function createMenuScreen(onStart) {
  const selection = { ...DEFAULT_SELECTION };

  const el = document.createElement('div');
  el.className = 'typing-menu-screen';
  el.innerHTML = `
    <div class="typing-menu-inner">
      <h2 class="typing-menu-title">🐧 タイピングペンギン</h2>

      <div class="typing-menu-section">
        <p class="typing-menu-label">📝 出題モード</p>
        <div class="typing-menu-buttons" data-group="questionMode">
          <button data-value="ja-romaji" class="typing-btn active">日本語→ローマ字</button>
          <button data-value="en-word" class="typing-btn">英語単語</button>
        </div>
      </div>

      <div class="typing-menu-section">
        <p class="typing-menu-label">🎮 ゲームモード</p>
        <div class="typing-menu-buttons" data-group="gameMode">
          <button data-value="time-limit" class="typing-btn active">⏱ 時間制限</button>
          <button data-value="fixed-count" class="typing-btn">📋 問題数固定</button>
        </div>
      </div>

      <div class="typing-menu-section">
        <p class="typing-menu-label">⭐ 難易度</p>
        <div class="typing-menu-buttons" data-group="difficulty">
          <button data-value="easy" class="typing-btn active">★☆☆ 初級</button>
          <button data-value="normal" class="typing-btn">★★☆ 中級</button>
          <button data-value="hard" class="typing-btn">★★★ 上級</button>
        </div>
      </div>

      <button class="typing-start-btn">スタート 🚀</button>
      <p class="typing-menu-back"><a href="#/games/typing">← ゲーム説明に戻る</a></p>
    </div>
  `;

  function handleGroupClick(e) {
    const btn = e.target.closest('[data-value]');
    if (!btn) return;
    const group = btn.closest('[data-group]');
    if (!group) return;

    const key = group.dataset.group;
    selection[key] = btn.dataset.value;

    group.querySelectorAll('.typing-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }

  el.querySelectorAll('[data-group]').forEach((g) => {
    g.addEventListener('click', handleGroupClick);
  });

  el.querySelector('.typing-start-btn').addEventListener('click', () => {
    const config = createGameConfig(selection.gameMode, selection.difficulty, selection.questionMode);
    onStart(config);
  });

  return {
    getElement() { return el; },
    destroy() { el.remove(); },
  };
}
