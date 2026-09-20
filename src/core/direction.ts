import { Direction, Vec2 } from './types';

export const DIR_VEC: Record<Exclude<Direction, 'none'>, Vec2> = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
};

// Ghost decision priority order
export const TIE_BREAK_ORDER: readonly Exclude<Direction, 'none'>[] = ['up', 'left', 'down', 'right'];

export function opposite(d: Direction): Direction {
  switch (d) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return 'none';
  }
}
