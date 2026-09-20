import { FruitType, Tile } from '../types';
import { EventBus } from '../events';
import { getLevelConfig } from '../../data/levels';

export interface FruitState {
  type: FruitType;
  points: number;
  tile: Tile;
}

export class FruitSystem {
  private bus: EventBus;
  private currentFruit: FruitState | null = null;
  private fruitTimer: number = 0;
  private readonly FRUIT_DURATION = 9.5; // 9.5 seconds active
  private readonly fruitTile: Tile = { col: 13, row: 17 };

  private spawned70 = false;
  private spawned170 = false;
  private level = 1;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  get activeFruit(): FruitState | null {
    return this.currentFruit;
  }

  setLevel(level: number): void {
    this.level = level;
    this.resetForLevel();
  }

  resetForLevel(): void {
    this.currentFruit = null;
    this.fruitTimer = 0;
    this.spawned70 = false;
    this.spawned170 = false;
  }

  onDotCount(dotsEaten: number): void {
    if (!this.spawned70 && dotsEaten >= 70) {
      this.spawned70 = true;
      this.spawn();
    } else if (!this.spawned170 && dotsEaten >= 170) {
      this.spawned170 = true;
      this.spawn();
    }
  }

  private spawn(): void {
    const cfg = getLevelConfig(this.level);
    this.currentFruit = {
      type: cfg.fruit,
      points: cfg.fruitPoints,
      tile: { ...this.fruitTile },
    };
    this.fruitTimer = this.FRUIT_DURATION;
    this.bus.emit({ type: 'FRUIT_SPAWNED', fruit: cfg.fruit });
  }

  update(dt: number): void {
    if (!this.currentFruit) return;

    this.fruitTimer -= dt;
    if (this.fruitTimer <= 0) {
      this.currentFruit = null;
    }
  }

  checkCollision(pacmanTile: Tile): FruitState | null {
    if (!this.currentFruit) return null;

    if (pacmanTile.col === this.currentFruit.tile.col && pacmanTile.row === this.currentFruit.tile.row) {
      const eaten = { ...this.currentFruit };
      this.currentFruit = null;
      this.bus.emit({
        type: 'FRUIT_EATEN',
        fruit: eaten.type,
        points: eaten.points,
      });
      return eaten;
    }
    return null;
  }
}
