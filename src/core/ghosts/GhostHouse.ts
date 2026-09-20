import { Ghost } from './Ghost';
import { GhostName } from '../types';

export interface HouseReleaseRules {
  pinky: number;
  inky: number;
  clyde: number;
}

export class GhostHouse {
  private dotLimits: HouseReleaseRules = {
    pinky: 0,
    inky: 30,
    clyde: 60,
  };

  private currentGhostIdx = 0;
  private readonly releaseOrder: GhostName[] = ['pinky', 'inky', 'clyde'];
  private currentDots = 0;
  private fallbackTimer = 0;
  private readonly FALLBACK_LIMIT = 4.0;

  onDotEaten(ghosts: Ghost[]): void {
    this.fallbackTimer = 0;
    this.currentDots++;
    this.checkRelease(ghosts);
  }

  update(dt: number, ghosts: Ghost[]): void {
    this.fallbackTimer += dt;
    if (this.fallbackTimer >= this.FALLBACK_LIMIT) {
      this.fallbackTimer = 0;
      this.forceReleaseNext(ghosts);
    }
  }

  private checkRelease(ghosts: Ghost[]): void {
    while (this.currentGhostIdx < this.releaseOrder.length) {
      const name = this.releaseOrder[this.currentGhostIdx];
      const ghost = ghosts.find((g) => g.name === name);
      if (!ghost || (ghost.mode !== 'inHouse' && ghost.mode !== 'leaving')) {
        this.currentGhostIdx++;
        continue;
      }
      const threshold = this.dotLimits[name as keyof HouseReleaseRules];
      if (this.currentDots >= threshold) {
        this.releaseGhost(name, ghosts);
        this.currentGhostIdx++;
      }
      break;
    }
  }

  private forceReleaseNext(ghosts: Ghost[]): void {
    while (this.currentGhostIdx < this.releaseOrder.length) {
      const name = this.releaseOrder[this.currentGhostIdx];
      const ghost = ghosts.find((g) => g.name === name);
      if (!ghost || (ghost.mode !== 'inHouse' && ghost.mode !== 'leaving')) {
        this.currentGhostIdx++;
        continue;
      }
      this.releaseGhost(name, ghosts);
      this.currentGhostIdx++;
      break;
    }
  }

  private releaseGhost(name: GhostName, ghosts: Ghost[]): void {
    const ghost = ghosts.find((g) => g.name === name);
    if (ghost) {
      ghost.pos = { x: 13 * 8 + 4, y: 11 * 8 + 4 };
      ghost.dir = 'left';
      ghost.setMode('chase');
    }
  }

  reset(): void {
    this.currentGhostIdx = 0;
    this.currentDots = 0;
    this.fallbackTimer = 0;
  }
}
