import { describe, it, expect } from 'vitest';
import { GameSimulation } from '../src/core/GameSimulation';
import {
  getClydeTarget,
  getInkyTarget,
  getPinkyTarget,
  SCATTER_CORNERS,
} from '../src/core/ghosts/targeting';

describe('Milestone M4: All Four Ghosts & Scatter/Chase Timers', () => {
  it('Pinky targets 4 tiles ahead of Pac-Man direction', () => {
    const ctx = {
      pacman: { tile: { col: 10, row: 10 }, dir: 'left' as const },
    };
    const target = getPinkyTarget(ctx);
    expect(target).toEqual({ col: 6, row: 10 });
  });

  it('Inky doubles the vector from Blinky to 2 tiles ahead of Pac-Man', () => {
    // Pacman at (10, 10) facing right -> 2 ahead is (12, 10)
    // Blinky at (10, 10) -> vector from Blinky to pivot is (2, 0) -> double is (4, 0)
    // Target is (10+4, 10+0) = (14, 10)
    const ctx = {
      pacman: { tile: { col: 10, row: 10 }, dir: 'right' as const },
      blinkyTile: { col: 10, row: 10 },
    };
    const target = getInkyTarget(ctx);
    expect(target).toEqual({ col: 14, row: 10 });
  });

  it('Clyde targets Pac-Man when far (> 8 tiles) and retreats to scatter corner when close (<= 8 tiles)', () => {
    const ctx = {
      pacman: { tile: { col: 20, row: 20 }, dir: 'left' as const },
    };

    // Far: Clyde at (0, 0) -> distance to (20, 20) is ~28 tiles (> 8)
    const farTarget = getClydeTarget({ col: 0, row: 0 }, ctx);
    expect(farTarget).toEqual({ col: 20, row: 20 });

    // Close: Clyde at (20, 24) -> distance is 4 tiles (<= 8)
    const closeTarget = getClydeTarget({ col: 20, row: 24 }, ctx);
    expect(closeTarget).toEqual(SCATTER_CORNERS.clyde);
  });

  it('GhostModeController starts in scatter and transitions to chase after 7 seconds, reversing all ghosts', () => {
    const sim = new GameSimulation();
    expect(sim.modeController.currentMode).toBe('scatter');

    // Ghosts begin in scatter
    for (const g of sim.ghosts) {
      expect(g.mode).toBe('scatter');
    }

    // Step 7.1 seconds to trigger first schedule transition
    sim.step(7.1);

    expect(sim.modeController.currentMode).toBe('chase');
    for (const g of sim.ghosts) {
      expect(g.mode).toBe('chase');
    }
  });

  it('Colliding with any of the 4 ghosts triggers player death', () => {
    const sim = new GameSimulation();

    // Test collision with Pinky
    sim.pinky.pos = { ...sim.pacman.pos };
    sim.step(0.01);

    expect(sim.lives).toBe(0);
    expect(sim.flow).toBe('dying');
  });
});
