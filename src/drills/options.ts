import { Drill, Difficulty } from '../types';

export const ANSWER_OPTIONS: Record<Drill, Record<Difficulty, string[]>> = {
  pitch: {
    easy: ['C4','D4','E4','F4','G4','A4','B4'],
    medium: ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4'],
    hard: ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4',
           'C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5','A5','A#5','B5'],
  },
  intervals: {
    easy: ['m3','M3','P4','P5','M6','P8'],
    medium: ['m2','M2','m3','M3','P4','b5','P5','m6','M6','m7','M7','P8'],
    hard: ['m2','M2','m3','M3','P4','b5','P5','m6','M6','m7','M7','P8','m9','M9','m10','M10','P11','P12'],
  },
  chords: {
    easy: ['maj','min'],
    medium: ['maj','min','dim','aug'],
    hard: ['maj','min','dim','aug','maj7','dom7','m7','m7b5','dim7'],
  },
  scales: {
    easy: ['major','naturalMinor'],
    medium: ['major','naturalMinor','harmonicMinor','melodicMinor','dorian','mixolydian'],
    hard: ['major','naturalMinor','harmonicMinor','melodicMinor','ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian','wholeTone','diminished','chromatic'],
  },
};