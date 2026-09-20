import { Pacman } from '../Pacman';
import { Ghost } from '../ghosts/Ghost';
import { EventBus } from '../events';
import { GhostModeController } from '../ghosts/GhostModeController';

export type CollisionResult = 'none' | 'playerDied' | 'ghostEaten';

export class CollisionSystem {
  private bus: EventBus;
  private modeController: GhostModeController;

  constructor(bus: EventBus, modeController: GhostModeController) {
    this.bus = bus;
    this.modeController = modeController;
  }

  checkCollision(pacman: Pacman, ghosts: Ghost[]): CollisionResult {
    const pt = pacman.tile;

    for (const ghost of ghosts) {
      const gt = ghost.tile;
      if (pt.col === gt.col && pt.row === gt.row) {
        if (ghost.mode === 'frightened') {
          const points = this.modeController.getNextGhostPoints();
          ghost.setMode('eaten');
          this.bus.emit({
            type: 'GHOST_EATEN',
            ghost: ghost.name,
            points,
            tile: { ...gt },
          });
          return 'ghostEaten';
        } else if (ghost.mode === 'chase' || ghost.mode === 'scatter') {
          this.bus.emit({ type: 'PLAYER_DIED' });
          return 'playerDied';
        }
      }
    }
    return 'none';
  }
}
