/**
 * ENG-024: Web Audio API synthesizer — 5 sound effects, no audio files.
 * Per PRD Section 8.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class SoundManager {
  private ctx: AudioContext | null = null;
  private _muted = false;

  get muted(): boolean {
    return this._muted || prefersReducedMotion();
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
  }

  /** Call on first user gesture to unlock AudioContext (iPad Safari requirement). */
  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(
    freq: number,
    durationMs: number,
    type: OscillatorType,
    startTime: number
  ): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const start = now + startTime;
    const end = start + durationMs / 1000;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.005);
    gain.gain.setValueAtTime(0.15, start + (durationMs - 10) / 1000);
    gain.gain.linearRampToValueAtTime(0, end);

    osc.start(start);
    osc.stop(end);
  }

  /** Two descending tones: 600Hz → 500Hz, triangle, 50ms each */
  playPop(): void {
    if (this.muted || !this.ctx) return;
    this.playTone(600, 50, 'triangle', 0);
    this.playTone(500, 50, 'triangle', 0.05);
  }

  /** Pitch varies by fraction: 440 * (1/value), triangle, 80ms. Clamp 200–2000Hz. */
  playSnap(fractionValue?: number): void {
    if (this.muted || !this.ctx) return;
    const value = fractionValue ?? 0.5;
    const pitch = Math.max(200, Math.min(2000, 440 * (1 / value)));
    this.playTone(pitch, 80, 'triangle', 0);
  }

  /** Rising major third: C5 → E5, sine, 120ms each */
  playCorrect(): void {
    if (this.muted || !this.ctx) return;
    this.playTone(523, 120, 'sine', 0);
    this.playTone(659, 120, 'sine', 0.12);
  }

  /** Single 220Hz triangle, 200ms. NOT a buzzer. */
  playIncorrect(): void {
    if (this.muted || !this.ctx) return;
    this.playTone(220, 200, 'triangle', 0);
  }

  /** Ascending arpeggio: C5-E5-G5-C6, sine, 80ms intervals */
  playCelebration(): void {
    if (this.muted || !this.ctx) return;
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      this.playTone(f, 80, 'sine', i * 0.08);
    });
  }
}

export const soundManager = new SoundManager();
