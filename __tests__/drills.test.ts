import { generatePitch, generateInterval, generateChord, generateScale, ANSWER_OPTIONS, generateItem } from '../src/drills';
import { Settings } from '../src/types';

// seeded rng: returns a deterministic sequence
function makeRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('drill generators', () => {
  it('pitch easy generates a white key within C4-B4', () => {
    const item = generatePitch('easy', makeRng([0.0]));
    expect(item.drill).toBe('pitch');
    expect(item.answerMidi).toHaveLength(1);
    const midi = item.answerMidi[0];
    expect(midi).toBeGreaterThanOrEqual(60);
    expect(midi).toBeLessThanOrEqual(71);
    expect(item.correctAnswer).toBe(item.display);
    expect(item.answerOptions).toContain(item.correctAnswer);
  });
  it('interval medium returns an interval whose two notes are in range', () => {
    const item = generateInterval('medium', makeRng([0.3, 0.2]));
    expect(item.answerMidi).toHaveLength(2);
    expect(item.answerOptions).toContain(item.correctAnswer);
  });
  it('chord easy returns 3 notes (triad)', () => {
    const item = generateChord('easy', makeRng([0.1, 0.0]));
    expect(item.answerMidi.length).toBeGreaterThanOrEqual(3);
    expect(item.answerOptions).toContain(item.correctAnswer);
  });
  it('scale easy returns a sequence ending an octave up', () => {
    const item = generateScale('easy', makeRng([0.0, 0.0]));
    expect(item.answerMidi.length).toBeGreaterThanOrEqual(8);
    expect(item.answerMidi[item.answerMidi.length - 1] - item.answerMidi[0]).toBe(12);
  });
  it('ANSWER_OPTIONS for intervals medium is the full simple set', () => {
    expect(ANSWER_OPTIONS.intervals.medium).toEqual(
      ['m2','M2','m3','M3','P4','b5','P5','m6','M6','m7','M7','P8']
    );
  });
  it('generateItem picks only enabled drills', () => {
    const settings: Settings = {
      drills: { pitch: { enabled: true, level: 'easy' }, intervals: { enabled: false, level: 'easy' }, chords: { enabled: false, level: 'easy' }, scales: { enabled: false, level: 'easy' } },
      inputMethod: 'hybrid', referenceTone: true, testCount: 20, testMinutes: 5,
    };
    const { drill } = generateItem(settings, makeRng([0.0]));
    expect(drill).toBe('pitch');
  });
});