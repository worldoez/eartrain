export const CHORD_FORMULA: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  dom7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};

export const SCALE_FORMULA: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  ionian: [0, 2, 4, 5, 7, 9, 11, 12],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10, 12],
  aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  locrian: [0, 1, 3, 5, 6, 8, 10, 12],
  wholeTone: [0, 2, 4, 6, 8, 10, 12],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

export function buildChord(rootMidi: number, type: string, inversion: number): { midi: number[]; display: string } {
  const offsets = CHORD_FORMULA[type];
  const notes = offsets.map((o) => rootMidi + o);
  // inversion: move the first `inversion` notes up an octave and to the end
  // (e.g. C major root [60,64,67] -> first inversion E G C [64,67,72])
  const movedUp = notes.slice(0, inversion).map((n) => n + 12);
  return { midi: [...notes.slice(inversion), ...movedUp], display: type };
}

export function buildScale(rootMidi: number, name: string): { midi: number[]; display: string } {
  return { midi: SCALE_FORMULA[name].map((o) => rootMidi + o), display: name };
}