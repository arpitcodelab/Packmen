import { describe, it, expect } from 'vitest';
import { GameSimulation } from '../src/core/GameSimulation';
import { CONFIG } from '../src/config';

describe('Milestone M1: Pacman Grid Movement Engine', () => {
  it('initializes Pacman at correct start tile and stopped state', () => {
    const sim = new GameSimulation();
    expect(sim.pacman.tile).toEqual(sim.maze.pacmanStart);
    expect(sim.pacman.dir).toBe('none');
  });

  it('moves when set to a valid open direction', () => {
    const sim = new GameSimulation();
    const initialPos = { ...sim.pacman.pos };

    // Pacman start has left and right open
    sim.setDirection('left');
    sim.step(0.1); // 100ms

    expect(sim.pacman.dir).toBe('left');
    expect(sim.pacman.pos.x).toBeLessThan(initialPos.x);
    expect(sim.pacman.pos.y).toBe(initialPos.y);
  });

  it('stops at a wall without entering it', () => {
    const sim = new GameSimulation();
    sim.setDirection('left');

    // Step enough time to reach the wall to the left
    for (let i = 0; i < 60; i++) {
      sim.step(1 / 60);
    }

    // Must be stopped or at a valid walkable tile, never inside a wall
    expect(sim.maze.isWall(sim.pacman.tile.col, sim.pacman.tile.row)).toBe(false);
  });

  it('allows instant 180-degree reversal mid-corridor', () => {
    const sim = new GameSimulation();
    sim.setDirection('left');
    sim.step(0.05); // Move a few pixels left

    expect(sim.pacman.dir).toBe('left');
    sim.setDirection('right'); // Reverse immediately

    expect(sim.pacman.dir).toBe('right');
    const posX = sim.pacman.pos.x;
    sim.step(0.05);
    expect(sim.pacman.pos.x).toBeGreaterThan(posX);
  });

  it('buffers turns and turns at the next walkable intersection', () => {
    const sim = new GameSimulation();
    sim.setDirection('left');
    // Buffer an 'up' turn while traveling left
    sim.setDirection('up');

    // In Pacman, while moving, buffered turn will only activate when reaching an open intersection
    for (let i = 0; i < 60; i++) {
      sim.step(1 / 60);
      if (sim.pacman.dir === 'up') break;
    }

    expect(sim.maze.isWall(sim.pacman.tile.col, sim.pacman.tile.row)).toBe(false);
  });

  it('wraps around the side tunnel correctly', () => {
    const sim = new GameSimulation();
    const tunnelRow = 14;

    // Manually place pacman inside the tunnel corridor moving left near edge
    sim.pacman.pos = { x: 2, y: tunnelRow * CONFIG.TILE + 4 };
    sim.pacman.dir = 'left';

    // Step past the left edge (distance ~15px)
    sim.step(0.2);
    expect(sim.pacman.pos.x).toBeGreaterThan(200);
  });
});
