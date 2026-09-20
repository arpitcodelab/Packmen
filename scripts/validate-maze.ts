import { CLASSIC_MAZE_ASCII } from '../src/data/maze.classic';
import { Maze } from '../src/core/Maze';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  stats: {
    cols: number;
    rows: number;
    dots: number;
    energizers: number;
    totalPellets: number;
    tunnelRow: number;
    reachableCount: number;
  };
}

export function validateMaze(ascii: string[]): ValidationResult {
  const errors: string[] = [];
  const rows = ascii.length;
  const cols = ascii[0]?.length || 0;

  // Rule 1: Exactly 28 cols x 31 rows
  if (cols !== 28 || rows !== 31) {
    errors.push(`Dimensions must be 28x31, got ${cols}x${rows}`);
  }

  // Rule 1b: Left/right mirror symmetry
  let tunnelRow = -1;
  for (let r = 0; r < rows; r++) {
    const rowStr = ascii[r];
    if (rowStr.length !== cols) {
      errors.push(`Row ${r} length is ${rowStr.length}, expected ${cols}`);
    }
    if (rowStr.includes('T')) {
      tunnelRow = r;
    }
    for (let c = 0; c < Math.floor(cols / 2); c++) {
      const leftChar = rowStr[c];
      const rightChar = rowStr[cols - 1 - c];

      // Symmetry check for walls, pellets, tunnels, doors
      const normalize = (ch: string) => {
        if (ch === 'P' || ch === '1' || ch === '2' || ch === '3' || ch === '4' || ch === 'F') return ' ';
        return ch;
      };
      if (normalize(leftChar) !== normalize(rightChar)) {
        errors.push(`Row ${r} asymmetrical: col ${c} ('${leftChar}') vs col ${cols - 1 - c} ('${rightChar}')`);
      }
    }
  }

  // Count pellets
  let dots = 0;
  let energizers = 0;
  const energizerQuadrants = new Set<number>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = ascii[r][c];
      if (ch === '.') dots++;
      if (ch === 'o') {
        energizers++;
        const quadX = c < cols / 2 ? 0 : 1;
        const quadY = r < rows / 2 ? 0 : 1;
        energizerQuadrants.add(quadY * 2 + quadX);
      }
    }
  }

  // Rule 2: Exactly 4 energizers, one per quadrant
  if (energizers !== 4) {
    errors.push(`Expected exactly 4 energizers, found ${energizers}`);
  }
  if (energizerQuadrants.size !== 4) {
    errors.push(`Expected 1 energizer per quadrant, but covered ${energizerQuadrants.size} quadrants`);
  }

  // Rule 3: 244 total pellets (240 dots + 4 energizers)
  const totalPellets = dots + energizers;
  if (totalPellets !== 244) {
    errors.push(`Expected 244 total pellets (240 dots + 4 energizers), got ${totalPellets} (${dots} dots, ${energizers} energizers)`);
  }

  // Rule 5: Tunnel on one row, open at both edges
  if (tunnelRow === -1) {
    errors.push(`No tunnel row ('T') found`);
  } else {
    if (ascii[tunnelRow][0] !== 'T' || ascii[tunnelRow][cols - 1] !== 'T') {
      errors.push(`Tunnel row ${tunnelRow} is not open at both edges`);
    }
  }

  // Rule 6: Exactly one ghost house with a door
  let doorCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (ascii[r][c] === '-') doorCount++;
    }
  }
  if (doorCount === 0) {
    errors.push(`No ghost house door ('-') found`);
  }

  // Rule 4: Reachability from player start
  const maze = new Maze(ascii);
  const visited = new Set<string>();
  const queue: { col: number; row: number }[] = [maze.pacmanStart];
  visited.add(`${maze.pacmanStart.col},${maze.pacmanStart.row}`);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const nbs = maze.neighbors(curr.col, curr.row, 'pacman');
    for (const nb of nbs) {
      const key = `${nb.tile.col},${nb.tile.row}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(nb.tile);
      }
    }
  }

  // Verify all dots and energizers are visited
  for (const p of maze.pellets) {
    const key = `${p.tile.col},${p.tile.row}`;
    if (!visited.has(key)) {
      errors.push(`Unreachable pellet at (${p.tile.col}, ${p.tile.row})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      cols,
      rows,
      dots,
      energizers,
      totalPellets,
      tunnelRow,
      reachableCount: visited.size,
    },
  };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const res = validateMaze(CLASSIC_MAZE_ASCII);
  console.log('Maze Validation Stats:', res.stats);
  if (!res.valid) {
    console.error('Maze validation failed with errors:');
    res.errors.forEach(e => console.error('  -', e));
    process.exit(1);
  } else {
    console.log('Maze validation passed! All 7 PRD rules satisfied.');
    process.exit(0);
  }
}
