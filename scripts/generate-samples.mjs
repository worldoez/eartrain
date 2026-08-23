import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'audio', 'samples');
const SAMPLE_RATE = 44100;
const DURATION = 1.2; // seconds
const MIDI_MIN = 60;
const MIDI_MAX = 83;

function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

// ADSR: attack 8ms, decay to sustain 0.3 over 120ms, sustain, release 300ms.
function envelope(t) {
  const attack = 0.008, decay = 0.12, release = 0.3, sustainLevel = 0.3;
  const end = DURATION;
  if (t < attack) return t / attack;
  if (t < attack + decay) {
    const p = (t - attack) / decay;
    return 1 - (1 - sustainLevel) * p;
  }
  if (t < end - release) return sustainLevel;
  if (t < end) return sustainLevel * (1 - (t - (end - release)) / release);
  return 0;
}

function sampleAt(t, freq) {
  // additive: fundamental + harmonics 2..5, amplitude ~1/n, slight decay over time
  const decay = Math.exp(-2.2 * t);
  let s = 0;
  for (let n = 1; n <= 5; n++) {
    s += (1 / n) * Math.sin(2 * Math.PI * freq * n * t);
  }
  return s * envelope(t) * decay * 0.5; // 0.5 overall gain to avoid clipping
}

function writeWav(midi) {
  const freq = midiToFreq(midi);
  const numSamples = Math.floor(SAMPLE_RATE * DURATION);
  const buffer = Buffer.alloc(44 + numSamples * 2);
  // RIFF header
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const v = Math.max(-1, Math.min(1, sampleAt(t, freq)));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT_DIR, `${midi}.wav`), buffer);
}

mkdirSync(OUT_DIR, { recursive: true });
for (let m = MIDI_MIN; m <= MIDI_MAX; m++) writeWav(m);
console.log(`Generated ${MIDI_MAX - MIDI_MIN + 1} WAV samples in ${OUT_DIR}`);
