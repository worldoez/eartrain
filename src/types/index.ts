export type Drill = 'pitch' | 'intervals' | 'chords' | 'scales';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type InputMethod = 'hybrid' | 'buttons' | 'piano';

export interface DrillConfig {
  enabled: boolean;
  level: Difficulty;
}

export interface Settings {
  drills: Record<Drill, DrillConfig>;
  inputMethod: InputMethod;
  referenceTone: boolean;
  testCount: number;
  testMinutes: number;
}

// A generated question. `key` is the canonical missed-queue id.
// `answerMidi` is the set of notes to play (1 = pitch, 2 = interval, 2+ = chord, n = scale).
// `answerOptions` is the multiple-choice button set (label strings).
// `correctAnswer` is the label string the user must pick (or, for piano, the note name).
export interface DrillItem {
  drill: Drill;
  key: string;
  display: string;          // human label of the correct answer
  answerMidi: number[];
  answerOptions: string[];  // button labels (named drills) or note names (pitch/buttons)
  correctAnswer: string;    // the label in answerOptions that is correct
  isHarmonic?: boolean;      // interval/chord: simultaneous vs sequential
  descending?: boolean;      // interval: direction
}

export interface MissedItem {
  key: string;
  drill: Drill;
  correctStreak: number;
  neededStreak: number;
}

export interface HistoryEntry {
  date: string;          // YYYY-MM-DD
  attempts: number;
  correct: number;
  bestTestScore: number; // percent
  secondsPracticed: number;
}

export interface HighScores {
  byConfig: Record<string, number>; // configKey -> best percent
  global: number;                   // best percent across all configs
}