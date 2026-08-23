import { Difficulty, DrillItem } from '../types';
import { SCALE_PRESETS } from './presets';
import { buildScale } from './formulas';
import { ANSWER_OPTIONS } from './options';

function pick<T>(arr: T[], rng: () => number): T { return arr[Math.floor(rng() * arr.length)]; }

export function generateScale(level: Difficulty, rng: () => number = Math.random): DrillItem {
  const p = SCALE_PRESETS[level];
  const name = pick(p.scaleNames!, rng);
  const root = 60;
  const built = buildScale(root, name);
  return {
    drill: 'scales',
    key: `scale:${name}`,
    display: name,
    answerMidi: built.midi,
    answerOptions: ANSWER_OPTIONS.scales[level],
    correctAnswer: name,
    isHarmonic: false,
  };
}