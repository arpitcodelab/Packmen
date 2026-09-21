import { Direction } from '../core/types';

export class SwipeInput {
  private startX: number = 0;
  private startY: number = 0;
  private isPointerDown: boolean = false;
  private readonly threshold: number = 14; // Ultra-responsive swipe threshold in px
  private onDirCallback: (d: Direction) => void;

  constructor(target: HTMLElement | Window, onDir: (d: Direction) => void) {
    this.onDirCallback = onDir;
    this.bindEvents(target);
  }

  private bindEvents(target: HTMLElement | Window): void {
    // Touch Events
    target.addEventListener('touchstart', (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (touch) {
        this.startX = touch.clientX;
        this.startY = touch.clientY;
      }
    }, { passive: true });

    target.addEventListener('touchmove', (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;

      const dx = touch.clientX - this.startX;
      const dy = touch.clientY - this.startY;

      if (Math.abs(dx) >= this.threshold || Math.abs(dy) >= this.threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.onDirCallback(dx > 0 ? 'right' : 'left');
        } else {
          this.onDirCallback(dy > 0 ? 'down' : 'up');
        }
        this.startX = touch.clientX;
        this.startY = touch.clientY;
      }
    }, { passive: true });

    // Pointer Events (Touch, Pen, Drag)
    target.addEventListener('pointerdown', (e: Event) => {
      const pe = e as PointerEvent;
      this.startX = pe.clientX;
      this.startY = pe.clientY;
      this.isPointerDown = true;
    }, { passive: true });

    target.addEventListener('pointermove', (e: Event) => {
      if (!this.isPointerDown) return;
      const pe = e as PointerEvent;
      const dx = pe.clientX - this.startX;
      const dy = pe.clientY - this.startY;

      if (Math.abs(dx) >= this.threshold || Math.abs(dy) >= this.threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.onDirCallback(dx > 0 ? 'right' : 'left');
        } else {
          this.onDirCallback(dy > 0 ? 'down' : 'up');
        }
        this.startX = pe.clientX;
        this.startY = pe.clientY;
      }
    }, { passive: true });

    const stopPointer = () => { this.isPointerDown = false; };
    target.addEventListener('pointerup', stopPointer, { passive: true });
    target.addEventListener('pointercancel', stopPointer, { passive: true });
  }
}

