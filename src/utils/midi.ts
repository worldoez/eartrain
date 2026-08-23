export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const MIDI_MIN = 60; // C4
export const MIDI_MAX = 83; // B5

// MIDI 60 = C4. octave = floor(midi/12) - 1.
export function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[midi % 12] + octave;
}

export function nameToMidi(name: string): number {
  const match = name.match(/^([A-G])(#?)(\d+)$/);
  if (!match) throw new Error(`bad note name: ${name}`);
  const [, letter, sharp, octStr] = match;
  const idx = NOTE_NAMES.indexOf(letter + sharp);
  return (parseInt(octStr, 10) + 1) * 12 + idx;
}

export function isWhiteKey(midi: number): boolean {
  return !NOTE_NAMES[midi % 12].includes('#');
}