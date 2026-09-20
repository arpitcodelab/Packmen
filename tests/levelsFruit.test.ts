import { describe, it, expect } from 'vitest';
import { getLevelConfig, FRUIT_POINTS } from '../src/data/levels';
import { GameSimulation } from '../src/core/GameSimulation';
import { FruitSystem } from '../src/core/systems/FruitSystem';
import { EventBus } from '../src/core/events';

describe('Milestone M6: Levels, Fruit, Cruise Elroy & Speed Tables', () => {
  it('correctly loads level 1 and level 2 configurations', () => {
    const l1 = getLevelConfig(1);
    expect(l1.fruit).toBe('cherry');
    expect(l1.fruitPoints).toBe(100);
    expect(l1.pacSpeed).toBe(0.80);
    expect(l1.elroy1Dots).toBe(20);

    const l2 = getLevelConfig(2);
    expect(l2.fruit).toBe('strawberry');
    expect(l2.fruitPoints).toBe(300);
    expect(l2.pacSpeed).toBe(0.90);
  });

  it('clamps level index to level 13+ config for higher levels', () => {
    const l25 = getLevelConfig(25);
    expect(l25.fruit).toBe('key');
    expect(l25.fruitPoints).toBe(5000);
    expect(FRUIT_POINTS.key).toBe(5000);
  });

  it('spawns fruit at 70 dots eaten, awards points on collection, and despawns', () => {
    const bus = new EventBus();
    const fruitSystem = new FruitSystem(bus);

    let fruitSpawned = false;
    let fruitEaten = false;
    bus.on((e) => {
      if (e.type === 'FRUIT_SPAWNED') fruitSpawned = true;
      if (e.type === 'FRUIT_EATEN') fruitEaten = true;
    });

    // Feed 69 dots -> no fruit
    fruitSystem.onDotCount(69);
    expect(fruitSystem.activeFruit).toBeNull();
    expect(fruitSpawned).toBe(false);

    // Feed 70th dot -> fruit spawns
    fruitSystem.onDotCount(70);
    expect(fruitSystem.activeFruit).not.toBeNull();
    expect(fruitSpawned).toBe(true);
    expect(fruitSystem.activeFruit?.type).toBe('cherry');

    // Collect fruit with Pacman
    const collected = fruitSystem.checkCollision({ col: 13, row: 17 });
    expect(collected?.points).toBe(100);
    expect(fruitEaten).toBe(true);
    expect(fruitSystem.activeFruit).toBeNull();
  });

  it('despawns fruit if not collected before timer expires (9.5s)', () => {
    const bus = new EventBus();
    const fruitSystem = new FruitSystem(bus);

    fruitSystem.onDotCount(70);
    expect(fruitSystem.activeFruit).not.toBeNull();

    // Advance 9.6 seconds
    fruitSystem.update(9.6);
    expect(fruitSystem.activeFruit).toBeNull();
  });

  it('activates Cruise Elroy on Blinky when remaining dots drop below threshold', () => {
    const sim = new GameSimulation();
    expect(sim.blinky.elroyLevel).toBe(0);

    // Trigger Elroy level 1 on Blinky
    sim.blinky.setElroy(1, 0.80);
    expect(sim.blinky.elroyLevel).toBe(1);

    // Blinky in Elroy keeps targeting Pacman even during scatter mode
    sim.blinky.setMode('scatter');
    expect(sim.blinky.getTarget()).toEqual(sim.pacman.tile);
  });
});
