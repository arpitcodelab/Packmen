import { Direction, Tile } from '../types';
import { DIR_VEC } from '../direction';
import { CONFIG } from '../../config';

export function dist2(a: Tile, b: Tile): number {
  const dc = a.col - b.col;
  const dr = a.row - b.row;
  return dc * dc + dr * dr;
}

export function ahead(tile: Tile, dir: Direction, steps: number): Tile {
  if (dir === 'none') {
    return { col: tile.col, row: tile.row };
  }
  const v = DIR_VEC[dir];
  const target = { col: tile.col + v.x * steps, row: tile.row + v.y * steps };

  // Authentic arcade quirk (PRD Section 7.4): when facing up, target is also offset 4 left
  if (CONFIG.authenticBugs && dir === 'up') {
    target.col -= steps;
  }
  return target;
}

export const SCATTER_CORNERS: Record<string, Tile> = {
  blinky: { col: 25, row: -3 }, // Top right
  pinky: { col: 2, row: -3 },   // Top left
  inky: { col: 27, row: 31 },   // Bottom right
  clyde: { col: 0, row: 31 },   // Bottom left
};

export interface SimTargetContext {
  pacman: { tile: Tile; dir: Direction };
  blinkyTile?: Tile;
  clydeTile?: Tile;
}

export function getBlinkyTarget(ctx: SimTargetContext): Tile {
  return { ...ctx.pacman.tile };
}

export function getPinkyTarget(ctx: SimTargetContext): Tile {
  return ahead(ctx.pacman.tile, ctx.pacman.dir, 4);
}

export function getInkyTarget(ctx: SimTargetContext): Tile {
  const blinkyPos = ctx.blinkyTile || ctx.pacman.tile;
  const pivot = ahead(ctx.pacman.tile, ctx.pacman.dir, 2);
  return {
    col: pivot.col + (pivot.col - blinkyPos.col),
    row: pivot.row + (pivot.row - blinkyPos.row),
  };
}

export function getClydeTarget(clydeTile: Tile, ctx: SimTargetContext): Tile {
  const d2 = dist2(clydeTile, ctx.pacman.tile);
  // PRD 7.4: If distance > 8 tiles (squared distance > 64), chase Pac-Man; otherwise retreat to scatter corner
  if (d2 > 64) {
    return { ...ctx.pacman.tile };
  }
  return SCATTER_CORNERS.clyde;
}
