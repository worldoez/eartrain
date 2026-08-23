import { CHORD_FORMULA, buildChord, SCALE_FORMULA, buildScale } from '../src/drills/formulas';

describe('formulas', () => {
  it('has correct chord formulas', () => {
    expect(CHORD_FORMULA.maj).toEqual([0, 4, 7]);
    expect(CHORD_FORMULA.dom7).toEqual([0, 4, 7, 10]);
    expect(CHORD_FORMULA.dim7).toEqual([0, 3, 6, 9]);
  });
  it('builds a C major chord', () => {
    const c = buildChord(60, 'maj', 0);
    expect(c.midi).toEqual([60, 64, 67]);
    expect(c.display).toBe('maj');
  });
  it('inverts a chord (first inversion)', () => {
    const c = buildChord(60, 'maj', 1);
    expect(c.midi).toEqual([64, 67, 72]); // E G C
  });
  it('has correct scale formulas', () => {
    expect(SCALE_FORMULA.major).toEqual([0, 2, 4, 5, 7, 9, 11, 12]);
    expect(SCALE_FORMULA.dorian).toEqual([0, 2, 3, 5, 7, 9, 10, 12]);
  });
  it('builds a C dorian scale', () => {
    const s = buildScale(60, 'dorian');
    expect(s.midi).toEqual([60, 62, 63, 65, 67, 69, 70, 72]);
    expect(s.display).toBe('dorian');
  });
});