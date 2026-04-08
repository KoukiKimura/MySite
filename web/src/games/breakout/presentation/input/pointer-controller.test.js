import { describe, expect, it } from 'vitest';

import { createPointerController } from './pointer-controller.js';

function createFakeEventTarget() {
  const listeners = new Map();

  return {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) {
        listeners.delete(type);
      }
    },
    dispatch(type, event) {
      const handler = listeners.get(type);
      if (handler) {
        handler(event);
      }
    },
  };
}

describe('createPointerController', () => {
  it('updates target coordinates from a custom event target', () => {
    const eventTarget = createFakeEventTarget();
    const canvasElement = {
      getBoundingClientRect() {
        return {
          left: 10,
          top: 20,
          width: 200,
          height: 100,
        };
      },
    };

    const controller = createPointerController(canvasElement, eventTarget);

    eventTarget.dispatch('pointermove', {
      clientX: 110,
      clientY: 70,
    });

    expect(controller.getTargetX()).toBeCloseTo(480);
    expect(controller.getPointerY()).toBeCloseTo(320);
  });

  it('stops reacting after destroy', () => {
    const eventTarget = createFakeEventTarget();
    const canvasElement = {
      getBoundingClientRect() {
        return {
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        };
      },
    };

    const controller = createPointerController(canvasElement, eventTarget);

    eventTarget.dispatch('pointerdown', {
      clientX: 25,
      clientY: 75,
    });

    controller.destroy();

    eventTarget.dispatch('pointermove', {
      clientX: 90,
      clientY: 10,
    });

    expect(controller.getTargetX()).toBeCloseTo(240);
    expect(controller.getPointerY()).toBeCloseTo(480);
  });
});
