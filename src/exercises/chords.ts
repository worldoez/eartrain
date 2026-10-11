import { arpeggio, block, type Clip } from '../audio/events';
import { buildChord, CHORDS, CHORD_BY_ID, SEVENTH_INVERSIONS, TRIAD_INVERSIONS } from '../theory/chords';
import { pick, pickItem, randInt } from './random';
import type { ExerciseDef } from './types';

const TRIADS = ['maj', 'min', 'dim', 'aug'];
const SEVENTHS = ['maj7', 'dom7', 'min7', 'm7b5', 'dim7'];

function voicingClip(notes: number[], voicing: string): Clip {
  if (voicing === 'arpUp') return arpeggio(notes, 0.32, 1.4);
  if (voicing === 'arpDown') return arpeggio([...notes].reverse(), 0.32, 1.4);
  return block(notes, 1.9);
}

const VOICING_LABEL: Record<string, string> = { block: 'block', arpUp: 'broken, upward', arpDown: 'broken, downward' };

export const chordQuality: ExerciseDef = {
  id: 'chord-quality',
  title: 'Chord Qualities',
  category: 'chords',
  blurb: 'Major, minor, diminished, augmented, sus and seventh chords — played together or broken.',
  lessonId: 'triads',
  groups: [
    { id: 'items', label: 'Chords', multi: true, min: 2, options: CHORDS.map((c) => ({ id: c.id, label: c.name, sub: c.symbol ? `C${c.symbol}` : 'C' })) },
    {
      id: 'voicing', label: 'How they’re played', multi: true, min: 1, options: [
        { id: 'block', label: 'Block', sub: 'All notes together' },
        { id: 'arpUp', label: 'Broken up', sub: 'Arpeggio, low to high' },
        { id: 'arpDown', label: 'Broken down', sub: 'Arpeggio, high to low' },
      ],
    },
    {
      id: 'inversion', label: 'Inversions', multi: false, options: [
        { id: 'root', label: 'Root position only' },
        { id: 'any', label: 'Any inversion' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Major vs minor', summary: 'The most important distinction', config: { items: ['maj', 'min'], voicing: ['block'], inversion: ['root'] } },
    { id: '2', name: 'All four triads', summary: 'Adds diminished and augmented', config: { items: TRIADS, voicing: ['block'], inversion: ['root'] } },
    { id: '3', name: 'Broken triads', summary: 'Triads as arpeggios', config: { items: TRIADS, voicing: ['arpUp', 'arpDown'], inversion: ['root'] } },
    { id: '4', name: 'Sus chords', summary: 'sus2 and sus4 vs major/minor', config: { items: ['maj', 'min', 'sus2', 'sus4'], voicing: ['block', 'arpUp'], inversion: ['root'] } },
    { id: '5', name: 'Seventh chords', summary: 'maj7, dominant 7, m7', config: { items: ['maj7', 'dom7', 'min7'], voicing: ['block'], inversion: ['root'] } },
    { id: '6', name: 'All sevenths', summary: 'Adds half-diminished and dim7', config: { items: SEVENTHS, voicing: ['block', 'arpUp'], inversion: ['root'] } },
    { id: '7', name: 'Inverted triads', summary: 'Triads in any inversion', config: { items: TRIADS, voicing: ['block'], inversion: ['any'] } },
    { id: '8', name: 'Everything', summary: 'All chord types, any voicing', config: { items: CHORDS.map((c) => c.id), voicing: ['block', 'arpUp', 'arpDown'], inversion: ['any'] } },
  ],
  itemLabel: (item) => CHORD_BY_ID[item]?.name ?? item,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const def = CHORD_BY_ID[item];
    const voicing = pick(config.voicing?.length ? config.voicing : ['block'], rng);
    const anyInv = config.inversion?.[0] === 'any';
    const inv = anyInv ? randInt(0, def.intervals.length - 1, rng) : 0;
    const root = randInt(55, 64, rng);
    return {
      exerciseId: 'chord-quality',
      item,
      prompt: `Which chord? (${VOICING_LABEL[voicing]})`,
      choices: config.items.map((id) => ({ id, label: CHORD_BY_ID[id].name, sub: CHORD_BY_ID[id].symbol ? `C${CHORD_BY_ID[id].symbol}` : 'C' })),
      answer: item,
      clip: voicingClip(buildChord(root, item, inv), voicing),
      clipFor: (id) => voicingClip(buildChord(root, id, Math.min(inv, CHORD_BY_ID[id].intervals.length - 1)), voicing),
      explain: `${def.name} — ${def.character}.`,
    };
  },
};

const INV_LABEL: Record<string, { label: string; sub: string }> = {
  root: { label: 'Root position', sub: '5/3 · 7' },
  inv1: { label: '1st inversion', sub: '6 · 6/5' },
  inv2: { label: '2nd inversion', sub: '6/4 · 4/3' },
  inv3: { label: '3rd inversion', sub: '4/2 (7ths only)' },
};

export const chordInversions: ExerciseDef = {
  id: 'inversions',
  title: 'Inversions',
  category: 'chords',
  blurb: 'Which chord tone is in the bass? Root position, 1st, 2nd or 3rd inversion, with figured bass.',
  lessonId: 'inversions',
  groups: [
    { id: 'items', label: 'Inversions', multi: true, min: 2, options: Object.entries(INV_LABEL).map(([id, v]) => ({ id, ...v })) },
    {
      id: 'chords', label: 'Chord types', multi: true, min: 1, options: [
        { id: 'triads', label: 'Triads', sub: 'Major & minor' },
        { id: 'sevenths', label: 'Seventh chords', sub: 'Dom7, maj7, m7' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Root vs 1st', summary: 'Major & minor triads', config: { items: ['root', 'inv1'], chords: ['triads'] } },
    { id: '2', name: 'Triad inversions', summary: 'Root, 6 and 6/4', config: { items: ['root', 'inv1', 'inv2'], chords: ['triads'] } },
    { id: '3', name: 'Seventh inversions', summary: '7, 6/5, 4/3, 4/2', config: { items: ['root', 'inv1', 'inv2', 'inv3'], chords: ['sevenths'] } },
    { id: '4', name: 'Mixed', summary: 'Triads and sevenths', config: { items: ['root', 'inv1', 'inv2', 'inv3'], chords: ['triads', 'sevenths'] } },
  ],
  itemLabel: (item) => INV_LABEL[item]?.label ?? item,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const invIndex = ['root', 'inv1', 'inv2', 'inv3'].indexOf(item);
    let families = config.chords?.length ? config.chords : ['triads'];
    if (invIndex === 3) families = ['sevenths']; // only 7th chords have a 3rd inversion
    const family = pick(families, rng);
    const chordId = pick(family === 'triads' ? ['maj', 'min'] : ['dom7', 'maj7', 'min7'], rng);
    const root = randInt(50, 60, rng);
    const notes = buildChord(root, chordId, invIndex);
    const figures = family === 'triads' ? TRIAD_INVERSIONS : SEVENTH_INVERSIONS;
    const def = CHORD_BY_ID[chordId];
    return {
      exerciseId: 'inversions',
      item,
      prompt: 'Which inversion? Listen to the lowest note.',
      choices: config.items.map((id) => ({ id, ...INV_LABEL[id] })),
      answer: item,
      clip: block(notes, 2.0),
      clipFor: (id) => {
        const i = ['root', 'inv1', 'inv2', 'inv3'].indexOf(id);
        if (i >= def.intervals.length) return null;
        return block(buildChord(root, chordId, i), 2.0);
      },
      explain: `${def.name} in ${figures[invIndex].name.toLowerCase()} (${figures[invIndex].figure}) — the ${['root', '3rd', '5th', '7th'][invIndex]} is in the bass.`,
    };
  },
};
