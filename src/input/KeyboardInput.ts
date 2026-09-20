import { Direction } from '../core/types';

export class KeyboardInput {
  private onDirCallback: (d: Direction) => void;

  constructor(onDir: (d: Direction) => void) {
    this.onDirCallback = onDir;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      let d: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          d = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          d = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          d = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          d = 'right';
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (this.onMuteCallback) this.onMuteCallback();
          return;
        case 'r':
        case 'R':
        case 'Enter':
          e.preventDefault();
          if (this.onRestartCallback) this.onRestartCallback();
          return;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          if (this.onPauseCallback) this.onPauseCallback();
          return;
      }

      if (d) {
        e.preventDefault();
        this.onDirCallback(d);
      }
    });
  }

  private onMuteCallback?: () => void;
  private onRestartCallback?: () => void;
  private onPauseCallback?: () => void;

  onMute(cb: () => void): void {
    this.onMuteCallback = cb;
  }

  onRestart(cb: () => void): void {
    this.onRestartCallback = cb;
  }

  onPause(cb: () => void): void {
    this.onPauseCallback = cb;
  }
}
