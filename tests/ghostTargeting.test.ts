import { describe, it, expect } from 'vitest';
import { GameSimulation } from '../src/core/GameSimulation';
import { Ghost } from '../src/core/ghosts/Ghost';
import { Maze } from '../src/core/Maze';
import { CLASSIC_MAZE_ASCII } from '../src/data/maze.classic';

describe('Milestone M3: Blinky Ghost Engine & Collisions', () => {
  it('Blinky targets Pac-Man tile in chase mode', () => {
    const sim = new GameSimulation();
    sim.blinky.mode = 'chase';
    expect(sim.blinky.mode).toBe('chase');
    expect(sim.blinky.getTarget()).toEqual(sim.pacman.tile);
  });

  it('Ghost never voluntarily reverses direction at an intersection', () => {
    const maze = new Maze(CLASSIC_MAZE_ASCII);
    const ghost = new Ghost(maze, { col: 12, row: 11 }, 'blinky');
    ghost.dir = 'left';

    // Ghost moving left into an intersection should not pick 'right'
    ghost.step(0.01);
    expect(ghost.dir).not.toBe('right');
  });

  it('Ghost respects the no-up rule on restricted intersection tiles', () => {
    const maze = new Maze(CLASSIC_MAZE_ASCII);
    expect(maze.isNoUp(12, 11)).toBe(true);

    const ghost = new Ghost(maze, { col: 12, row: 11 }, 'blinky');
    ghost.dir = 'left';
    ghost.mode = 'chase';
    ghost.setSimView({ pacman: { tile: { col: 12, row: 5 }, dir: 'up' } });

    // Step into tile center
    ghost.step(0.15);
    expect(ghost.dir).not.toBe('up');
  });

  it('Collision between Pac-Man and Blinky triggers player death and decrements attempt', () => {
    const sim = new GameSimulation();
    expect(sim.lives).toBe(1);

    let playerDiedEmitted = false;
    sim.on((e) => {
      if (e.type === 'PLAYER_DIED') playerDiedEmitted = true;
    });

    // Move Blinky to Pacman's position
    sim.blinky.pos = { ...sim.pacman.pos };
    sim.step(0.01);

    expect(playerDiedEmitted).toBe(true);
    expect(sim.lives).toBe(0);
    expect(sim.flow).toBe('dying');
  });

  it('Failing the single attempt transitions immediately to gameOver after death animation', () => {
    const sim = new GameSimulation();
    let gameOverEmitted = false;
    sim.on((e) => {
      if (e.type === 'GAME_OVER') gameOverEmitted = true;
    });

    // Attempt failed
    sim.blinky.pos = { ...sim.pacman.pos };
    sim.step(0.01);
    expect(sim.lives).toBe(0);
    sim.step(1.3); // dying timer expires -> game over

    expect(sim.flow).toBe('gameOver');
    expect(gameOverEmitted).toBe(true);
  });
});
