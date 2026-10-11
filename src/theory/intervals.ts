export interface IntervalDef {
  id: string;
  semitones: number;
  name: string;
  short: string;
  character: string;
  songUp?: string;
  songDown?: string;
}

// Reference songs are the classic memory hooks taught in aural-skills classes.
export const INTERVALS: IntervalDef[] = [
  { id: 'm2', semitones: 1, name: 'Minor 2nd', short: 'm2', character: 'Tense, crunchy — a half step', songUp: 'Jaws theme', songDown: 'Für Elise' },
  { id: 'M2', semitones: 2, name: 'Major 2nd', short: 'M2', character: 'A whole step — the next note of a scale', songUp: 'Happy Birthday', songDown: 'Mary Had a Little Lamb' },
  { id: 'm3', semitones: 3, name: 'Minor 3rd', short: 'm3', character: 'Sad, gentle', songUp: 'Greensleeves', songDown: 'Hey Jude' },
  { id: 'M3', semitones: 4, name: 'Major 3rd', short: 'M3', character: 'Bright, happy', songUp: 'When the Saints Go Marching In', songDown: 'Swing Low, Sweet Chariot' },
  { id: 'P4', semitones: 5, name: 'Perfect 4th', short: 'P4', character: 'Open, “announcing”', songUp: 'Here Comes the Bride', songDown: 'Eine kleine Nachtmusik' },
  { id: 'TT', semitones: 6, name: 'Tritone', short: 'TT', character: 'Unstable, eerie — splits the octave in half', songUp: 'The Simpsons', songDown: 'Black Sabbath' },
  { id: 'P5', semitones: 7, name: 'Perfect 5th', short: 'P5', character: 'Hollow, powerful', songUp: 'Twinkle Twinkle / Star Wars', songDown: 'The Flintstones' },
  { id: 'm6', semitones: 8, name: 'Minor 6th', short: 'm6', character: 'Bittersweet, yearning', songUp: 'The Entertainer', songDown: 'Love Story theme' },
  { id: 'M6', semitones: 9, name: 'Major 6th', short: 'M6', character: 'Warm, sweet', songUp: 'My Bonnie / NBC chime', songDown: 'Nobody Knows the Trouble I’ve Seen' },
  { id: 'm7', semitones: 10, name: 'Minor 7th', short: 'm7', character: 'Bluesy, unresolved', songUp: 'Star Trek (original theme)', songDown: 'Watermelon Man' },
  { id: 'M7', semitones: 11, name: 'Major 7th', short: 'M7', character: 'Sharp, almost an octave', songUp: 'Take On Me (chorus)', songDown: 'I Love You (Cole Porter)' },
  { id: 'P8', semitones: 12, name: 'Octave', short: 'P8', character: 'Same note, higher', songUp: 'Somewhere Over the Rainbow', songDown: 'Willow Weep for Me' },
  { id: 'm9', semitones: 13, name: 'Minor 9th', short: 'm9', character: 'Octave + minor 2nd' },
  { id: 'M9', semitones: 14, name: 'Major 9th', short: 'M9', character: 'Octave + major 2nd' },
  { id: 'm10', semitones: 15, name: 'Minor 10th', short: 'm10', character: 'Octave + minor 3rd' },
  { id: 'M10', semitones: 16, name: 'Major 10th', short: 'M10', character: 'Octave + major 3rd' },
  { id: 'P11', semitones: 17, name: 'Perfect 11th', short: 'P11', character: 'Octave + perfect 4th' },
  { id: 'P12', semitones: 19, name: 'Perfect 12th', short: 'P12', character: 'Octave + perfect 5th' },
];

export const INTERVAL_BY_ID: Record<string, IntervalDef> = Object.fromEntries(INTERVALS.map((i) => [i.id, i]));

export const SIMPLE_INTERVAL_IDS = INTERVALS.filter((i) => i.semitones <= 12).map((i) => i.id);
export const COMPOUND_INTERVAL_IDS = INTERVALS.filter((i) => i.semitones > 12).map((i) => i.id);
