import { progression, single, after } from '../audio/events';
import { CADENCES, CADENCE_BY_ID, cadencePhrase, displayNumeral, KEY_CONTEXT, voiceProgression, type KeyMode } from '../theory/harmony';
import { DEGREE_LABEL, PITCH_CLASS_NAMES, pitchClass, SOLFEGE } from '../theory/notes';
import { pick, pickItem, randInt } from './random';
import type { ExerciseDef } from './types';

const DEGREE_TIPS: Record<number, string> = {
  0: 'Home — completely at rest.',
  2: 'Wants to step down to do.',
  4: 'Sweet and stable — the colour of a major key.',
  5: 'Leans down toward mi.',
  7: 'Strong and stable — the dominant.',
  9: 'Wistful; tends to fall to sol.',
  11: 'The leading tone — pulls hard up to do.',
  3: 'The minor 3rd — the colour of a minor key.',
  8: 'Dark; pulls down to sol.',
  10: 'Relaxed, bluesy; falls to la or le.',
  1: 'Very tense; slides down to do.',
  6: 'Raised 4th — leans up into sol.',
};

function degreeChoice(id: string) {
  const s = Number(id);
  return { id, label: SOLFEGE[s], sub: DEGREE_LABEL[s] };
}

const ALL_DEGREES = Array.from({ length: 12 }, (_, i) => String(i));

export const scaleDegrees: ExerciseDef = {
  id: 'scale-degrees',
  title: 'Scale Degrees',
  category: 'harmony',
  blurb: 'Hear a key, then a note — name it in solfège. The core of functional ear training and dictation.',
  lessonId: 'degrees',
  groups: [
    { id: 'items', label: 'Degrees', multi: true, min: 2, options: ALL_DEGREES.map((id) => degreeChoice(id)) },
    {
      id: 'key', label: 'Key', multi: true, min: 1, options: [
        { id: 'major', label: 'Major keys' },
        { id: 'minor', label: 'Minor keys' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Do, mi, sol', summary: 'The tonic triad', config: { items: ['0', '4', '7'], key: ['major'] } },
    { id: '2', name: 'Do to sol', summary: 'First five notes of the scale', config: { items: ['0', '2', '4', '5', '7'], key: ['major'] } },
    { id: '3', name: 'Major scale', summary: 'All seven degrees in major', config: { items: ['0', '2', '4', '5', '7', '9', '11'], key: ['major'] } },
    { id: '4', name: 'Minor scale', summary: 'do re me fa sol le te', config: { items: ['0', '2', '3', '5', '7', '8', '10'], key: ['minor'] } },
    { id: '5', name: 'Chromatic', summary: 'All 12 degrees, major and minor keys', config: { items: ALL_DEGREES, key: ['major', 'minor'] } },
  ],
  itemLabel: (item) => `${SOLFEGE[Number(item)]} (${DEGREE_LABEL[Number(item)]})`,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const mode = pick((config.key?.length ? config.key : ['major']) as KeyMode[], rng);
    const tonic = randInt(57, 66, rng);
    const context = progression(voiceProgression(tonic, mode, KEY_CONTEXT), 0.75, 1.2);
    const midi = tonic + Number(item);
    const keyName = `${PITCH_CLASS_NAMES[pitchClass(tonic)]} ${mode}`;
    return {
      exerciseId: 'scale-degrees',
      item,
      prompt: 'After the chords, which scale degree is the single note?',
      choices: config.items.map(degreeChoice),
      answer: item,
      clip: after(context, single(midi, 1.4), 0.5),
      contextClip: context,
      clipFor: (id) => single(tonic + Number(id), 1.4),
      explain: `${SOLFEGE[Number(item)]} (${DEGREE_LABEL[Number(item)]}) in ${keyName}. ${DEGREE_TIPS[Number(item)]}`,
    };
  },
};

export const cadences: ExerciseDef = {
  id: 'cadences',
  title: 'Cadences',
  category: 'harmony',
  blurb: 'How does the phrase end? Authentic, half, plagal and deceptive cadences in four-part harmony.',
  lessonId: 'cadences',
  groups: [
    { id: 'items', label: 'Cadences', multi: true, min: 2, options: CADENCES.map((c) => ({ id: c.id, label: c.name, sub: c.short })) },
    {
      id: 'key', label: 'Key', multi: true, min: 1, options: [
        { id: 'major', label: 'Major keys' },
        { id: 'minor', label: 'Minor keys' },
      ],
    },
  ],
  levels: [
    { id: '1', name: 'Final or not?', summary: 'Authentic vs half cadence', config: { items: ['PAC', 'HC'], key: ['major'] } },
    { id: '2', name: 'Plagal', summary: 'Adds the “Amen” cadence', config: { items: ['PAC', 'HC', 'PC'], key: ['major'] } },
    { id: '3', name: 'Deceptive', summary: 'Adds V → vi', config: { items: ['PAC', 'HC', 'PC', 'DC'], key: ['major'] } },
    { id: '4', name: 'Perfect vs imperfect', summary: 'All five, listen to the top voice', config: { items: ['PAC', 'IAC', 'HC', 'PC', 'DC'], key: ['major'] } },
    { id: '5', name: 'Minor keys', summary: 'All cadences, major and minor', config: { items: ['PAC', 'IAC', 'HC', 'PC', 'DC'], key: ['major', 'minor'] } },
  ],
  itemLabel: (item) => CADENCE_BY_ID[item]?.name ?? item,
  generate(config, rng, opts) {
    const item = pickItem(config.items, rng, opts);
    const mode = pick((config.key?.length ? config.key : ['major']) as KeyMode[], rng);
    const tonic = randInt(57, 66, rng);
    const phraseClip = (id: string) => {
      const { numerals, soprano } = cadencePhrase(id, rng);
      return { clip: progression(voiceProgression(tonic, mode, numerals, soprano), 0.95, 1.8), numerals };
    };
    const { clip, numerals } = phraseClip(item);
    const def = CADENCE_BY_ID[item];
    return {
      exerciseId: 'cadences',
      item,
      prompt: 'How does this phrase end?',
      choices: config.items.map((id) => ({ id, label: CADENCE_BY_ID[id].name, sub: CADENCE_BY_ID[id].short })),
      answer: item,
      clip,
      clipFor: (id) => phraseClip(id).clip,
      explain: `${def.name}: ${numerals.map((n) => displayNumeral(mode, n)).join(' – ')} in ${PITCH_CLASS_NAMES[pitchClass(tonic)]} ${mode}. ${def.description}`,
    };
  },
};
