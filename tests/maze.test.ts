import { describe, it, expect } from 'vitest';
import { CLASSIC_MAZE_ASCII } from '../src/data/maze.classic';
import { validateMaze } from '../scripts/validate-maze';

describe('Milestone M1: Maze Validation', () => {
  it('validates the classic maze against all PRD 7.1 rules', () => {
    const result = validateMaze(CLASSIC_MAZE_ASCII);
    if (!result.valid) {
      console.error('Validation errors:', result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.stats.cols).toBe(28);
    expect(result.stats.rows).toBe(31);
    expect(result.stats.energizers).toBe(4);
    expect(result.stats.totalPellets).toBe(244);
  });
});
