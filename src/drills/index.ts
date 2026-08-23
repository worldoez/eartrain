import { Settings, DrillItem, Difficulty, Drill } from '../types';
import { generatePitch } from './pitch';
import { generateInterval } from './intervals';
import { generateChord } from './chords';
import { generateScale } from './scales';

export { generatePitch, generateInterval, generateChord, generateScale };
export { ANSWER_OPTIONS } from './options';
export { INTERVAL_SEMITONES, PITCH_PRESETS, INTERVAL_PRESETS, CHORD_PRESETS, SCALE_PRESETS } from './presets';
export { CHORD_FORMULA, SCALE_FORMULA, buildChord, buildScale } from './formulas';

export const DRILLS: Record<Drill, (level: Difficulty, rng?: () => number) => DrillItem> = {
  pitch: generatePitch,
  intervals: generateInterval,
  chords: generateChord,
  scales: generateScale,
};

export function generateItem(settings: Settings, rng: () => number = Math.random): { drill: Drill; item: DrillItem } {
  const enabled = (Object.keys(settings.drills) as Drill[]).filter((d) => settings.drills[d].enabled);
  const drill = enabled[Math.floor(rng() * enabled.length)];
  const item = DRILLS[drill](settings.drills[drill].level, rng);
  return { drill, item };
}