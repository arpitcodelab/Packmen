import { CONFIG } from '../config';
import { Direction, Tile, Vec2 } from './types';
import { DIR_VEC } from './direction';
import { Maze } from './Maze';

export abstract class Actor {
  pos: Vec2;
  dir: Direction = 'none';
  speed: number = CONFIG.BASE_SPEED_PX_PER_SEC;
  protected maze: Maze;

  constructor(maze: Maze, startTile: Tile) {
    this.maze = maze;
    this.pos = {
      x: startTile.col * CONFIG.TILE + CONFIG.TILE / 2,
      y: startTile.row * CONFIG.TILE + CONFIG.TILE / 2,
    };
  }

  get tile(): Tile {
    return {
      col: Math.floor(this.pos.x / CONFIG.TILE),
      row: Math.floor(this.pos.y / CONFIG.TILE),
    };
  }

  get tileCenter(): Vec2 {
    const t = this.tile;
    return {
      x: t.col * CONFIG.TILE + CONFIG.TILE / 2,
      y: t.row * CONFIG.TILE + CONFIG.TILE / 2,
    };
  }

  protected abstract decideAtCenter(): void;

  step(dt: number): void {
    if (this.dir === 'none' || this.speed <= 0) {
      this.decideAtCenter();
      return;
    }

    let remainingDist = this.speed * dt;
    const maxSteps = 8;
    let steps = 0;

    while (remainingDist > 0.0001 && steps < maxSteps) {
      steps++;
      if ((this.dir as Direction) === 'none') break;

      const activeDir = this.dir as Exclude<Direction, 'none'>;
      const vec = DIR_VEC[activeDir];
      const center = this.tileCenter;

      // Distance along current axis to the upcoming tile center
      let distToCenter: number;
      if (vec.x > 0) {
        distToCenter = (this.pos.x < center.x - 0.001) ? (center.x - this.pos.x) : (center.x + CONFIG.TILE - this.pos.x);
      } else if (vec.x < 0) {
        distToCenter = (this.pos.x > center.x + 0.001) ? (this.pos.x - center.x) : (this.pos.x - (center.x - CONFIG.TILE));
      } else if (vec.y > 0) {
        distToCenter = (this.pos.y < center.y - 0.001) ? (center.y - this.pos.y) : (center.y + CONFIG.TILE - this.pos.y);
      } else {
        distToCenter = (this.pos.y > center.y + 0.001) ? (this.pos.y - center.y) : (this.pos.y - (center.y - CONFIG.TILE));
      }

      if (distToCenter <= 0.001) {
        this.pos.x = center.x;
        this.pos.y = center.y;
        this.decideAtCenter();
        if ((this.dir as Direction) === 'none') break;
        distToCenter = CONFIG.TILE;
      }

      const move = Math.min(remainingDist, distToCenter);
      this.pos.x += vec.x * move;
      this.pos.y += vec.y * move;
      remainingDist -= move;

      if (move === distToCenter) {
        if (vec.x !== 0) this.pos.y = center.y;
        if (vec.y !== 0) this.pos.x = center.x;
        this.decideAtCenter();
      }
    }

    this.applyTunnelWrap();
  }

  protected applyTunnelWrap(): void {
    const totalWidth = CONFIG.COLS * CONFIG.TILE;
    const halfTile = CONFIG.TILE / 2;

    if (this.pos.x < -halfTile) {
      this.pos.x += totalWidth;
    } else if (this.pos.x > totalWidth + halfTile) {
      this.pos.x -= totalWidth;
    }
  }
}
