// Classic Pac-Man 28x31 Maze Layout - Pixel-perfect match to SVG vector maze
// Left half (14 chars) defined explicitly, right half is mirror-reversed.
// Legend:
// '#' wall
// '.' dot
// 'o' energizer
// ' ' empty walkable
// '-' ghost house door
// 'T' wrap-around tunnel
// 'P' player start
// '1' Blinky start (outside house)
// '2' Pinky start (inside house)
// '3' Inky start (inside house)
// '4' Clyde start (inside house)
// 'F' fruit spawn tile
// 'X' no-upturn intersection

// 14 columns left half (0..13), exactly 31 rows (0..30)
const LEFT_HALF: string[] = [
  /* 00 */ '##############',
  /* 01 */ '#............#',
  /* 02 */ '#.####.#####.#',
  /* 03 */ '#o####.#####.#',
  /* 04 */ '#.####.#####.#',
  /* 05 */ '#.............',
  /* 06 */ '#.####.##.####',
  /* 07 */ '#.####.##.####',
  /* 08 */ '#......##....#',
  /* 09 */ '######.##### #',
  /* 10 */ '######.##### #',
  /* 11 */ '######.##    1',
  /* 12 */ '######.## ###-',
  /* 13 */ '######.## #   ',
  /* 14 */ 'TTTTTT.   # 32',
  /* 15 */ '######.## #   ',
  /* 16 */ '######.## ####',
  /* 17 */ '######.##    F',
  /* 18 */ '######.## ####',
  /* 19 */ '######.## ####',
  /* 20 */ '#............#',
  /* 21 */ '#.####.#####.#',
  /* 22 */ '#.####.#####.#',
  /* 23 */ '#o..##.......P',
  /* 24 */ '###.##.##.####',
  /* 25 */ '###.##.##.####',
  /* 26 */ '#......##....#',
  /* 27 */ '#.##########.#',
  /* 28 */ '#.##########.#',
  /* 29 */ '#.............',
  /* 30 */ '##############',
];

export const CLASSIC_MAZE_ASCII: string[] = LEFT_HALF.map((left) => {
  const rightChars = left.split('').reverse().map((ch) => {
    if (ch === '1' || ch === 'P' || ch === 'F') return ' ';
    if (ch === '2') return ' ';
    if (ch === '3') return '4'; // Clyde is mirror of Inky
    return ch;
  });
  return left + rightChars.join('');
});
