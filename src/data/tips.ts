import { DrillItem } from '../types';

type TipTable = Record<string, { name: string; tip: string }>;

const INTERVAL_TIPS: TipTable = {
  m2:  { name: 'm2',  tip: "Jaws theme (shark). Tense, dissonant." },
  M2:  { name: 'M2',  tip: "Happy Birthday ('Happy' to 'Birth-')." },
  m3:  { name: 'm3',  tip: "Greensleeves / Hey Jude opening. Sad, minor." },
  M3:  { name: 'M3',  tip: "Oh When the Saints ('Oh' to 'when')." },
  P4:  { name: 'P4',  tip: "Here Comes the Bride / Amazing Grace." },
  b5:  { name: 'b5',  tip: "The Simpsons theme / Maria (West Side Story)." },
  P5:  { name: 'P5',  tip: "Star Wars opening theme. Strong, open." },
  m6:  { name: 'm6',  tip: "The Entertainer (3rd-4th note)." },
  M6:  { name: 'M6',  tip: "NBC chime / My Bonnie Lies." },
  m7:  { name: 'm7',  tip: "Star Trek theme opening." },
  M7:  { name: 'M7',  tip: "Take On Me (the 'on' leap)." },
  P8:  { name: 'P8',  tip: "Somewhere Over the Rainbow ('Some' to 'where')." },
};

const CHORD_TIPS: TipTable = {
  maj:  { name: 'maj',  tip: "Bright, happy, stable. Major triad." },
  min:  { name: 'min',  tip: "Sad, dark, somber. Minor triad." },
  dim:  { name: 'dim',  tip: "Tense, unsettled, cinematic. Diminished." },
  aug:  { name: 'aug',  tip: "Dreamy, floating, unresolved. Augmented." },
  maj7: { name: 'maj7', tip: "Lush, jazzy, mellow. Major 7." },
  dom7: { name: 'dom7', tip: "Bluesy, tense, wants to resolve. Dominant 7." },
  m7:   { name: 'm7',   tip: "Smooth, soulful, jazzy. Minor 7." },
  m7b5: { name: 'm7b5', tip: "Half-diminished; dark, ii of minor ii-V-i." },
  dim7: { name: 'dim7', tip: "Symmetrical, suspenseful, cinematic." },
};

const SCALE_TIPS: TipTable = {
  major:         { name: 'major',         tip: "Do-re-mi; bright, familiar major scale." },
  naturalMinor:  { name: 'naturalMinor',  tip: "Aeolian; sad, plain minor." },
  harmonicMinor: { name: 'harmonicMinor', tip: "Minor with a raised 7th — 'exotic' leading tone." },
  melodicMinor:  { name: 'melodicMinor',  tip: "Minor with raised 6 & 7 ascending; smoother." },
  ionian:        { name: 'ionian',        tip: "Same as major." },
  dorian:        { name: 'dorian',        tip: "Minor with a raised 6th — jazzy, modal." },
  phrygian:      { name: 'phrygian',      tip: "Minor with a flat 2 — Spanish/Middle-Eastern flavor." },
  lydian:        { name: 'lydian',        tip: "Major with a raised 4th — dreamy, floating." },
  mixolydian:    { name: 'mixolydian',    tip: "Major with a flat 7th — rock/blues flavor." },
  aeolian:       { name: 'aeolian',       tip: "Same as natural minor." },
  locrian:       { name: 'locrian',       tip: "Diminished, unstable, rare." },
  wholeTone:     { name: 'wholeTone',     tip: "All whole steps — eerie, weightless." },
  diminished:    { name: 'diminished',    tip: "Alternating whole/half — suspenseful, symmetrical." },
  chromatic:     { name: 'chromatic',     tip: "Every half step; no tonal center." },
};

const TABLES: Record<string, TipTable> = {
  intervals: INTERVAL_TIPS,
  chords: CHORD_TIPS,
  scales: SCALE_TIPS,
};

export function getTip(item: DrillItem): { name: string; tip: string } {
  if (item.drill === 'pitch') {
    return { name: item.display, tip: `Sing the note up or down from a known reference (e.g. middle C).` };
  }
  const table = TABLES[item.drill];
  return table[item.display] ?? { name: item.display, tip: 'Listen for the overall character and color.' };
}
