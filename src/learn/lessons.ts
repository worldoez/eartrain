import { arpeggio, block, progression, sequence, single, after, type Clip } from '../audio/events';
import { buildChord, CHORD_BY_ID } from '../theory/chords';
import { CADENCES, cadencePhrase, KEY_CONTEXT, voiceProgression } from '../theory/harmony';
import { INTERVALS } from '../theory/intervals';
import { DEGREE_LABEL, SOLFEGE } from '../theory/notes';
import { buildScale, SCALE_BY_ID } from '../theory/scales';
import type { Category } from '../exercises/types';

export interface ListenItem {
  label: string;
  sub?: string;
  clip: () => Clip;
}

export type Block =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'tip'; text: string }
  | { kind: 'listen'; items: ListenItem[]; columns?: 1 | 2 | 3 }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'piano'; caption: string };

export interface Lesson {
  id: string;
  title: string;
  category: Category | 'start';
  minutes: number;
  summary: string;
  blocks: Block[];
  // The quick check at the end, and where "Practice" goes.
  practice: { exerciseId: string; levelId: string };
}

const C = 60;
const fixedRng = () => 0; // lesson examples always use the first phrase variant

const chordItem = (id: string, inv = 0): ListenItem => ({
  label: CHORD_BY_ID[id].name,
  sub: `C${CHORD_BY_ID[id].symbol}`,
  clip: () => after(block(buildChord(C, id, inv), 1.6), arpeggio(buildChord(C, id, inv), 0.28, 1.2), 0.2),
});

const scaleItem = (id: string): ListenItem => ({
  label: SCALE_BY_ID[id].name,
  sub: SCALE_BY_ID[id].signature ?? SCALE_BY_ID[id].character,
  clip: () => sequence(buildScale(C, id), 0.3, 0.45),
});

