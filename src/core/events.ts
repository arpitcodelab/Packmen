import { FruitType, GhostName, Tile } from './types';

export type SimEvent =
  | { type: 'DOT_EATEN'; alt: boolean }
  | { type: 'ENERGIZER_EATEN' }
  | { type: 'GHOST_EATEN'; ghost: GhostName; points: number; tile: Tile }
  | { type: 'FRUIT_SPAWNED'; fruit: FruitType }
  | { type: 'FRUIT_EATEN'; fruit: FruitType; points: number }
  | { type: 'PLAYER_DIED' }
  | { type: 'EXTRA_LIFE' }
  | { type: 'LEVEL_COMPLETE'; level: number }
  | { type: 'MODE_CHANGED'; mode: 'scatter' | 'chase' | 'frightened' }
  | { type: 'GAME_OVER'; score: number }
  | { type: 'READY' };

export type EventListener = (e: SimEvent) => void;

export class EventBus {
  private listeners: EventListener[] = [];

  on(cb: EventListener): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  emit(e: SimEvent): void {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](e);
    }
  }

  clear(): void {
    this.listeners = [];
  }
}
