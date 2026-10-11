export interface ScaleDef {
  id: string;
  name: string;
  steps: number[]; // semitones above the tonic, ending on the octave
  character: string;
  // The note that gives a mode its colour compared with major/minor.
  signature?: string;
}

export const SCALES: ScaleDef[] = [
  { id: 'major', name: 'Major (Ionian)', steps: [0, 2, 4, 5, 7, 9, 11, 12], character: 'Bright, familiar do-re-mi' },
  { id: 'minor', name: 'Natural minor (Aeolian)', steps: [0, 2, 3, 5, 7, 8, 10, 12], character: 'Plain, sad minor', signature: '♭3, ♭6, ♭7' },
  { id: 'harmonicMinor', name: 'Harmonic minor', steps: [0, 2, 3, 5, 7, 8, 11, 12], character: 'Exotic gap between ♭6 and 7', signature: 'raised 7th' },
  { id: 'melodicMinor', name: 'Melodic minor', steps: [0, 2, 3, 5, 7, 9, 11, 12], character: 'Minor bottom, major top', signature: 'raised 6th and 7th' },
  { id: 'dorian', name: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10, 12], character: 'Minor but hopeful, jazzy', signature: 'minor with ♮6' },
  { id: 'phrygian', name: 'Phrygian', steps: [0, 1, 3, 5, 7, 8, 10, 12], character: 'Spanish / flamenco darkness', signature: 'minor with ♭2' },
  { id: 'lydian', name: 'Lydian', steps: [0, 2, 4, 6, 7, 9, 11, 12], character: 'Dreamy, floating, film-score', signature: 'major with ♯4' },
  { id: 'mixolydian', name: 'Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10, 12], character: 'Rock and folk, bluesy major', signature: 'major with ♭7' },
  { id: 'locrian', name: 'Locrian', steps: [0, 1, 3, 5, 6, 8, 10, 12], character: 'Unstable, rarely used', signature: '♭2 and ♭5' },
  { id: 'majPent', name: 'Major pentatonic', steps: [0, 2, 4, 7, 9, 12], character: 'Folk, no half steps' },
  { id: 'minPent', name: 'Minor pentatonic', steps: [0, 3, 5, 7, 10, 12], character: 'Rock and blues guitar' },
  { id: 'blues', name: 'Blues', steps: [0, 3, 5, 6, 7, 10, 12], character: 'Minor pentatonic + the “blue” ♭5' },
  { id: 'wholeTone', name: 'Whole tone', steps: [0, 2, 4, 6, 8, 10, 12], character: 'Dreamy, no gravity (Debussy)' },
  { id: 'octatonic', name: 'Octatonic (half-whole)', steps: [0, 1, 3, 4, 6, 7, 9, 10, 12], character: 'Suspense, symmetrical' },
  { id: 'chromatic', name: 'Chromatic', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], character: 'Every half step' },
];

export const SCALE_BY_ID: Record<string, ScaleDef> = Object.fromEntries(SCALES.map((s) => [s.id, s]));

export function buildScale(tonic: number, scaleId: string): number[] {
  return SCALE_BY_ID[scaleId].steps.map((s) => tonic + s);
}
