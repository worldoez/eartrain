// Pitch helpers. MIDI 60 = C4 (middle C).

export const PITCH_CLASS_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export const PITCH_CLASS_ALT = ['C', 'D♭', 'D', 'D♯', 'E', 'F', 'G♭', 'G', 'G♯', 'A', 'A♯', 'B'];

const WHITE = new Set([0, 2, 4, 5, 7, 9, 11]);

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function isWhiteKey(midi: number): boolean {
  return WHITE.has(pitchClass(midi));
}

export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function midiToName(midi: number): string {
  return `${PITCH_CLASS_NAMES[pitchClass(midi)]}${octaveOf(midi)}`;
}

export function pcName(pc: number): string {
  return PITCH_CLASS_NAMES[pitchClass(pc)];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Movable-do solfège for each semitone above the tonic.
// Diatonic syllables in major are do re mi fa sol la ti; chromatic ones use
// the raised form ascending (di, ri, fi, si, li) and lowered for me/le/te.
export const SOLFEGE = ['do', 'ra', 're', 'me', 'mi', 'fa', 'fi', 'sol', 'le', 'la', 'te', 'ti'];
export const DEGREE_LABEL = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
