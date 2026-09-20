import { describe, it, expect } from 'vitest';
import { DIR_VEC, opposite, TIE_BREAK_ORDER } from '../src/core/direction';
import { EventBus, SimEvent } from '../src/core/events';

describe('Milestone M0: Environment & Core Direction Logic', () => {
  it('correctly maps direction vectors', () => {
    expect(DIR_VEC.up).toEqual({ x: 0, y: -1 });
    expect(DIR_VEC.down).toEqual({ x: 0, y: 1 });
    expect(DIR_VEC.left).toEqual({ x: -1, y: 0 });
    expect(DIR_VEC.right).toEqual({ x: 1, y: 0 });
  });

  it('calculates opposite directions accurately', () => {
    expect(opposite('up')).toBe('down');
    expect(opposite('down')).toBe('up');
    expect(opposite('left')).toBe('right');
    expect(opposite('right')).toBe('left');
    expect(opposite('none')).toBe('none');
  });

  it('preserves classic ghost tie-break priority order: up, left, down, right', () => {
    expect(TIE_BREAK_ORDER).toEqual(['up', 'left', 'down', 'right']);
  });

  it('dispatches and subscribes to events cleanly', () => {
    const bus = new EventBus();
    const received: SimEvent[] = [];

    const unsubscribe = bus.on((e) => received.push(e));
    bus.emit({ type: 'DOT_EATEN', alt: false });
    bus.emit({ type: 'EXTRA_LIFE' });

    expect(received.length).toBe(2);
    expect(received[0].type).toBe('DOT_EATEN');
    expect(received[1].type).toBe('EXTRA_LIFE');

    unsubscribe();
    bus.emit({ type: 'READY' });
    expect(received.length).toBe(2);
  });
});
