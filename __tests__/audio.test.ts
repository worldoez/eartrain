import { midiToFreq } from '../src/audio/midi';

describe('audio math', () => {
  it('A4 (MIDI 69) is 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 1);
  });
  it('C5 (MIDI 72) is ~523.25 Hz', () => {
    expect(midiToFreq(72)).toBeCloseTo(523.25, 1);
  });
  it('each octave doubles the frequency', () => {
    expect(midiToFreq(72) / midiToFreq(60)).toBeCloseTo(2, 1);
  });
});
