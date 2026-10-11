import { CHORD_BY_ID } from './chords';
import { pitchClass } from './notes';

export type KeyMode = 'major' | 'minor';

export interface RomanChord {
  numeral: string;
  root: number; // semitones above the tonic
  quality: string; // chord id from CHORDS
}

// Diatonic chords. Minor uses the harmonic-minor V and vii° as taught in
// common-practice harmony.
const DIATONIC: Record<KeyMode, RomanChord[]> = {
  major: [
    { numeral: 'I', root: 0, quality: 'maj' },
    { numeral: 'ii', root: 2, quality: 'min' },
    { numeral: 'iii', root: 4, quality: 'min' },
    { numeral: 'IV', root: 5, quality: 'maj' },
    { numeral: 'V', root: 7, quality: 'maj' },
    { numeral: 'V7', root: 7, quality: 'dom7' },
    { numeral: 'vi', root: 9, quality: 'min' },
    { numeral: 'vii°', root: 11, quality: 'dim' },
  ],
  minor: [
    { numeral: 'i', root: 0, quality: 'min' },
    { numeral: 'ii°', root: 2, quality: 'dim' },
    { numeral: 'III', root: 3, quality: 'maj' },
    { numeral: 'iv', root: 5, quality: 'min' },
    { numeral: 'V', root: 7, quality: 'maj' },
    { numeral: 'V7', root: 7, quality: 'dom7' },
    { numeral: 'VI', root: 8, quality: 'maj' },
    { numeral: 'vii°', root: 11, quality: 'dim' },
  ],
};

// Lets phrases be written once in major numerals and mapped to minor.
const TO_MINOR: Record<string, string> = { I: 'i', ii: 'ii°', iii: 'III', IV: 'iv', V: 'V', V7: 'V7', vi: 'VI', 'vii°': 'vii°' };

export function romanChord(mode: KeyMode, numeral: string): RomanChord {
  const name = mode === 'minor' ? TO_MINOR[numeral] ?? numeral : numeral;
  const found = DIATONIC[mode].find((c) => c.numeral === name);
  if (!found) throw new Error(`Unknown numeral ${numeral} in ${mode}`);
  return found;
}

export function displayNumeral(mode: KeyMode, numeral: string): string {
  return romanChord(mode, numeral).numeral;
}

export type SopranoTarget = 'root' | 'third' | 'fifth';

const UPPER_LOW = 55; // G3
const UPPER_HIGH = 79; // G5
const BASS_LOW = 40; // E2

function upperCandidates(pcs: number[]): number[][] {
  const out: number[][] = [];
  const perms = permutations(pcs);
  for (const perm of perms) {
    for (let start = UPPER_LOW; start < UPPER_LOW + 12; start++) {
      if (pitchClass(start) !== perm[0]) continue;
      const notes = [start];
      for (let i = 1; i < perm.length; i++) {
        let n = notes[i - 1] + 1;
        while (pitchClass(n) !== perm[i]) n++;
        notes.push(n);
      }
      if (notes[notes.length - 1] <= UPPER_HIGH) out.push(notes);
    }
  }
  return out;
}

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

function movement(a: number[], b: number[]): number {
  return a.reduce((sum, n, i) => sum + Math.abs(n - b[i]), 0);
}

// Four-voice (bass + three upper voices) voicing with smooth voice leading:
// each chord picks the close-position upper voicing nearest to the previous one.
export function voiceProgression(
  tonicMidi: number,
  mode: KeyMode,
  numerals: string[],
  finalSoprano?: SopranoTarget,
): number[][] {
  const voiced: number[][] = [];
  let prevUpper: number[] | null = null;
  let prevBass: number | null = null;
  numerals.forEach((num, idx) => {
    const rc = romanChord(mode, num);
    const intervals = CHORD_BY_ID[rc.quality].intervals;
    const rootPc = pitchClass(tonicMidi + rc.root);
    const chordPcs = intervals.map((i) => pitchClass(rootPc + i));
    // Triads double the root (bass); sevenths drop the doubled root.
    const upperPcs = intervals.length === 4 ? chordPcs.slice(1) : chordPcs;

    let bass = BASS_LOW;
    while (pitchClass(bass) !== rootPc) bass++;
    if (prevBass !== null && Math.abs(bass + 12 - prevBass) < Math.abs(bass - prevBass) && bass + 12 <= 55) bass += 12;

    let cands = upperCandidates(upperPcs);
    const isLast = idx === numerals.length - 1;
    if (isLast && finalSoprano) {
      const targetPc = chordPcs[{ root: 0, third: 1, fifth: 2 }[finalSoprano]];
      const filtered = cands.filter((c) => pitchClass(c[c.length - 1]) === targetPc);
      if (filtered.length) cands = filtered;
    }
    const scored = cands.map((c) => ({
      c,
      score: prevUpper ? movement(c, prevUpper) : Math.abs(c[c.length - 1] - 72),
    }));
    scored.sort((a, b) => a.score - b.score);
    const upper = scored[0].c;
    voiced.push([bass, ...upper]);
    prevUpper = upper;
    prevBass = bass;
  });
  return voiced;
}

export interface CadenceDef {
  id: string;
  name: string;
  short: string;
  description: string;
}

export const CADENCES: CadenceDef[] = [
  { id: 'PAC', name: 'Perfect authentic', short: 'PAC', description: 'V → I, tonic in the bass and on top. A full stop.' },
  { id: 'IAC', name: 'Imperfect authentic', short: 'IAC', description: 'V → I, but the 3rd or 5th is on top. Final, but less complete.' },
  { id: 'HC', name: 'Half cadence', short: 'HC', description: 'Ends on V. A comma or question mark.' },
  { id: 'PC', name: 'Plagal', short: 'Plagal', description: 'IV → I. The “Amen” ending.' },
  { id: 'DC', name: 'Deceptive', short: 'Deceptive', description: 'V → vi. You expect home and get a surprise.' },
];

export const CADENCE_BY_ID: Record<string, CadenceDef> = Object.fromEntries(CADENCES.map((c) => [c.id, c]));

const PHRASES: Record<string, string[][]> = {
  PAC: [['I', 'IV', 'V', 'I'], ['I', 'ii', 'V7', 'I'], ['I', 'vi', 'V', 'I']],
  IAC: [['I', 'IV', 'V', 'I'], ['I', 'ii', 'V7', 'I'], ['I', 'vi', 'V', 'I']],
  HC: [['I', 'IV', 'ii', 'V'], ['I', 'vi', 'IV', 'V'], ['I', 'ii', 'vi', 'V']],
  PC: [['I', 'V', 'IV', 'I'], ['I', 'vi', 'IV', 'I'], ['I', 'iii', 'IV', 'I']],
  DC: [['I', 'IV', 'V', 'vi'], ['I', 'ii', 'V7', 'vi'], ['I', 'vi', 'V', 'vi']],
};

export function cadencePhrase(id: string, rng: () => number): { numerals: string[]; soprano?: SopranoTarget } {
  const options = PHRASES[id];
  const numerals = options[Math.floor(rng() * options.length)];
  if (id === 'PAC') return { numerals, soprano: 'root' };
  if (id === 'IAC') return { numerals, soprano: rng() < 0.5 ? 'third' : 'fifth' };
  return { numerals };
}

// Short progression that establishes a key before a scale-degree question.
export const KEY_CONTEXT = ['I', 'IV', 'V7', 'I'];
