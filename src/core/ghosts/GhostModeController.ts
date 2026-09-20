import { EventBus } from '../events';
import { Ghost } from './Ghost';

export interface ModeScheduleItem {
  mode: 'scatter' | 'chase';
  duration: number; // in seconds
}

export class GhostModeController {
  private schedule: ModeScheduleItem[] = [
    { mode: 'scatter', duration: 7 },
    { mode: 'chase', duration: 20 },
    { mode: 'scatter', duration: 7 },
    { mode: 'chase', duration: 20 },
    { mode: 'scatter', duration: 5 },
    { mode: 'chase', duration: 20 },
    { mode: 'scatter', duration: 5 },
    { mode: 'chase', duration: Infinity },
  ];

  private currentIndex: number = 0;
  private timer: number = 0;
  private bus: EventBus;

  private frightenedDuration: number = 0;
  private ghostEatChain: number = 0;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  get currentMode(): 'scatter' | 'chase' {
    return this.schedule[this.currentIndex].mode;
  }

  get isFrightened(): boolean {
    return this.frightenedDuration > 0;
  }

  get isFlashing(): boolean {
    // Flashing occurs in the last 2 seconds of frightened mode
    return this.isFrightened && this.frightenedDuration <= 2.0;
  }

  startFrightened(duration: number, ghosts: Ghost[]): void {
    this.frightenedDuration = duration;
    this.ghostEatChain = 0;

    this.bus.emit({ type: 'MODE_CHANGED', mode: 'frightened' });

    for (const ghost of ghosts) {
      if (ghost.mode !== 'eaten' && ghost.mode !== 'inHouse' && ghost.mode !== 'leaving') {
        ghost.setMode('frightened');
        ghost.pendingReverse = true;
      }
    }
  }

  getNextGhostPoints(): number {
    const chain = [200, 400, 800, 1600];
    const points = chain[Math.min(this.ghostEatChain, chain.length - 1)];
    this.ghostEatChain++;
    return points;
  }

  update(dt: number, ghosts: Ghost[]): void {
    // Handle Frightened Mode timer
    if (this.frightenedDuration > 0) {
      this.frightenedDuration -= dt;
      if (this.frightenedDuration <= 0) {
        this.frightenedDuration = 0;
        const activeMode = this.currentMode;
        this.bus.emit({ type: 'MODE_CHANGED', mode: activeMode });

        // Restore frightened ghosts to current schedule mode
        for (const ghost of ghosts) {
          if (ghost.mode === 'frightened') {
            ghost.setMode(activeMode);
          }
        }
      }
      return; // Schedule is paused while frightened
    }

    // Normal Scatter / Chase Schedule
    const currentItem = this.schedule[this.currentIndex];
    if (currentItem.duration === Infinity) return;

    this.timer += dt;
    if (this.timer >= currentItem.duration) {
      this.timer = 0;
      this.currentIndex = Math.min(this.currentIndex + 1, this.schedule.length - 1);

      const newMode = this.schedule[this.currentIndex].mode;
      this.bus.emit({ type: 'MODE_CHANGED', mode: newMode });

      for (const ghost of ghosts) {
        if (ghost.mode !== 'eaten' && ghost.mode !== 'inHouse' && ghost.mode !== 'leaving') {
          ghost.setMode(newMode);
          ghost.pendingReverse = true;
        }
      }
    }
  }

  reset(): void {
    this.currentIndex = 0;
    this.timer = 0;
    this.frightenedDuration = 0;
    this.ghostEatChain = 0;
  }
}
