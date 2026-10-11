import { sequence, type Clip } from '../audio/events';
import { buildScale, SCALES, SCALE_BY_ID } from '../theory/scales';
import { pick, pickItem, randInt } from './random';
import type { ExerciseDef } from './types';

function scaleClip(tonic: number, id: string, direction: string): Clip {
  const up = buildScale(tonic, id);
  const notes = direction === 'down' ? [...up].reverse() : direction === 'updown' ? [...up, ...up.slice(0, -1).reverse()] : up;
  return sequence(notes, 0.3, 0.45);
}

const MODES = ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'minor', 'locrian'];

export const scales: ExerciseDef = {
  id: 'scales',
  title: 'Scales & Modes',
  category: 'scales',
  blurb: 'Major, the three minors, the church modes, pentatonic, blues and symmetric scales.',
  lessonId: 'scales',
  groups: [
    { id: 'items', label: 'Scales', multi: true, min: 2, options: SCALES.map((s) => ({ id: s.id, label: s.name, sub: s.signature })) },
    {
      id: 'direction', label: 'Direction', multi: true, min: 1, options: [
        { id: 'up', label: 'Ascending' },
        { id: 'down', label: 'Descending' },
        { id: 'updown', label: 'Up and down' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Major vs minor', summary: 'Natural minor vs major', config: { items: ['major', 'minor'], direction: ['up'] } },
    { id: '2', name: 'Three minors', summary: 'Natural, harmonic, melodic minor', config: { items: ['major', 'minor', 'harmonicMinor', 'melodicMinor'], direction: ['up'] } },
    { id: '3', name: 'Modes I', summary: 'Major, minor, Dorian, Mixolydian', config: { items: ['major', 'minor', 'dorian', 'mixolydian'], direction: ['up'] } },
    { id: '4', name: 'Modes II', summary: 'All seven church modes', config: { items: MODES, direction: ['up'] } },
    { id: '5', name: 'Pentatonic & blues', summary: 'Five-note and blues scales', config: { items: ['major', 'minor', 'majPent', 'minPent', 'blues'], direction: ['up'] } },
    { id: '6', name: 'Exotic & symmetric', summary: 'Whole tone, octatonic and more', config: { items: ['harmonicMinor', 'wholeTone', 'octatonic', 'chromatic', 'blues'], direction: ['up'] } },
    { id: '7', name: 'Everything', summary: 'All scales, any direction', config: { items: SCALES.map((s) => s.id), direction: ['up', 'down', 'updown'] } },
  ],
  itemLabel: (item) => SCALE_BY_ID[item]?.name ?? item,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const def = SCALE_BY_ID[item];
    const direction = pick(config.direction?.length ? config.direction : ['up'], rng);
    const tonic = randInt(57, 66, rng);
    return {
      exerciseId: 'scales',
      item,
      prompt: 'Which scale?',
      choices: config.items.map((id) => ({ id, label: SCALE_BY_ID[id].name })),
      answer: item,
      clip: scaleClip(tonic, item, direction),
      clipFor: (id) => scaleClip(tonic, id, direction),
      explain: `${def.name} — ${def.character}.${def.signature ? ` Listen for: ${def.signature}.` : ''}`,
    };
  },
};
