import { Direction } from '../core/types';
import { KeyboardInput } from './KeyboardInput';
import { SwipeInput } from './SwipeInput';

export class InputManager {
  private directionListeners: ((d: Direction) => void)[] = [];
  readonly keyboard: KeyboardInput;
  readonly swipe: SwipeInput;

  constructor(touchElement?: HTMLElement) {
    const handleDir = (d: Direction) => this.dispatchDirection(d);
    this.keyboard = new KeyboardInput(handleDir);
    this.swipe = new SwipeInput(touchElement || window, handleDir);
  }

  onDirection(cb: (d: Direction) => void): () => void {
    this.directionListeners.push(cb);
    return () => {
      this.directionListeners = this.directionListeners.filter(l => l !== cb);
    };
  }

  onMute(cb: () => void): void {
    this.keyboard.onMute(cb);
  }

  onRestart(cb: () => void): void {
    this.keyboard.onRestart(cb);
  }

  onPause(cb: () => void): void {
    this.keyboard.onPause(cb);
  }

  private dispatchDirection(d: Direction): void {
    for (let i = 0; i < this.directionListeners.length; i++) {
      this.directionListeners[i](d);
    }
  }
}
