import type { Clip } from '../audio/events';

export type Category = 'pitch' | 'intervals' | 'chords' | 'scales' | 'harmony';

export interface Choice {
  id: string;
  label: string;
  sub?: string;
}

export interface Question {
  exerciseId: string;
  item: string; // what is being identified; the key for stats and review
  prompt: string;
  choices: Choice[];
  answer: string;
  clip: Clip;
  // Replays just the key-setting context (e.g. the cadence before a scale degree).
  contextClip?: Clip;
  // "Compare" feature: what the chosen (wrong) answer would have sounded like.
  clipFor?: (choiceId: string) => Clip | null;
  explain: string;
  input?: 'buttons' | 'piano';
}

export interface OptionDef {
  id: string;
  label: string;
  sub?: string;
}

// A group of options in the custom-setup screen. `items` is always the set of
// possible answers; other groups shape how questions are played.
export interface OptionGroup {
  id: string;
  label: string;
  options: OptionDef[];
  multi: boolean;
  min?: number;
}

export type ExerciseConfig = Record<string, string[]>;

export interface Level {
  id: string;
  name: string;
  summary: string;
  config: ExerciseConfig;
}

export interface GenerateOpts {
  avoid?: string; // don't repeat the previous item
  force?: string; // review mode: ask about this item
}

export interface ExerciseDef {
  id: string;
  title: string;
  category: Category;
  blurb: string;
  lessonId?: string;
  groups: OptionGroup[];
  levels: Level[];
  generate(config: ExerciseConfig, rng: () => number, opts?: GenerateOpts): Question;
  itemLabel(item: string): string;
}
