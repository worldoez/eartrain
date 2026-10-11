import { sequence, single, after } from '../audio/events';
import { midiToName, PITCH_CLASS_NAMES } from '../theory/notes';
import { pick, pickItem, randInt } from './random';
import type { ExerciseDef } from './types';

const ALL_PCS = PITCH_CLASS_NAMES.map((_, i) => String(i));
const WHITE_PCS = ['0', '2', '4', '5', '7', '9', '11'];

export const pitchNames: ExerciseDef = {
  id: 'pitch-names',
  title: 'Note Names',
  category: 'pitch',
  blurb: 'Hear a note and name it — the road to perfect (absolute) pitch.',
  lessonId: 'pitch',
  groups: [
    { id: 'items', label: 'Notes', multi: true, min: 2, options: PITCH_CLASS_NAMES.map((n, i) => ({ id: String(i), label: n })) },
    {
      id: 'reference', label: 'Reference', multi: false, options: [
        { id: 'ref', label: 'Play C first', sub: 'Relative pitch' },
        { id: 'none', label: 'No reference', sub: 'Absolute pitch' },
      ],
    },
    {
      id: 'range', label: 'Range', multi: false, options: [
        { id: 'one', label: 'One octave', sub: 'C4–B4' },
        { id: 'wide', label: 'Three octaves', sub: 'C3–B5' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'C, E, G', summary: 'Three anchor notes, with a reference C', config: { items: ['0', '4', '7'], reference: ['ref'], range: ['one'] } },
    { id: '2', name: 'White keys', summary: 'C D E F G A B with a reference', config: { items: WHITE_PCS, reference: ['ref'], range: ['one'] } },
    { id: '3', name: 'All 12 notes', summary: 'Chromatic, with a reference', config: { items: ALL_PCS, reference: ['ref'], range: ['one'] } },
    { id: '4', name: 'White keys, cold', summary: 'No reference note', config: { items: WHITE_PCS, reference: ['none'], range: ['one'] } },
    { id: '5', name: 'Perfect pitch', summary: 'All 12, no reference, three octaves', config: { items: ALL_PCS, reference: ['none'], range: ['wide'] } },
  ],
  itemLabel: (item) => PITCH_CLASS_NAMES[Number(item)],
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const pc = Number(item);
    const octave = config.range?.[0] === 'wide' ? pick([48, 60, 72], rng) : 60;
    const midi = octave + pc;
    const withRef = config.reference?.[0] !== 'none';
    const target = single(midi);
    return {
      exerciseId: 'pitch-names',
      item,
      prompt: withRef ? 'The first note is C. Name the second note.' : 'Name this note.',
      choices: config.items.map((id) => ({ id, label: PITCH_CLASS_NAMES[Number(id)] })),
      answer: item,
      clip: withRef ? after(single(60, 1), target, 0.35) : target,
      clipFor: (id) => single(octave + Number(id)),
      explain: `That was ${midiToName(midi)}.`,
      input: 'piano',
    };
  },
};

const GAPS: Record<string, [number, number]> = {
  big: [7, 12],
  mid: [3, 6],
  small: [1, 2],
};

export const pitchCompare: ExerciseDef = {
  id: 'pitch-compare',
  title: 'Higher or Lower',
  category: 'pitch',
  blurb: 'Two notes — is the second one higher or lower? The first skill every musician builds.',
  lessonId: 'pitch',
  groups: [
    {
      id: 'items', label: 'Distance between notes', multi: true, min: 1, options: [
        { id: 'big', label: 'Large', sub: '7–12 semitones' },
        { id: 'mid', label: 'Medium', sub: '3–6 semitones' },
        { id: 'small', label: 'Small', sub: '1–2 semitones' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Big leaps', summary: 'Easy to hear', config: { items: ['big'] } },
    { id: '2', name: 'Medium steps', summary: 'Leaps and skips', config: { items: ['big', 'mid'] } },
    { id: '3', name: 'Close notes', summary: 'Down to a whole step', config: { items: ['mid', 'small'] } },
    { id: '4', name: 'Half steps', summary: 'The smallest step on a piano', config: { items: ['small'] } },
  ],
  itemLabel: (item) => ({ big: 'Large gap', mid: 'Medium gap', small: 'Small gap' })[item] ?? item,
  generate(config, rng, opts) {
    const gapKey = pickItem(config.items, rng, opts);
    const [lo, hi] = GAPS[gapKey];
    const gap = randInt(lo, hi, rng);
    const up = rng() < 0.5;
    const first = randInt(55, 72, rng);
    const second = up ? first + gap : first - gap;
    const answer = up ? 'higher' : 'lower';
    return {
      exerciseId: 'pitch-compare',
      item: gapKey,
      prompt: 'Is the second note higher or lower?',
      choices: [
        { id: 'lower', label: 'Lower ↓' },
        { id: 'higher', label: 'Higher ↑' },
      ],
      answer,
      clip: sequence([first, second], 0.9, 1.0),
      explain: `${midiToName(first)} → ${midiToName(second)}: ${gap} semitone${gap > 1 ? 's' : ''} ${up ? 'higher' : 'lower'}.`,
    };
  },
};
