import { Difficulty, DrillItem } from '../types';
import { INTERVAL_PRESETS, INTERVAL_SEMITONES, Preset } from './presets';
import { ANSWER_OPTIONS } from './options';

function pick<T>(arr: T[], rng: () => number): T { return arr[Math.floor(rng() * arr.length)]; }

export function generateInterval(level: Difficulty, rng: () => number = Math.random): DrillItem {
  const p: Preset = INTERVAL_PRESETS[level];
  const name = pick(p.intervalNames!, rng);
  const semis = INTERVAL_SEMITONES[name];
  const descending = p.descending && rng() < 0.5;
  const harmonic = p.harmonic && (!p.melodic || rng() < 0.5);

  // choose a root so both notes stay within the bundled sample range [60,83]
  const maxRoot = descending ? 83 : 83 - semis;
  const minRoot = 60;
  const root = Math.floor(rng() * (maxRoot - minRoot + 1)) + minRoot;
  const lower = descending ? root - semis + 0 : root; // if descending, root is the high note
  let a: number, b: number;
  if (descending) { a = root; b = root - semis; }
  else { a = root; b = root + semis; }
  // keep within range
  if (b < 60) { a += (60 - b); b += (60 - b); }
  if (b > 83) { a -= (b - 83); b -= (b - 83); }
  void lower;

  return {
    drill: 'intervals',
    key: `interval:${name}:${harmonic ? 'h' : 'm'}:${descending ? 'd' : 'a'}`,
    display: name,
    answerMidi: [a, b],
    answerOptions: ANSWER_OPTIONS.intervals[level],
    correctAnswer: name,
    isHarmonic: harmonic,
    descending,
  };
}