import { CONFIG } from '../../config';
import { Storage } from '../../storage/Storage';
import { EventBus } from '../events';

export const HIGH_SCORE_KEY = 'packmen.highScore';

export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 10000;
  private extraLifeAwarded: boolean = false;
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
    this.highScore = Storage.get<number>(HIGH_SCORE_KEY, 10000);
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  addPoints(points: number): void {
    this.score += points;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      Storage.set<number>(HIGH_SCORE_KEY, this.highScore);
    }

    if (!this.extraLifeAwarded && this.score >= CONFIG.EXTRA_LIFE_AT) {
      this.extraLifeAwarded = true;
      this.bus.emit({ type: 'EXTRA_LIFE' });
    }
  }

  reset(): void {
    this.score = 0;
    this.extraLifeAwarded = false;
  }
}
