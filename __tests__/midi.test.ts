import { midiToName, nameToMidi, isWhiteKey, MIDI_MIN, MIDI_MAX } from '../src/utils/midi';

describe('midi utils', () => {
  it('converts midi to note name', () => {
    expect(midiToName(60)).toBe('C4');
    expect(midiToName(61)).toBe('C#4');
    expect(midiToName(71)).toBe('B4');
    expect(midiToName(83)).toBe('B5');
  });
  it('converts name to midi', () => {
    expect(nameToMidi('C4')).toBe(60);
    expect(nameToMidi('F#5')).toBe(78);
  });
  it('detects white keys', () => {
    expect(isWhiteKey(60)).toBe(true);  // C
    expect(isWhiteKey(61)).toBe(false); // C#
    expect(isWhiteKey(65)).toBe(true);  // F
  });
  it('defines the bundled sample range', () => {
    expect(MIDI_MIN).toBe(60);
    expect(MIDI_MAX).toBe(83);
  });
});