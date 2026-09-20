import { Actor } from '../Actor';
import { Direction, GhostMode, GhostName, Tile } from '../types';
import { DIR_VEC, opposite, TIE_BREAK_ORDER } from '../direction';
import { Maze } from '../Maze';
import {
  dist2,
  getBlinkyTarget,
  getClydeTarget,
  getInkyTarget,
  getPinkyTarget,
  SCATTER_CORNERS,
  SimTargetContext,
} from './targeting';
import { CONFIG } from '../../config';

export interface GhostSimView {
  pacman: { tile: Tile; dir: Direction };
  blinkyTile?: () => Tile;
}

export class Ghost extends Actor {
  readonly name: GhostName;
  mode: GhostMode = 'scatter';
  pendingReverse: boolean = false;
  private simView: GhostSimView | null = null;

  // Cruise Elroy state (Blinky only)
  elroyLevel: 0 | 1 | 2 = 0;
  private elroySpeedMultiplier: number = 0.75;

  constructor(maze: Maze, startTile: Tile, name: GhostName) {
    super(maze, startTile);
    this.name = name;
    this.dir = 'left';
    this.updateSpeed();
  }

  setSimView(view: GhostSimView): void {
    this.simView = view;
  }

  setMode(mode: GhostMode): void {
    this.mode = mode;
    this.updateSpeed();
  }

  setElroy(level: 0 | 1 | 2, speedMultiplier: number): void {
    if (this.name !== 'blinky') return;
    this.elroyLevel = level;
    this.elroySpeedMultiplier = speedMultiplier;
    this.updateSpeed();
  }

  updateSpeed(): void {
    const inTunnel = this.maze.isTunnel(this.tile.col, this.tile.row);

    if (this.mode === 'eaten') {
      this.speed = CONFIG.BASE_SPEED_PX_PER_SEC * 2.0;
    } else if (inTunnel) {
      this.speed = CONFIG.BASE_SPEED_PX_PER_SEC * 0.40;
    } else if (this.mode === 'frightened') {
      this.speed = CONFIG.BASE_SPEED_PX_PER_SEC * 0.50;
    } else if (this.name === 'blinky' && this.elroyLevel > 0) {
      this.speed = CONFIG.BASE_SPEED_PX_PER_SEC * this.elroySpeedMultiplier;
    } else {
      this.speed = CONFIG.BASE_SPEED_PX_PER_SEC * 0.75;
    }
  }

  getTarget(): Tile {
    if (this.mode === 'eaten') {
      return { col: 13, row: 11 };
    }

    // Cruise Elroy (PRD 7.8): Blinky in Elroy keeps chasing Pac-Man even during scatter mode!
    if (this.name === 'blinky' && this.elroyLevel > 0) {
      const ctx: SimTargetContext = {
        pacman: this.simView ? this.simView.pacman : { tile: { col: 13, row: 23 }, dir: 'left' },
      };
      return getBlinkyTarget(ctx);
    }

    if (this.mode === 'scatter') {
      return SCATTER_CORNERS[this.name] || { col: 25, row: -3 };
    }

    if (!this.simView) {
      return { col: 13, row: 23 };
    }

    const ctx: SimTargetContext = {
      pacman: this.simView.pacman,
      blinkyTile: this.simView.blinkyTile ? this.simView.blinkyTile() : undefined,
      clydeTile: this.tile,
    };

    switch (this.name) {
      case 'blinky':
        return getBlinkyTarget(ctx);
      case 'pinky':
        return getPinkyTarget(ctx);
      case 'inky':
        return getInkyTarget(ctx);
      case 'clyde':
        return getClydeTarget(this.tile, ctx);
      default:
        return getBlinkyTarget(ctx);
    }
  }

  protected decideAtCenter(): void {
    const t = this.tile;

    if (this.mode === 'eaten' && t.col === 13 && t.row === 11) {
      this.setMode('chase');
      this.dir = 'down';
      return;
    }

    if (this.pendingReverse) {
      this.pendingReverse = false;
      const rev = opposite(this.dir);
      if (rev !== 'none') {
        this.dir = rev;
        return;
      }
    }

    const opp = opposite(this.dir);

    const candidates = TIE_BREAK_ORDER.filter((d) => {
      if (this.dir !== 'none' && d === opp) {
        return false;
      }

      const v = DIR_VEC[d];
      let nc = t.col + v.x;
      const nr = t.row + v.y;
      if (this.maze.isTunnel(nc, nr)) {
        nc = this.maze.wrapCol(nc);
      }

      const who = this.mode === 'eaten' ? 'ghostReturning' : 'ghost';
      if (!this.maze.isWalkable(nc, nr, who)) {
        return false;
      }

      if (d === 'up' && this.maze.isNoUp(t.col, t.row) && (this.mode === 'chase' || this.mode === 'scatter')) {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      this.dir = opp !== 'none' ? opp : 'left';
      return;
    }

    if (candidates.length === 1) {
      this.dir = candidates[0];
      return;
    }

    if (this.mode === 'frightened') {
      const idx = Math.floor(Math.random() * candidates.length);
      this.dir = candidates[idx];
      return;
    }

    const target = this.getTarget();
    let bestDir = candidates[0];
    let bestDist = Infinity;

    for (const d of candidates) {
      const v = DIR_VEC[d];
      let nc = t.col + v.x;
      const nr = t.row + v.y;
      if (this.maze.isTunnel(nc, nr)) {
        nc = this.maze.wrapCol(nc);
      }
      const d2 = dist2({ col: nc, row: nr }, target);
      if (d2 < bestDist) {
        bestDist = d2;
        bestDir = d;
      }
    }

    this.dir = bestDir;
  }

  override step(dt: number): void {
    this.updateSpeed();
    super.step(dt);
  }

  resetPosition(tile: Tile): void {
    this.pos = {
      x: tile.col * CONFIG.TILE + CONFIG.TILE / 2,
      y: tile.row * CONFIG.TILE + CONFIG.TILE / 2,
    };
    this.dir = 'left';
    this.pendingReverse = false;
    this.elroyLevel = 0;
    this.updateSpeed();
  }
}
