import { Difficulty, DrillItem } from '../types';
import { CHORD_PRESETS } from './presets';
import { buildChord } from './formulas';
import { ANSWER_OPTIONS } from './options';

function pick<T>(arr: T[], rng: () => number): T { return arr[Math.floor(rng() * arr.length)]; }

export function generateChord(level: Difficulty, rng: () => number = Math.random): DrillItem {
  const p = CHORD_PRESETS[level];
  const type = pick(p.chordTypes!, rng);
  const inversion = p.inversions ? Math.floor(rng() * 3) : 0;
  // keep top note <= 83: root must be low enough
  const formulaLen = 3; // triad inversion index in 0..2; 7ths use 0..3
  const maxInv = type === 'maj' || type === 'min' || type === 'dim' || type === 'aug' ? 3 : 4;
  const inv = p.inversions ? Math.floor(rng() * maxInv) : 0;
  void formulaLen;
  const root = 60; // keep root at C4 range; chord tops stay within samples for these formulas
  const built = buildChord(root, type, inv);
  return {
    drill: 'chords',
    key: `chord:${type}:inv${inversion}`,
    display: type,
    answerMidi: built.midi,
    answerOptions: ANSWER_OPTIONS.chords[level],
    correctAnswer: type,
    isHarmonic: true,
  };
}