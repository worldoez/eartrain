import { block, sequence, type Clip } from '../audio/events';
import { INTERVALS, INTERVAL_BY_ID, SIMPLE_INTERVAL_IDS, COMPOUND_INTERVAL_IDS } from '../theory/intervals';
import { pick, pickItem, randInt } from './random';
import type { ExerciseDef } from './types';

const DIRECTION_LABEL: Record<string, string> = { up: 'ascending', down: 'descending', harmonic: 'harmonic' };

function intervalClip(root: number, semis: number, direction: string): Clip {
  if (direction === 'harmonic') return block([root, root + semis], 1.8);
  if (direction === 'down') return sequence([root + semis, root], 0.75, 1.0);
  return sequence([root, root + semis], 0.75, 1.0);
}

export const intervals: ExerciseDef = {
  id: 'intervals',
  title: 'Intervals',
  category: 'intervals',
  blurb: 'Identify the distance between two notes — melodic (one after another) or harmonic (together).',
  lessonId: 'intervals',
  groups: [
    { id: 'items', label: 'Intervals', multi: true, min: 2, options: INTERVALS.map((i) => ({ id: i.id, label: i.short, sub: i.name })) },
    {
      id: 'direction', label: 'How they’re played', multi: true, min: 1, options: [
        { id: 'up', label: 'Ascending', sub: 'Low then high' },
        { id: 'down', label: 'Descending', sub: 'High then low' },
        { id: 'harmonic', label: 'Harmonic', sub: 'Together' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Perfect intervals', summary: 'P4, P5, octave — ascending', config: { items: ['P4', 'P5', 'P8'], direction: ['up'] } },
    { id: '2', name: 'Thirds', summary: 'm3 and M3 vs perfect intervals', config: { items: ['m3', 'M3', 'P5', 'P8'], direction: ['up'] } },
    { id: '3', name: 'Seconds & sixths', summary: 'Adds 2nds and 6ths', config: { items: ['M2', 'm3', 'M3', 'P4', 'P5', 'm6', 'M6', 'P8'], direction: ['up'] } },
    { id: '4', name: 'All simple, up', summary: 'All 12 intervals ascending', config: { items: SIMPLE_INTERVAL_IDS, direction: ['up'] } },
    { id: '5', name: 'All simple, down', summary: 'All 12 descending', config: { items: SIMPLE_INTERVAL_IDS, direction: ['down'] } },
    { id: '6', name: 'Harmonic', summary: 'Both notes together', config: { items: SIMPLE_INTERVAL_IDS, direction: ['harmonic'] } },
    { id: '7', name: 'Mixed', summary: 'Up, down and together', config: { items: SIMPLE_INTERVAL_IDS, direction: ['up', 'down', 'harmonic'] } },
    { id: '8', name: 'Compound', summary: 'Intervals larger than an octave', config: { items: ['P8', ...COMPOUND_INTERVAL_IDS], direction: ['up', 'harmonic'] } },
  ],
  itemLabel: (item) => INTERVAL_BY_ID[item]?.name ?? item,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const def = INTERVAL_BY_ID[item];
    const direction = pick(config.direction?.length ? config.direction : ['up'], rng);
    const maxSemis = Math.max(...config.items.map((i) => INTERVAL_BY_ID[i].semitones));
    const root = randInt(maxSemis > 12 ? 48 : 53, maxSemis > 12 ? 58 : 67, rng);
    const song = direction === 'down' ? def.songDown : direction === 'up' ? def.songUp : undefined;
    return {
      exerciseId: 'intervals',
      item,
      prompt: `Which interval? (${DIRECTION_LABEL[direction]})`,
      choices: config.items.map((id) => ({ id, label: INTERVAL_BY_ID[id].short, sub: INTERVAL_BY_ID[id].name })),
      answer: item,
      clip: intervalClip(root, def.semitones, direction),
      clipFor: (id) => intervalClip(root, INTERVAL_BY_ID[id].semitones, direction),
      explain: `${def.name} — ${def.semitones} semitones. ${def.character}.${song ? ` Think: “${song}”.` : ''}`,
    };
  },
};
