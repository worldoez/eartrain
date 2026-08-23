// A4 = MIDI 69 = 440 Hz. freq = 440 * 2^((midi-69)/12)
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
