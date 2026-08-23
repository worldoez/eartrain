import { Difficulty, DrillItem } from '../types';
import { PITCH_PRESETS } from './presets';
import { midiToName, isWhiteKey } from '../utils/midi';
import { ANSWER_OPTIONS } from './options';

function randInRange(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generatePitch(level: Difficulty, rng: () => number = Math.random): DrillItem {
  const p = PITCH_PRESETS[level];
  let midi = randInRange(p.midiRange[0], p.midiRange[1], rng);
  if (p.whiteKeysOnly) {
    while (!isWhiteKey(midi)) midi = randInRange(p.midiRange[0], p.midiRange[1], rng);
  }
  const name = midiToName(midi);
  return {
    drill: 'pitch',
    key: `pitch:${name}`,
    display: name,
    answerMidi: [midi],
    answerOptions: ANSWER_OPTIONS.pitch[level],
    correctAnswer: name,
  };
}