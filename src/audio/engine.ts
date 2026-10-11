import { midiToFreq } from '../theory/notes';
import type { Clip } from './events';

export type Timbre = 'piano' | 'soft' | 'organ';

interface Voice {
  out: GainNode;
  oscs: OscillatorNode[];
}

const PIANO_PARTIALS = [1, 0.55, 0.32, 0.2, 0.13, 0.08, 0.05, 0.03];
const ORGAN_PARTIALS = [1, 0.7, 0.35, 0.25, 0, 0, 0, 0.15];

// Synthesised in the browser, so every pitch is perfectly in tune and nothing
// has to be downloaded. Works identically on the web and inside Capacitor.
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<Voice>();
  private endTimer: ReturnType<typeof setTimeout> | null = null;
  private resolveCurrent: (() => void) | null = null;
  private listeners = new Set<(playing: boolean) => void>();
  timbre: Timbre = 'piano';
  private volume = 0.8;

  // Must be called from a user gesture the first time (browser autoplay rules).
  unlock(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor({ latencyHint: 'interactive' });
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(comp).connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running') void this.ctx.resume();
    return this.ctx;
  }

  get unlocked(): boolean {
    return this.ctx?.state === 'running';
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
  }

  onPlayingChange(fn: (playing: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(playing: boolean) {
    this.listeners.forEach((fn) => fn(playing));
  }

  stop() {
    const ctx = this.ctx;
    if (ctx) {
      const now = ctx.currentTime;
      for (const v of this.voices) {
        v.out.gain.cancelScheduledValues(now);
        v.out.gain.setTargetAtTime(0, now, 0.015);
        v.oscs.forEach((o) => {
          try { o.stop(now + 0.1); } catch { /* already stopped */ }
        });
      }
    }
    this.voices.clear();
    if (this.endTimer) clearTimeout(this.endTimer);
    this.endTimer = null;
    this.resolveCurrent?.();
    this.resolveCurrent = null;
    this.emit(false);
  }

  // Plays a clip, cutting off anything already playing. Resolves when done
  // (or immediately when interrupted).
  play(clip: Clip): Promise<void> {
    const ctx = this.unlock();
    this.stop();
    const start = ctx.currentTime + 0.05;
    for (const e of clip.events) this.voice(e.midi, start + e.time, e.dur, e.vel ?? 0.8);
    this.emit(true);
    return new Promise((resolve) => {
      this.resolveCurrent = resolve;
      this.endTimer = setTimeout(() => {
        this.resolveCurrent = null;
        this.endTimer = null;
        this.emit(false);
        resolve();
      }, (clip.length + 0.05) * 1000);
    });
  }

  private voice(midi: number, start: number, dur: number, vel: number) {
    const ctx = this.ctx!;
    const freq = midiToFreq(midi);
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.master!);
    const level = 0.22 * vel;
    const oscs: OscillatorNode[] = [];
    const end = start + dur;

    if (this.timbre === 'soft') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(freq * 4, 8000);
      osc.connect(lp).connect(out);
      out.gain.setValueAtTime(0, start);
      out.gain.linearRampToValueAtTime(level * 1.3, start + 0.03);
      out.gain.setTargetAtTime(level * 0.8, start + 0.03, 0.3);
      oscs.push(osc);
    } else {
      const partials = this.timbre === 'piano' ? PIANO_PARTIALS : ORGAN_PARTIALS;
      out.gain.setValueAtTime(0, start);
      out.gain.linearRampToValueAtTime(level, start + (this.timbre === 'piano' ? 0.004 : 0.015));
      partials.forEach((amp, i) => {
        const n = i + 1;
        if (!amp || freq * n > 12000) return;
        const osc = ctx.createOscillator();
        // A touch of inharmonicity makes the synthetic piano less "electronic".
        osc.frequency.value = this.timbre === 'piano' ? freq * n * Math.sqrt(1 + 0.00015 * n * n) : freq * n;
        const g = ctx.createGain();
        if (this.timbre === 'piano') {
          // Higher partials and higher notes die away faster, like a real string.
          const tau = (2.4 * Math.pow(261.6 / freq, 0.4)) / (1 + 0.7 * i);
          g.gain.setValueAtTime(amp, start);
          g.gain.setTargetAtTime(0, start + 0.005, tau);
        } else {
          g.gain.value = amp * 0.6;
        }
        osc.connect(g).connect(out);
        oscs.push(osc);
      });
    }

    const release = this.timbre === 'organ' ? 0.06 : 0.12;
    out.gain.setTargetAtTime(0, end, release);
    for (const o of oscs) {
      o.start(start);
      o.stop(end + release * 6);
    }
    const v: Voice = { out, oscs };
    this.voices.add(v);
    oscs[0].onended = () => {
      out.disconnect();
      this.voices.delete(v);
    };
  }
}

export const audio = new AudioEngine();
