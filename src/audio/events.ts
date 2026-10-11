// Pure playback scheduling: everything the app plays is a list of note events
// (times in seconds from the start). Kept separate from Web Audio so it is testable.

export interface NoteEvent {
  midi: number;
  time: number;
  dur: number;
  vel?: number;
}

export interface Clip {
  events: NoteEvent[];
  length: number; // seconds until the clip is finished (incl. ring-out)
}

export function single(midi: number, dur = 1.3): Clip {
  return { events: [{ midi, time: 0, dur }], length: dur };
}

export function block(notes: number[], dur = 1.8): Clip {
  return { events: notes.map((midi) => ({ midi, time: 0, dur, vel: 0.85 })), length: dur };
}

export function sequence(notes: number[], gap = 0.6, dur = 0.9): Clip {
  const events = notes.map((midi, i) => ({ midi, time: i * gap, dur }));
  return { events, length: (notes.length - 1) * gap + dur };
}

// Broken chord: notes enter one by one and keep ringing together.
export function arpeggio(notes: number[], gap = 0.3, hold = 1.2): Clip {
  const total = (notes.length - 1) * gap + hold;
  const events = notes.map((midi, i) => ({ midi, time: i * gap, dur: total - i * gap, vel: 0.85 }));
  return { events, length: total };
}

export function progression(chords: number[][], chordDur = 1.0, lastDur = 1.8): Clip {
  const events: NoteEvent[] = [];
  chords.forEach((notes, i) => {
    const isLast = i === chords.length - 1;
    for (const midi of notes) events.push({ midi, time: i * chordDur, dur: isLast ? lastDur : chordDur * 0.95, vel: 0.7 });
  });
  return { events, length: (chords.length - 1) * chordDur + lastDur };
}

// Play `b` after `a`, separated by `gap` seconds.
export function after(a: Clip, b: Clip, gap = 0.5): Clip {
  const offset = a.length + gap;
  return {
    events: [...a.events, ...b.events.map((e) => ({ ...e, time: e.time + offset }))],
    length: offset + b.length,
  };
}
