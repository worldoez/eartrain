import { PITCH_PRESETS, INTERVAL_PRESETS, CHORD_PRESETS, SCALE_PRESETS } from '../src/drills/presets';

describe('presets', () => {
  it('pitch easy is white keys, one octave, range C4-B4', () => {
    const p = PITCH_PRESETS.easy;
    expect(p.whiteKeysOnly).toBe(true);
    expect(p.midiRange).toEqual([60, 71]);
  });
  it('pitch hard is all 12, two octaves', () => {
    const p = PITCH_PRESETS.hard;
    expect(p.whiteKeysOnly).toBe(false);
    expect(p.midiRange).toEqual([60, 83]);
  });
  it('intervals easy is consonant melodic ascending', () => {
    const p = INTERVAL_PRESETS.easy;
    expect(p.intervalNames).toEqual(['m3', 'M3', 'P4', 'P5', 'M6', 'P8']);
    expect(p.melodic).toBe(true);
    expect(p.harmonic).toBe(false);
    expect(p.ascending).toBe(true);
    expect(p.descending).toBe(false);
  });
  it('intervals hard includes compound and descending', () => {
    const p = INTERVAL_PRESETS.hard;
    expect(p.descending).toBe(true);
    expect(p.intervalNames).toContain('m9');
  });
  it('chords hard includes 7ths and inversions', () => {
    const p = CHORD_PRESETS.hard;
    expect(p.chordTypes).toContain('dom7');
    expect(p.inversions).toBe(true);
  });
  it('scales medium includes dorian and mixolydian', () => {
    const p = SCALE_PRESETS.medium;
    expect(p.scaleNames).toContain('dorian');
    expect(p.scaleNames).toContain('mixolydian');
  });
});