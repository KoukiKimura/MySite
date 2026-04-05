import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from './typing-canvas.js';

export function createEffectRenderer(ctx) {
  let correctFlash = null;    // { elapsed, duration }
  let missFlash = null;       // { elapsed, duration }
  let shakeX = 0;
  let shakeY = 0;
  let comboEffect = null;     // { combo, pulse, elapsed }
  let rankInEffect = null;    // { rank, elapsed, duration }

  const CORRECT_DURATION = 200;
  const MISS_DURATION = 150;
  const RANK_IN_DURATION = 1500;

  function triggerCorrectFlash() {
    correctFlash = { elapsed: 0, duration: CORRECT_DURATION };
  }

  function triggerMissFlash() {
    missFlash = { elapsed: 0, duration: MISS_DURATION };
  }

  function triggerComboEffect(combo) {
    if (combo >= 5) {
      comboEffect = { combo, pulse: 0, elapsed: 0 };
    } else {
      comboEffect = null;
    }
  }

  function triggerRankIn(rank) {
    rankInEffect = { rank, elapsed: 0, duration: RANK_IN_DURATION };
  }

  function update(deltaTime) {
    if (correctFlash) {
      correctFlash.elapsed += deltaTime;
      if (correctFlash.elapsed >= correctFlash.duration) correctFlash = null;
    }

    if (missFlash) {
      missFlash.elapsed += deltaTime;
      if (missFlash.elapsed < missFlash.duration) {
        shakeX = (Math.random() - 0.5) * 4;
        shakeY = (Math.random() - 0.5) * 2;
      } else {
        missFlash = null;
        shakeX = 0;
        shakeY = 0;
      }
    }

    if (comboEffect) {
      comboEffect.elapsed += deltaTime;
      comboEffect.pulse = Math.sin(comboEffect.elapsed / 200) * 0.1 + 1.0;
    }

    if (rankInEffect) {
      rankInEffect.elapsed += deltaTime;
      if (rankInEffect.elapsed >= rankInEffect.duration) rankInEffect = null;
    }
  }

  function render() {
    if (correctFlash) {
      const progress = correctFlash.elapsed / correctFlash.duration;
      const alpha = 0.3 * (1 - progress);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(50, 160, LOGICAL_WIDTH - 100, 200);
      ctx.restore();
    }

    if (rankInEffect) {
      const progress = rankInEffect.elapsed / rankInEffect.duration;
      const alpha = progress < 0.3 ? progress / 0.3 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
      const scale = progress < 0.3 ? 0.5 + (progress / 0.3) * 1.5 : 2.0 - (progress - 0.3) * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${Math.floor(120 * scale)}px "M PLUS Rounded 1c", sans-serif`;
      ctx.fillStyle = rankInEffect.rank === 'S' ? '#FFD700' : '#2196F3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankInEffect.rank, LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
      ctx.restore();
    }
  }

  function getShake() {
    return { x: shakeX, y: shakeY };
  }

  function isMissFlashing() {
    return missFlash !== null;
  }

  return {
    triggerCorrectFlash,
    triggerMissFlash,
    triggerComboEffect,
    triggerRankIn,
    update,
    render,
    getShake,
    isMissFlashing,
  };
}
