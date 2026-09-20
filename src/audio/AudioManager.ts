import { Storage } from '../storage/Storage';
import { GameSimulation } from '../core/GameSimulation';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private _muted = false;
  private masterGain: GainNode | null = null;
  private sirenAudio: HTMLAudioElement | null = null;

  constructor() {
    this._muted = Storage.get<boolean>('packmen.muted', false);
    this.setupUnlockListener();
  }

  get isMuted(): boolean {
    return this._muted;
  }

  public setMuted(muted: boolean): void {
    this._muted = muted;
    Storage.set('packmen.muted', muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this._muted ? 0 : 0.3, this.ctx.currentTime);
    }
    if (this.sirenAudio) {
      this.sirenAudio.muted = this._muted;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this._muted);
    return this._muted;
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this._muted ? 0 : 0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.isUnlocked) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private setupUnlockListener(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.isUnlocked = true;
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  public initSiren(src: string): void {
    if (typeof window === 'undefined') return;
    try {
      this.sirenAudio = new Audio(src);
      this.sirenAudio.loop = true;
      this.sirenAudio.volume = 0.15;
      this.sirenAudio.muted = this._muted;
    } catch {
      // Siren fallback
    }
  }

  public playSiren(): void {
    if (!this.sirenAudio || this._muted) return;
    this.sirenAudio.play().catch(() => {});
  }

  public pauseSiren(): void {
    if (!this.sirenAudio) return;
    this.sirenAudio.pause();
  }

  public setSirenRate(rate: number): void {
    if (!this.sirenAudio) return;
    this.sirenAudio.playbackRate = Math.min(Math.max(rate, 0.8), 2.0);
  }

  /**
   * Dot Eat: Alternating two tones
   */
  public playDot(alt: boolean): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(alt ? 460 : 340, ctx.currentTime);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  /**
   * Energizer Eat: Wobble tone
   */
  public playEnergizer(): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.1);
    osc.frequency.linearRampToValueAtTime(220, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Ghost Eat: Rising triumphant fanfare chime
   */
  public playEatGhost(points: number): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const frequencies = [300, 450, 600, 800, 1000];
    const pitchMultiplier = points >= 1600 ? 1.5 : points >= 800 ? 1.3 : points >= 400 ? 1.1 : 1.0;

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.06;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq * pitchMultiplier, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  /**
   * Fruit Eat: Cheerful dual chirp
   */
  public playEatFruit(): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.08;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  /**
   * Player Death: Classic descending pitch warble
   */
  public playDeath(): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /**
   * Extra Life: 8-bit fanfare arpeggio
   */
  public playExtraLife(): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const chord = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.07;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  /**
   * Connects simulation events to the audio manager
   */
  public attachSimulation(sim: GameSimulation): void {
    sim.on((event) => {
      switch (event.type) {
        case 'DOT_EATEN':
          this.playDot(event.alt);
          break;
        case 'ENERGIZER_EATEN':
          this.playEnergizer();
          break;
        case 'GHOST_EATEN':
          this.playEatGhost(event.points);
          break;
        case 'FRUIT_EATEN':
          this.playEatFruit();
          break;
        case 'PLAYER_DIED':
          this.playDeath();
          this.pauseSiren();
          break;
        case 'EXTRA_LIFE':
          this.playExtraLife();
          break;
      }
    });
  }
}
