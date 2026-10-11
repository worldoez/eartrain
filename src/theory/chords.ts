export type ChordFamily = 'triad' | 'sus' | 'seventh';

export interface ChordDef {
  id: string;
  name: string;
  symbol: string; // as written after a root, e.g. C + "m7"
  intervals: number[];
  family: ChordFamily;
  character: string;
}

export const CHORDS: ChordDef[] = [
  { id: 'maj', name: 'Major', symbol: '', intervals: [0, 4, 7], family: 'triad', character: 'Bright, stable, “happy”' },
  { id: 'min', name: 'Minor', symbol: 'm', intervals: [0, 3, 7], family: 'triad', character: 'Dark, stable, “sad”' },
  { id: 'dim', name: 'Diminished', symbol: '°', intervals: [0, 3, 6], family: 'triad', character: 'Tense, squeezed — two minor 3rds' },
  { id: 'aug', name: 'Augmented', symbol: '+', intervals: [0, 4, 8], family: 'triad', character: 'Floating, unresolved — two major 3rds' },
  { id: 'sus2', name: 'Suspended 2nd', symbol: 'sus2', intervals: [0, 2, 7], family: 'sus', character: 'Open, airy — no 3rd' },
  { id: 'sus4', name: 'Suspended 4th', symbol: 'sus4', intervals: [0, 5, 7], family: 'sus', character: 'Wants to fall to the 3rd' },
  { id: 'maj7', name: 'Major 7th', symbol: 'maj7', intervals: [0, 4, 7, 11], family: 'seventh', character: 'Lush, dreamy, jazzy' },
  { id: 'dom7', name: 'Dominant 7th', symbol: '7', intervals: [0, 4, 7, 10], family: 'seventh', character: 'Bluesy, pulls strongly home' },
  { id: 'min7', name: 'Minor 7th', symbol: 'm7', intervals: [0, 3, 7, 10], family: 'seventh', character: 'Mellow, soulful' },
  { id: 'm7b5', name: 'Half-diminished 7th', symbol: 'ø7', intervals: [0, 3, 6, 10], family: 'seventh', character: 'Dark and yearning' },
  { id: 'dim7', name: 'Diminished 7th', symbol: '°7', intervals: [0, 3, 6, 9], family: 'seventh', character: 'Suspenseful, symmetrical' },
  { id: 'minMaj7', name: 'Minor-major 7th', symbol: 'm(maj7)', intervals: [0, 3, 7, 11], family: 'seventh', character: 'Mysterious, film-noir' },
];

export const CHORD_BY_ID: Record<string, ChordDef> = Object.fromEntries(CHORDS.map((c) => [c.id, c]));

// Figured-bass labels used in theory classes.
export const TRIAD_INVERSIONS = [
  { id: 'root', name: 'Root position', figure: '5/3' },
  { id: 'inv1', name: '1st inversion', figure: '6' },
  { id: 'inv2', name: '2nd inversion', figure: '6/4' },
];
export const SEVENTH_INVERSIONS = [
  { id: 'root', name: 'Root position', figure: '7' },
  { id: 'inv1', name: '1st inversion', figure: '6/5' },
  { id: 'inv2', name: '2nd inversion', figure: '4/3' },
  { id: 'inv3', name: '3rd inversion', figure: '4/2' },
];

// Close-position chord from a root, with the first `inversion` notes moved up
// an octave (e.g. C major, inversion 1 -> E G C).
export function buildChord(rootMidi: number, chordId: string, inversion = 0): number[] {
  const notes = CHORD_BY_ID[chordId].intervals.map((i) => rootMidi + i);
  const moved = notes.slice(0, inversion).map((n) => n + 12);
  return [...notes.slice(inversion), ...moved];
}
