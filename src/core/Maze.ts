import { Direction, GhostName, Tile } from './types';
import { DIR_VEC } from './direction';

export type WhoCanWalk = 'pacman' | 'ghost' | 'ghostReturning';

export interface PelletInfo {
  tile: Tile;
  type: 'dot' | 'energizer';
}

export class Maze {
  readonly cols: number;
  readonly rows: number;
  private grid: string[];
  private tunnelRow: number = -1;

  readonly pacmanStart: Tile = { col: 13, row: 23 };
  readonly ghostStarts: Record<GhostName, Tile> = {
    blinky: { col: 13, row: 11 },
    pinky: { col: 13, row: 13 },
    inky: { col: 11, row: 13 },
    clyde: { col: 15, row: 13 },
  };
  readonly fruitTile: Tile = { col: 13, row: 17 };
  readonly pellets: PelletInfo[] = [];

  constructor(ascii: string[]) {
    this.grid = ascii;
    this.rows = ascii.length;
    this.cols = ascii[0]?.length || 0;
    this.parse();
  }

  private parse(): void {
    for (let r = 0; r < this.rows; r++) {
      const rowStr = this.grid[r];
      if (rowStr.includes('T')) {
        this.tunnelRow = r;
      }
      for (let c = 0; c < this.cols; c++) {
        const ch = rowStr[c];
        const tile = { col: c, row: r };
        if (ch === '.') {
          this.pellets.push({ tile, type: 'dot' });
        } else if (ch === 'o') {
          this.pellets.push({ tile, type: 'energizer' });
        } else if (ch === 'P') {
          (this as any).pacmanStart = tile;
        } else if (ch === '1') {
          this.ghostStarts.blinky = tile;
        } else if (ch === '2') {
          this.ghostStarts.pinky = tile;
        } else if (ch === '3') {
          this.ghostStarts.inky = tile;
        } else if (ch === '4') {
          this.ghostStarts.clyde = tile;
        } else if (ch === 'F') {
          (this as any).fruitTile = tile;
        }
      }
    }
  }

  getRawChar(col: number, row: number): string {
    if (row < 0 || row >= this.rows) return '#';
    if (col < 0 || col >= this.cols) {
      if (row === this.tunnelRow) return 'T';
      return '#';
    }
    return this.grid[row][col];
  }

  wrapCol(col: number): number {
    if (col < 0) return this.cols - 1;
    if (col >= this.cols) return 0;
    return col;
  }

  isWall(col: number, row: number): boolean {
    const ch = this.getRawChar(col, row);
    return ch === '#';
  }

  isDoor(col: number, row: number): boolean {
    return this.getRawChar(col, row) === '-';
  }

  isTunnel(col: number, row: number): boolean {
    return row === this.tunnelRow && (col <= 5 || col >= this.cols - 6 || col < 0 || col >= this.cols);
  }

  isNoUp(col: number, row: number): boolean {
    // PRD 7.1 / 7.6: The 2 tiles above ghost house entrance and 2 tiles near bottom-middle
    const ch = this.getRawChar(col, row);
    return ch === 'X' || (row === 11 && (col === 12 || col === 15)) || (row === 23 && (col === 12 || col === 15));
  }

  isWalkable(col: number, row: number, who: WhoCanWalk = 'pacman'): boolean {
    if (row === this.tunnelRow && (col < 0 || col >= this.cols)) {
      return true; // Wrap tunnel
    }
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false;
    }

    const ch = this.getRawChar(col, row);
    if (ch === '#') return false;

    if (ch === '-') {
      // Door: only ghosts entering/leaving can pass through
      return who === 'ghost' || who === 'ghostReturning';
    }

    // Ghost house inside
    if ((row === 12 || row === 13 || row === 14) && col >= 10 && col <= 17) {
      if (who === 'pacman') return false;
    }

    return true;
  }

  neighbors(col: number, row: number, who: WhoCanWalk = 'pacman'): { dir: Direction; tile: Tile }[] {
    const result: { dir: Direction; tile: Tile }[] = [];
    const dirs: Exclude<Direction, 'none'>[] = ['up', 'left', 'down', 'right'];

    for (const d of dirs) {
      const v = DIR_VEC[d];
      let nc = col + v.x;
      const nr = row + v.y;
      if (nr === this.tunnelRow) {
        nc = this.wrapCol(nc);
      }
      if (this.isWalkable(nc, nr, who)) {
        result.push({ dir: d, tile: { col: nc, row: nr } });
      }
    }

    return result;
  }
}
