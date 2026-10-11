import { chordInversions, chordQuality } from './chords';
import { cadences, scaleDegrees } from './harmony';
import { intervals } from './intervals';
import { pitchCompare, pitchNames } from './pitch';
import { scales } from './scales';
import type { Category, ExerciseConfig, ExerciseDef } from './types';

export const EXERCISES: ExerciseDef[] = [
  pitchCompare,
  pitchNames,
  intervals,
  chordQuality,
  chordInversions,
  scales,
  scaleDegrees,
  cadences,
];

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const CATEGORIES: { id: Category; name: string; tagline: string }[] = [
  { id: 'pitch', name: 'Pitch', tagline: 'Hear notes and where they sit' },
  { id: 'intervals', name: 'Intervals', tagline: 'The distance between two notes' },
  { id: 'chords', name: 'Chords', tagline: 'Qualities and inversions' },
  { id: 'scales', name: 'Scales', tagline: 'Scales and modes' },
  { id: 'harmony', name: 'Harmony', tagline: 'Hearing notes and chords in a key' },
];

export function levelConfig(ex: ExerciseDef, levelId: string): ExerciseConfig {
  return (ex.levels.find((l) => l.id === levelId) ?? ex.levels[0]).config;
}

// Config used to review a single item: the easiest level that contains it,
// so the answer buttons stay meaningful.
export function reviewConfig(ex: ExerciseDef, item: string): ExerciseConfig {
  const level = ex.levels.find((l) => l.config.items.includes(item)) ?? ex.levels[ex.levels.length - 1];
  const items = level.config.items.includes(item) ? level.config.items : [...level.config.items, item];
  return { ...level.config, items };
}

export type { Category, ExerciseDef };
