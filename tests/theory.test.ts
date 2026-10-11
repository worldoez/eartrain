import { describe, expect, it } from 'vitest';
import { buildChord, CHORDS } from '../src/theory/chords';
import { CADENCES, cadencePhrase, romanChord, voiceProgression } from '../src/theory/harmony';
import { INTERVALS, INTERVAL_BY_ID } from '../src/theory/intervals';
import { isWhiteKey, midiToFreq, midiToName, pitchClass } from '../src/theory/notes';
import { buildScale, SCALES } from '../src/theory/scales';
import { mulberry32 } from '../src/exercises/random';

describe('notes', () => {
  it('names and tunes pitches', () => {
    expect(midiToName(60)).toBe('C4');
    expect(midiToName(61)).toBe('C♯4');
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(81)).toBeCloseTo(880);
    expect(pitchClass(-1)).toBe(11);
    expect(isWhiteKey(64)).toBe(true);
    expect(isWhiteKey(66)).toBe(false);
  });
});

describe('intervals', () => {
  it('have unique ids and increasing sizes', () => {
    expect(new Set(INTERVALS.map((i) => i.id)).size).toBe(INTERVALS.length);
    expect(INTERVAL_BY_ID.P5.semitones).toBe(7);
    expect(INTERVAL_BY_ID.TT.semitones).toBe(6);
    expect(INTERVAL_BY_ID.P12.semitones).toBe(19);
  });
});

describe('chords', () => {
  it('builds root position and inversions', () => {
    expect(buildChord(60, 'maj')).toEqual([60, 64, 67]);
    expect(buildChord(60, 'maj', 1)).toEqual([64, 67, 72]);
    expect(buildChord(60, 'maj', 2)).toEqual([67, 72, 76]);
    expect(buildChord(60, 'dom7', 3)).toEqual([70, 72, 76, 79]);
  });
  it('every chord starts on the root', () => {
    for (const c of CHORDS) expect(c.intervals[0]).toBe(0);
  });
});

describe('scales', () => {
  it('end on the octave and ascend', () => {
    for (const s of SCALES) {
      expect(s.steps[0]).toBe(0);
      expect(s.steps[s.steps.length - 1]).toBe(12);
      for (let i = 1; i < s.steps.length; i++) expect(s.steps[i]).toBeGreaterThan(s.steps[i - 1]);
    }
    expect(buildScale(60, 'major')).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
  });
  it('modes differ from major/minor by their characteristic note', () => {
    const major = buildScale(0, 'major');
    const lydian = buildScale(0, 'lydian');
    expect(lydian.filter((n, i) => n !== major[i])).toEqual([6]); // ♯4
  });
});

describe('harmony', () => {
  it('maps major numerals to minor', () => {
    expect(romanChord('minor', 'I')).toMatchObject({ numeral: 'i', quality: 'min' });
    expect(romanChord('minor', 'V')).toMatchObject({ numeral: 'V', quality: 'maj' });
    expect(romanChord('minor', 'vi')).toMatchObject({ numeral: 'VI', root: 8 });
  });

  it('voices each chord with the right notes and smooth upper voices', () => {
    const v = voiceProgression(60, 'major', ['I', 'IV', 'V7', 'I']);
    expect(v).toHaveLength(4);
    for (const chord of v) expect(chord).toHaveLength(4);
    expect(pitchClass(v[0][0])).toBe(0); // C in bass
    expect(pitchClass(v[1][0])).toBe(5); // F in bass
    expect(pitchClass(v[2][0])).toBe(7); // G in bass
    expect(v[2].slice(1).map(pitchClass).sort((a, b) => a - b)).toEqual([2, 5, 11]); // B D F above
    for (let i = 1; i < v.length; i++) {
      const moved = v[i].slice(1).reduce((s, n, j) => s + Math.abs(n - v[i - 1][j + 1]), 0);
      expect(moved).toBeLessThanOrEqual(8);
    }
  });

  it('honours the soprano target for PAC vs IAC', () => {
    const rng = mulberry32(3);
    for (let k = 0; k < 20; k++) {
      const pac = cadencePhrase('PAC', rng);
      const vp = voiceProgression(62, 'major', pac.numerals, pac.soprano);
      expect(pitchClass(vp[vp.length - 1][3])).toBe(2); // D on top in D major
      const iac = cadencePhrase('IAC', rng);
      const vi = voiceProgression(62, 'major', iac.numerals, iac.soprano);
      expect(pitchClass(vi[vi.length - 1][3])).not.toBe(2);
    }
  });

  it('cadence phrases end on the right chord', () => {
    const rng = mulberry32(1);
    const last: Record<string, string[]> = { PAC: ['I'], IAC: ['I'], HC: ['V'], PC: ['I'], DC: ['vi'] };
    const penult: Record<string, string[]> = { PAC: ['V', 'V7'], DC: ['V', 'V7'], PC: ['IV'] };
    for (const c of CADENCES) {
      const { numerals } = cadencePhrase(c.id, rng);
      expect(last[c.id]).toContain(numerals[numerals.length - 1]);
      if (penult[c.id]) expect(penult[c.id]).toContain(numerals[numerals.length - 2]);
    }
  });
});
