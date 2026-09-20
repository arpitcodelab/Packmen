export type Vec2 = { x: number; y: number };
export type Tile = { col: number; row: number };
export type Direction = 'up' | 'left' | 'down' | 'right' | 'none';
export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';
export type GhostMode = 'inHouse' | 'leaving' | 'scatter' | 'chase' | 'frightened' | 'eaten';
export type FlowState =
  | 'ready'
  | 'playing'
  | 'ghostEatFreeze'
  | 'dying'
  | 'levelComplete'
  | 'gameOver';

export type FruitType =
  | 'cherry'
  | 'strawberry'
  | 'orange'
  | 'apple'
  | 'melon'
  | 'galaxian'
  | 'bell'
  | 'key';
