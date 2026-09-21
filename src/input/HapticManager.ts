import { GameSimulation } from '../core/GameSimulation';

export class HapticManager {
  private static canVibrate(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function';
  }

  public static pulse(pattern: number | number[]): void {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors gracefully
    }
  }

  public static buttonTap(): void {
    this.pulse(12);
  }

  public static dot(): void {
    this.pulse(8);
  }

  public static energizer(): void {
    this.pulse(25);
  }

  public static ghostEaten(): void {
    this.pulse([35, 30, 45]);
  }

  public static playerDeath(): void {
    this.pulse([70, 40, 90]);
  }

  public attachSimulation(sim: GameSimulation): void {
    sim.on((event) => {
      switch (event.type) {
        case 'DOT_EATEN':
          HapticManager.dot();
          break;
        case 'ENERGIZER_EATEN':
          HapticManager.energizer();
          break;
        case 'GHOST_EATEN':
          HapticManager.ghostEaten();
          break;
        case 'PLAYER_DIED':
          HapticManager.playerDeath();
          break;
      }
    });
  }
}