export const LESSONS: Lesson[] = [
  {
    id: 'start',
    title: 'How ear training works',
    category: 'start',
    minutes: 3,
    summary: 'What you’ll train, and how to practise so it sticks.',
    practice: { exerciseId: 'pitch-compare', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'Ear training (aural skills) teaches you to recognise what you hear: notes, the distances between them, chords, scales and how music moves in a key. Every music-theory course trains these same skills, roughly in this app’s order.' },
      { kind: 'h', text: 'Relative vs. perfect pitch' },
      { kind: 'p', text: 'Relative pitch is hearing notes in relation to each other (“that jump was a 5th”, “that’s the 3rd of the key”). It’s what musicians use most, and anyone can learn it. Perfect (absolute) pitch is naming a note with no reference. It’s much harder for adults, but practice still sharpens your sense of pitch.' },
      { kind: 'h', text: 'How to practise' },
      { kind: 'tip', text: 'Little and often beats long sessions: 10–15 minutes a day. Sing or hum what you hear before you answer, because your voice anchors your ear. When you miss one, use “Compare” to hear your answer against the right one.' },
      { kind: 'p', text: 'Questions you miss go into Review and come back after 1, 3, 7 and 16 days until you’ve got them. That’s spaced repetition, the most efficient way to remember.' },
      { kind: 'listen', items: [
        { label: 'Low and high', sub: 'C3 → C5', clip: () => sequence([48, 72], 0.9) },
        { label: 'Close together', sub: 'E4 → F4', clip: () => sequence([64, 65], 0.9) },
      ], columns: 2 },
    ],
  },
  {
    id: 'pitch',
    title: 'Notes & the keyboard',
    category: 'pitch',
    minutes: 4,
    summary: 'Note names, half steps, whole steps and octaves.',
    practice: { exerciseId: 'pitch-names', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'Music uses 12 notes that repeat in every octave. White keys are named C D E F G A B. Black keys are sharps (♯, one up) or flats (♭, one down), so the same key can be C♯ or D♭.' },
      { kind: 'piano', caption: 'Tap the keys. Find C: it sits just left of each pair of black keys.' },
      { kind: 'h', text: 'Half steps and whole steps' },
      { kind: 'p', text: 'A half step (semitone) is the smallest distance on the keyboard, from one key to the very next. A whole step is two half steps. E→F and B→C are half steps with no black key between them.' },
      { kind: 'listen', items: [
        { label: 'Half step', sub: 'E → F', clip: () => sequence([64, 65]) },
        { label: 'Whole step', sub: 'C → D', clip: () => sequence([60, 62]) },
        { label: 'Octave', sub: 'C4 → C5', clip: () => sequence([60, 72]) },
      ], columns: 3 },
      { kind: 'tip', text: 'Middle C is C4. Learn to hear it: play it a few times a day and hum it before you check. That’s how perfect-pitch practice starts.' },
    ],
  },
  {
    id: 'intervals',
    title: 'Intervals',
    category: 'intervals',
    minutes: 6,
    summary: 'Every interval from the half step to the octave, each with a song to remember it by.',
    practice: { exerciseId: 'intervals', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'An interval is the distance between two notes. Melodic intervals are played one after the other, ascending or descending. Harmonic intervals are played together. Each has a number (2nd, 3rd…) and a quality: perfect (P), major (M), minor (m), or the tritone (TT).' },
      { kind: 'tip', text: 'Don’t count half steps. Learn each interval’s sound and pair it with the opening of a song you know, then sing the song in your head to check.' },
      { kind: 'h', text: 'Listen: ascending, with reference songs' },
      { kind: 'listen', columns: 2, items: INTERVALS.filter((i) => i.semitones <= 12).map((i) => ({
        label: `${i.short} · ${i.name}`,
        sub: i.songUp,
        clip: () => sequence([C, C + i.semitones], 0.7),
      })) },
      { kind: 'h', text: 'Consonant vs. dissonant' },
      { kind: 'p', text: 'Played together, perfect intervals (P4, P5, P8) sound open and hollow. 3rds and 6ths sound sweet. 2nds, 7ths and the tritone clash. Hearing that “roughness” is the quickest way to sort harmonic intervals.' },
      { kind: 'listen', columns: 3, items: [
        { label: 'Perfect 5th', sub: 'Open', clip: () => block([C, C + 7]) },
        { label: 'Major 3rd', sub: 'Sweet', clip: () => block([C, C + 4]) },
        { label: 'Minor 2nd', sub: 'Clash', clip: () => block([C, C + 1]) },
      ] },
    ],
  },
  {
    id: 'triads',
    title: 'Triads',
    category: 'chords',
    minutes: 5,
    summary: 'Major, minor, diminished, augmented and sus chords.',
    practice: { exerciseId: 'chord-quality', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'A triad is three notes stacked in 3rds: a root, a 3rd and a 5th. The kind of 3rd and 5th gives the chord its quality.' },
      { kind: 'table', head: ['Chord', 'Built from', 'Sound'], rows: [
        ['Major', 'M3 + m3', 'Bright, stable'],
        ['Minor', 'm3 + M3', 'Dark, stable'],
        ['Diminished', 'm3 + m3', 'Tense, squeezed'],
        ['Augmented', 'M3 + M3', 'Floating, unresolved'],
      ] },
      { kind: 'listen', columns: 2, items: ['maj', 'min', 'dim', 'aug'].map((id) => chordItem(id)) },
      { kind: 'tip', text: 'Major and minor differ by one note, the 3rd. Diminished and augmented both sound unstable: diminished feels like it’s shrinking, augmented like it’s stretching.' },
      { kind: 'h', text: 'Sus chords' },
      { kind: 'p', text: 'A suspended chord swaps the 3rd for a 2nd (sus2) or a 4th (sus4). With no 3rd it’s neither major nor minor, so it sounds open, and a sus4 wants to resolve down to the 3rd.' },
      { kind: 'listen', columns: 2, items: ['sus2', 'sus4'].map((id) => chordItem(id)) },
    ],
  },
  {
    id: 'sevenths',
    title: 'Seventh chords',
    category: 'chords',
    minutes: 5,
    summary: 'Add a 7th on top: maj7, dominant 7, m7, half-diminished and diminished 7.',
    practice: { exerciseId: 'chord-quality', levelId: '5' },
    blocks: [
      { kind: 'p', text: 'Stack one more 3rd on a triad and you get a seventh chord. They’re everywhere in jazz, pop and classical harmony. The dominant 7th (V7) is the chord that most strongly wants to resolve home.' },
      { kind: 'table', head: ['Chord', 'Triad + 7th', 'Sound'], rows: [
        ['Major 7th', 'major + M7', 'Lush, dreamy'],
        ['Dominant 7th', 'major + m7', 'Bluesy, restless'],
        ['Minor 7th', 'minor + m7', 'Mellow'],
        ['Half-dim 7th', 'dim + m7', 'Dark, yearning'],
        ['Diminished 7th', 'dim + dim7', 'Suspense'],
      ] },
      { kind: 'listen', columns: 2, items: ['maj7', 'dom7', 'min7', 'm7b5', 'dim7'].map((id) => chordItem(id)) },
      { kind: 'tip', text: 'First decide if the bottom triad is major or minor. Then listen to the top: a major 7th is a half step below the octave and sounds sharp, while a minor 7th sits more comfortably.' },
    ],
  },
  {
    id: 'inversions',
    title: 'Inversions & figured bass',
    category: 'chords',
    minutes: 5,
    summary: 'Which note is in the bass, and how theory classes label it.',
    practice: { exerciseId: 'inversions', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'A chord is inverted when a note other than the root is in the bass. Figured-bass numbers name the intervals above the bass note.' },
      { kind: 'table', head: ['Bass note', 'Triad', 'Seventh chord'], rows: [
        ['Root', '5/3 (root position)', '7'],
        ['3rd', '6 (1st inversion)', '6/5'],
        ['5th', '6/4 (2nd inversion)', '4/3'],
        ['7th', '—', '4/2 (3rd inversion)'],
      ] },
      { kind: 'listen', columns: 3, items: [
        { label: 'Root position', sub: 'C E G', clip: () => block(buildChord(48, 'maj', 0)) },
        { label: '1st inversion', sub: 'E G C', clip: () => block(buildChord(48, 'maj', 1)) },
        { label: '2nd inversion', sub: 'G C E', clip: () => block(buildChord(48, 'maj', 2)) },
      ] },
      { kind: 'tip', text: 'Ignore the chord and sing its lowest note. Then ask whether it’s the root, the 3rd or the 5th. Root position sounds the most solid, and 6/4 sounds like it wants to move.' },
    ],
  },
  {
    id: 'scales',
    title: 'Major & minor scales',
    category: 'scales',
    minutes: 5,
    summary: 'The major scale pattern and the three forms of minor.',
    practice: { exerciseId: 'scales', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'A major scale follows the step pattern W–W–H–W–W–W–H (whole and half steps). Minor scales lower the 3rd, and the three forms of minor differ only in the 6th and 7th.' },
      { kind: 'listen', columns: 2, items: ['major', 'minor', 'harmonicMinor', 'melodicMinor'].map(scaleItem) },
      { kind: 'tip', text: 'Listen to the 3rd note first: it tells you major or minor. Then listen to the top. Harmonic minor has a wide, exotic gap between its 6th and 7th notes.' },
    ],
  },
  {
    id: 'modes',
    title: 'Modes',
    category: 'scales',
    minutes: 6,
    summary: 'Seven modes, each with one characteristic note.',
    practice: { exerciseId: 'scales', levelId: '3' },
    blocks: [
      { kind: 'p', text: 'The church modes use the notes of a major scale starting from a different degree. To recognise one, compare it with plain major or minor and listen for the single note that’s different.' },
      { kind: 'table', head: ['Mode', 'Compared with', 'Characteristic note'], rows: [
        ['Lydian', 'major', '♯4 — dreamy'],
        ['Mixolydian', 'major', '♭7 — rock/folk'],
        ['Dorian', 'minor', '♮6 — hopeful minor'],
        ['Phrygian', 'minor', '♭2 — Spanish'],
        ['Locrian', 'minor', '♭2 and ♭5 — unstable'],
      ] },
      { kind: 'listen', columns: 2, items: ['major', 'lydian', 'mixolydian', 'minor', 'dorian', 'phrygian', 'locrian'].map(scaleItem) },
      { kind: 'h', text: 'Beyond the modes' },
      { kind: 'listen', columns: 2, items: ['majPent', 'minPent', 'blues', 'wholeTone', 'octatonic'].map(scaleItem) },
    ],
  },
  {
    id: 'degrees',
    title: 'Scale degrees & solfège',
    category: 'harmony',
    minutes: 6,
    summary: 'Hear each note’s role in the key: do, re, mi… and the tendency tones.',
    practice: { exerciseId: 'scale-degrees', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'Once a key is set up, every note has a job. Movable-do solfège names notes by their role: do is always the tonic, whatever the key. This is how musicians take melodic dictation and sight-sing.' },
      { kind: 'listen', items: [{ label: 'Set the key', sub: 'I – IV – V7 – I in C major', clip: () => progression(voiceProgression(C, 'major', KEY_CONTEXT), 0.75, 1.4) }], columns: 1 },
      { kind: 'h', text: 'The degrees of the major scale' },
      { kind: 'listen', columns: 3, items: [0, 2, 4, 5, 7, 9, 11].map((s) => ({
        label: SOLFEGE[s],
        sub: DEGREE_LABEL[s],
        clip: () => after(progression(voiceProgression(C, 'major', KEY_CONTEXT), 0.6, 0.9), single(C + s, 1.3), 0.4),
      })) },
      { kind: 'h', text: 'Tendency tones' },
      { kind: 'p', text: 'do, mi and sol are stable and sound at rest. The others lean somewhere: ti pulls up to do, re falls to do, fa leans down to mi, la sinks to sol. Hearing where a note wants to go is how you name it.' },
      { kind: 'listen', columns: 2, items: [
        { label: 'ti → do', sub: 'Leading tone', clip: () => sequence([71, 72], 0.7) },
        { label: 'fa → mi', sub: 'Falls by half step', clip: () => sequence([65, 64], 0.7) },
      ] },
      { kind: 'tip', text: 'After the chords, sing from the mystery note down (or up) to do and count the steps. You’ll soon stop needing to.' },
    ],
  },
  {
    id: 'cadences',
    title: 'Cadences',
    category: 'harmony',
    minutes: 5,
    summary: 'How phrases end: the punctuation of music.',
    practice: { exerciseId: 'cadences', levelId: '1' },
    blocks: [
      { kind: 'p', text: 'A cadence is the chord progression that ends a phrase. Theory exams ask you to name these four (plus perfect vs. imperfect authentic).' },
      { kind: 'listen', columns: 1, items: CADENCES.map((c) => ({
        label: c.name,
        sub: c.description,
        clip: () => {
          const { numerals, soprano } = cadencePhrase(c.id, fixedRng);
          return progression(voiceProgression(C, 'major', numerals, soprano), 0.9, 1.8);
        },
      })) },
      { kind: 'tip', text: 'First ask: does it end at home? If not, ending on V is a half cadence, and a surprising minor chord is deceptive. If it does end at home, a churchy “A-men” is plagal (IV→I), and a strong V→I is authentic. For perfect vs. imperfect, listen to the top note: is it do?' },
    ],
  },
];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
