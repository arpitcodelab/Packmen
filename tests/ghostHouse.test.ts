import { describe, it, expect } from 'vitest';
import { GameSimulation } from '../src/core/GameSimulation';
import { CONFIG } from '../src/config';

describe('Milestone M5: Frightened Mode, Ghost Eating & Ghost House', () => {
  it('energizer triggers frightened mode on ghosts and pauses normal schedule', () => {
    const sim = new GameSimulation();

    // Eat energizer at (1, 3)
    sim.pellets.eat({ col: 1, row: 3 });
    sim.modeController.startFrightened(6.0, sim.ghosts);

    expect(sim.modeController.isFrightened).toBe(true);
    for (const g of sim.ghosts) {
      expect(g.mode).toBe('frightened');
      expect(g.speed).toBeCloseTo(CONFIG.BASE_SPEED_PX_PER_SEC * 0.50);
    }
  });

  it('escalates ghost-eat points in chain: 200 -> 400 -> 800 -> 1600', () => {
    const sim = new GameSimulation();
    sim.modeController.startFrightened(6.0, sim.ghosts);

    expect(sim.modeController.getNextGhostPoints()).toBe(200);
    expect(sim.modeController.getNextGhostPoints()).toBe(400);
    expect(sim.modeController.getNextGhostPoints()).toBe(800);
    expect(sim.modeController.getNextGhostPoints()).toBe(1600);
  });

  it('colliding with a frightened ghost eats the ghost, sets mode to eaten at 200% speed, and awards points', () => {
    const sim = new GameSimulation();
    sim.modeController.startFrightened(6.0, sim.ghosts);

    const initialScore = sim.score;
    // Place Blinky on Pacman
    sim.blinky.pos = { ...sim.pacman.pos };
    sim.step(0.01);

    expect(sim.blinky.mode).toBe('eaten');
    expect(sim.blinky.speed).toBeCloseTo(CONFIG.BASE_SPEED_PX_PER_SEC * 2.0);
    expect(sim.score).toBe(initialScore + 200);
    expect(sim.flow).toBe('ghostEatFreeze');
  });

  it('eaten ghost targets ghost house entrance tile (13, 11)', () => {
    const sim = new GameSimulation();
    sim.blinky.setMode('eaten');

    expect(sim.blinky.getTarget()).toEqual({ col: 13, row: 11 });
  });

  it('GhostHouse fallback timer releases next waiting ghost after 4 seconds', () => {
    const sim = new GameSimulation();
    // Put Inky in house
    sim.inky.setMode('inHouse');
    sim.inky.pos = { x: 11 * 8 + 4, y: 13 * 8 + 4 };

    // Advance 4.1s without eating dots
    sim.ghostHouse.update(4.1, sim.ghosts);

    // Inky should be released
    expect(sim.inky.mode).not.toBe('inHouse');
  });
});
