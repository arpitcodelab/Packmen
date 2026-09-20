import { CONFIG } from '../../config';
import { Maze } from '../Maze';
import { Tile } from '../types';
import { EventBus } from '../events';

export type EatenPelletType = 'dot' | 'energizer' | null;

export class PelletSystem {
  private pellets = new Map<number, 'dot' | 'energizer'>();
  private bus: EventBus;
  private altDotAudio = false;
  private level: number = 1;

  constructor(maze: Maze, bus: EventBus) {
    this.bus = bus;
    this.initFromMaze(maze);
  }

  initFromMaze(maze: Maze): void {
    this.pellets.clear();
    for (const p of maze.pellets) {
      const idx = p.tile.row * CONFIG.COLS + p.tile.col;
      this.pellets.set(idx, p.type);
    }
  }

  get remainingCount(): number {
    return this.pellets.size;
  }

  hasPellet(col: number, row: number): boolean {
    const idx = row * CONFIG.COLS + col;
    return this.pellets.has(idx);
  }

  getPelletType(col: number, row: number): 'dot' | 'energizer' | null {
    const idx = row * CONFIG.COLS + col;
    return this.pellets.get(idx) || null;
  }

  eat(tile: Tile): EatenPelletType {
    const idx = tile.row * CONFIG.COLS + tile.col;
    const type = this.pellets.get(idx);
    if (!type) return null;

    this.pellets.delete(idx);

    if (type === 'dot') {
      this.altDotAudio = !this.altDotAudio;
      this.bus.emit({ type: 'DOT_EATEN', alt: this.altDotAudio });
    } else if (type === 'energizer') {
      this.bus.emit({ type: 'ENERGIZER_EATEN' });
    }

    if (this.pellets.size === 0) {
      this.bus.emit({ type: 'LEVEL_COMPLETE', level: this.level });
    }

    return type;
  }

  setLevel(level: number): void {
    this.level = level;
  }
}
