import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../src/audio/AudioManager';
import { Storage } from '../src/storage/Storage';
import { GameSimulation } from '../src/core/GameSimulation';

describe('AudioManager', () => {
  beforeEach(() => {
    Storage.clear();
  });

  it('initializes with default unmuted state and persists mute toggle', () => {
    const audio = new AudioManager();
    expect(audio.isMuted).toBe(false);

    audio.toggleMute();
    expect(audio.isMuted).toBe(true);
    expect(Storage.get('packmen.muted', false)).toBe(true);

    audio.toggleMute();
    expect(audio.isMuted).toBe(false);
    expect(Storage.get('packmen.muted', true)).toBe(false);
  });

  it('restores muted state from Storage on construction', () => {
    Storage.set('packmen.muted', true);
    const audio = new AudioManager();
    expect(audio.isMuted).toBe(true);
  });

  it('subscribes to GameSimulation events without errors in headless mode', () => {
    const audio = new AudioManager();
    const sim = new GameSimulation();
    expect(() => audio.attachSimulation(sim)).not.toThrow();

    // Trigger simulation events
    expect(() => {
      sim.bus.emit({ type: 'DOT_EATEN', alt: true });
      sim.bus.emit({ type: 'ENERGIZER_EATEN' });
      sim.bus.emit({ type: 'GHOST_EATEN', ghost: 'blinky', tile: { col: 1, row: 1 }, points: 200 });
      sim.bus.emit({ type: 'FRUIT_EATEN', fruit: 'cherry', points: 100 });
      sim.bus.emit({ type: 'PLAYER_DIED' });
      sim.bus.emit({ type: 'EXTRA_LIFE' });
    }).not.toThrow();
  });
});
