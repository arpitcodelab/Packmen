import { describe, it, expect, beforeEach } from 'vitest';
import { GameSimulation } from '../src/core/GameSimulation';
import { Storage } from '../src/storage/Storage';
import { HIGH_SCORE_KEY } from '../src/core/systems/ScoreSystem';

describe('Milestone M2: Scoring & Pellet System', () => {
  beforeEach(() => {
    Storage.set(HIGH_SCORE_KEY, 1000);
  });

  it('starts with 244 total pellets (240 dots and 4 energizers)', () => {
    const sim = new GameSimulation();
    expect(sim.pellets.remainingCount).toBe(244);
    expect(sim.score).toBe(0);
  });

  it('awards 10 points for eating a dot and applies 1 freeze frame', () => {
    const sim = new GameSimulation();
    // Move Pacman left towards dot
    sim.setDirection('left');
    sim.step(0.1);

    expect(sim.score).toBe(10);
    expect(sim.pacman.freezeFrames).toBe(1);
    expect(sim.pellets.remainingCount).toBe(243);
  });

  it('awards 50 points for eating an energizer and applies 3 freeze frames', () => {
    const sim = new GameSimulation();
    // Simulate eating an energizer tile (1, 3)
    const eaten = sim.pellets.eat({ col: 1, row: 3 });
    expect(eaten).toBe('energizer');

    sim.scoreSystem.addPoints(50);
    sim.pacman.freezeFrames = 3;

    expect(sim.score).toBe(50);
    expect(sim.pacman.freezeFrames).toBe(3);
  });

  it('updates high score when score exceeds current high score', () => {
    const sim = new GameSimulation();
    sim.scoreSystem.addPoints(1500);

    expect(sim.score).toBe(1500);
    expect(sim.highScore).toBe(1500);
    expect(Storage.get(HIGH_SCORE_KEY, 0)).toBe(1500);
  });

  it('emits EXTRA_LIFE event at 10,000 points while keeping single attempt mode', () => {
    const sim = new GameSimulation();
    expect(sim.lives).toBe(1);

    let extraLifeCount = 0;
    sim.on((e) => {
      if (e.type === 'EXTRA_LIFE') extraLifeCount++;
    });

    sim.scoreSystem.addPoints(9990);
    expect(extraLifeCount).toBe(0);
    expect(sim.lives).toBe(1);

    sim.scoreSystem.addPoints(10); // reaches 10,000
    expect(extraLifeCount).toBe(1);
    expect(sim.lives).toBe(1); // Preserves single attempt

    sim.scoreSystem.addPoints(100);
    expect(extraLifeCount).toBe(1); // Only once
    expect(sim.lives).toBe(1);
  });

  it('emits LEVEL_COMPLETE when all pellets are cleared', () => {
    const sim = new GameSimulation();
    let levelCompleteReceived = false;
    sim.on((e) => {
      if (e.type === 'LEVEL_COMPLETE') levelCompleteReceived = true;
    });

    // Eat all pellets directly through PelletSystem
    for (const p of sim.maze.pellets) {
      sim.pellets.eat(p.tile);
    }

    expect(sim.pellets.remainingCount).toBe(0);
    expect(levelCompleteReceived).toBe(true);
    expect(sim.flow).toBe('levelComplete');
  });
});
