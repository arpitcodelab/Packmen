import { Actor } from './Actor';
import { Direction, Tile } from './types';
import { DIR_VEC, opposite } from './direction';
import { Maze } from './Maze';

export class Pacman extends Actor {
  desiredDir: Direction = 'none';
  freezeFrames: number = 0;

  constructor(maze: Maze, startTile: Tile) {
    super(maze, startTile);
  }

  setDesiredDirection(d: Direction): void {
    if (d === 'none') return;
    this.desiredDir = d;

    // Instant 180-degree reversal mid-corridor
    if (this.dir !== 'none' && d === opposite(this.dir)) {
      this.dir = d;
      return;
    }

    // If currently stopped, try to start immediately if tile allows
    if (this.dir === 'none') {
      const t = this.tile;
      const v = DIR_VEC[d];
      let nc = t.col + v.x;
      const nr = t.row + v.y;
      if (this.maze.isTunnel(nc, nr)) {
        nc = this.maze.wrapCol(nc);
      }
      if (this.maze.isWalkable(nc, nr, 'pacman')) {
        this.dir = d;
        if (v.x !== 0) this.pos.y = this.tileCenter.y;
        if (v.y !== 0) this.pos.x = this.tileCenter.x;
      }
      return;
    }

    // Cornering snap tolerance: If close to the tile center (within 3px) and turning perpendicular into an open corridor
    const center = this.tileCenter;
    const isPerpendicular =
      (DIR_VEC[this.dir].x !== 0 && DIR_VEC[d].y !== 0) ||
      (DIR_VEC[this.dir].y !== 0 && DIR_VEC[d].x !== 0);

    if (isPerpendicular) {
      const dist =
        DIR_VEC[this.dir].x !== 0
          ? Math.abs(this.pos.x - center.x)
          : Math.abs(this.pos.y - center.y);

      if (dist <= 3.0) {
        const v = DIR_VEC[d];
        let nc = this.tile.col + v.x;
        const nr = this.tile.row + v.y;
        if (this.maze.isTunnel(nc, nr)) nc = this.maze.wrapCol(nc);

        if (this.maze.isWalkable(nc, nr, 'pacman')) {
          this.pos.x = center.x;
          this.pos.y = center.y;
          this.dir = d;
        }
      }
    }
  }

  protected decideAtCenter(): void {
    const t = this.tile;

    // 1. Try desiredDir first (buffered turn)
    if (this.desiredDir !== 'none') {
      const v = DIR_VEC[this.desiredDir];
      let nc = t.col + v.x;
      const nr = t.row + v.y;
      if (this.maze.isTunnel(nc, nr)) {
        nc = this.maze.wrapCol(nc);
      }
      if (this.maze.isWalkable(nc, nr, 'pacman')) {
        this.dir = this.desiredDir;
        return;
      }
    }

    // 2. Continue current direction if walkable
    if (this.dir !== 'none') {
      const v = DIR_VEC[this.dir];
      let nc = t.col + v.x;
      const nr = t.row + v.y;
      if (this.maze.isTunnel(nc, nr)) {
        nc = this.maze.wrapCol(nc);
      }
      if (this.maze.isWalkable(nc, nr, 'pacman')) {
        return;
      }
    }

    // 3. Hit a wall -> stop
    this.dir = 'none';
  }

  override step(dt: number): void {
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }
    super.step(dt);
  }
}
