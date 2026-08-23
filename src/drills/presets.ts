import { Difficulty } from '../types';

export interface Preset {
  midiRange: [number, number];
  intervalNames?: string[];
  melodic?: boolean;
  harmonic?: boolean;
  ascending?: boolean;
  descending?: boolean;
  chordTypes?: string[];
  inversions?: boolean;
  arpeggiated?: boolean;
  whiteKeysOnly?: boolean;
  scaleNames?: string[];
}

// Semitones for each simple interval name.
export const INTERVAL_SEMITONES: Record<string, number> = {
  m2: 1, M2: 2, m3: 3, M3: 4, P4: 5, 'b5': 6, P5: 7, m6: 8, M6: 9,
  m7: 10, M7: 11, P8: 12,
  // compound
  m9: 13, M9: 14, m10: 15, M10: 16, P11: 17, b12: 18, P12: 19,
};

export const PITCH_PRESETS: Record<Difficulty, Preset> = {
  easy:   { midiRange: [60, 71], whiteKeysOnly: true },
  medium: { midiRange: [60, 71], whiteKeysOnly: false },
  hard:   { midiRange: [60, 83], whiteKeysOnly: false },
};

export const INTERVAL_PRESETS: Record<Difficulty, Preset> = {
  easy:   { midiRange: [60, 69], intervalNames: ['m3', 'M3', 'P4', 'P5', 'M6', 'P8'], melodic: true, harmonic: false, ascending: true, descending: false },
  medium: { midiRange: [60, 69], intervalNames: ['m2','M2','m3','M3','P4','b5','P5','m6','M6','m7','M7','P8'], melodic: true, harmonic: true, ascending: true, descending: false },
  hard:   { midiRange: [60, 71], intervalNames: ['m2','M2','m3','M3','P4','b5','P5','m6','M6','m7','M7','P8','m9','M9','m10','M10','P11','P12'], melodic: true, harmonic: true, ascending: true, descending: true },
};

export const CHORD_PRESETS: Record<Difficulty, Preset> = {
  easy:   { midiRange: [60, 71], chordTypes: ['maj', 'min'], inversions: false, arpeggiated: false },
  medium: { midiRange: [60, 71], chordTypes: ['maj', 'min', 'dim', 'aug'], inversions: false, arpeggiated: true },
  hard:   { midiRange: [60, 71], chordTypes: ['maj','min','dim','aug','maj7','dom7','m7','m7b5','dim7'], inversions: true, arpeggiated: false },
};

export const SCALE_PRESETS: Record<Difficulty, Preset> = {
  easy:   { midiRange: [60, 71], scaleNames: ['major', 'naturalMinor'] },
  medium: { midiRange: [60, 71], scaleNames: ['major','naturalMinor','harmonicMinor','melodicMinor','dorian','mixolydian'] },
  hard:   { midiRange: [60, 71], scaleNames: ['major','naturalMinor','harmonicMinor','melodicMinor','ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian','wholeTone','diminished','chromatic'] },
};