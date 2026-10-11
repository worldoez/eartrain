import { describe, expect, it } from 'vitest';
import { arpeggio, block, progression, sequence, after } from '../src/audio/events';
import { EXERCISES, levelConfig, reviewConfig } from '../src/exercises';
import { mulberry32, pickItem } from '../src/exercises/random';

describe('clips', () => {
  it('sequence spaces notes and reports its length', () => {
    const c = sequence([60, 64], 0.5, 1);
    expect(c.events.map((e) => e.time)).toEqual([0, 0.5]);
    expect(c.length).toBe(1.5);
  });
  it('block plays together, arpeggio rings to the end', () => {
    expect(block([60, 64, 67]).events.every((e) => e.time === 0)).toBe(true);
    const a = arpeggio([60, 64, 67], 0.3, 1);
    for (const e of a.events) expect(e.time + e.dur).toBeCloseTo(a.length);
  });
  it('after() offsets the second clip', () => {
    const c = after(sequence([60], 1, 1), sequence([62], 1, 1), 0.5);
    expect(c.events[1].time).toBe(1.5);
    expect(c.length).toBe(2.5);
    expect(progression([[48, 60], [43, 59]], 1, 2).length).toBe(3);
  });
});

describe('every exercise, every level', () => {
  for (const ex of EXERCISES) {
    it(`${ex.id} generates valid questions`, () => {
      const rng = mulberry32(42);
      for (const level of ex.levels) {
        const config = levelConfig(ex, level.id);
        // level items must exist in the setup options
        const ids = new Set(ex.groups.find((g) => g.id === 'items')!.options.map((o) => o.id));
        for (const item of config.items) expect(ids.has(item)).toBe(true);

        let prev: string | undefined;
        for (let i = 0; i < 40; i++) {
          const q = ex.generate(config, rng, { avoid: prev });
          expect(q.exerciseId).toBe(ex.id);
          expect(q.choices.map((c) => c.id)).toContain(q.answer);
          expect(q.clip.events.length).toBeGreaterThan(0);
          expect(q.clip.length).toBeGreaterThan(0);
          for (const e of q.clip.events) {
            expect(Number.isInteger(e.midi)).toBe(true);
            expect(e.midi).toBeGreaterThanOrEqual(36);
            expect(e.midi).toBeLessThanOrEqual(96);
          }
          expect(q.explain.length).toBeGreaterThan(5);
          if (config.items.length > 1 && prev && ex.id !== 'pitch-compare') expect(q.item).not.toBe(prev);
          for (const c of q.choices) {
            const alt = q.clipFor?.(c.id);
            if (alt) expect(alt.events.length).toBeGreaterThan(0);
          }
          prev = q.item;
        }
      }
    });

    it(`${ex.id} can review any item`, () => {
      const rng = mulberry32(7);
      const items = ex.groups.find((g) => g.id === 'items')!.options.map((o) => o.id);
      for (const item of items) {
        const q = ex.generate(reviewConfig(ex, item), rng, { force: item });
        expect(q.item).toBe(item);
        expect(q.choices.map((c) => c.id)).toContain(q.answer);
        expect(q.choices.length).toBeGreaterThan(1);
      }
    });
  }
});

describe('specific answers', () => {
  it('interval questions play the right distance', () => {
    const ex = EXERCISES.find((e) => e.id === 'intervals')!;
    const rng = mulberry32(5);
    for (let i = 0; i < 30; i++) {
      const q = ex.generate({ items: ['M3'], direction: ['up'] }, rng);
      const [a, b] = q.clip.events.map((e) => e.midi);
      expect(b - a).toBe(4);
    }
  });

  it('scale-degree questions end with the asked degree above the tonic', () => {
    const ex = EXERCISES.find((e) => e.id === 'scale-degrees')!;
    const rng = mulberry32(9);
    const q = ex.generate({ items: ['7'], key: ['major'] }, rng);
    const last = q.clip.events[q.clip.events.length - 1].midi;
    const firstBass = q.clip.events[0].midi; // tonic in the bass of the first chord
    expect((last - firstBass) % 12).toBe(7);
  });

  it('pickItem avoids repeats and honours force', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 20; i++) expect(pickItem(['a', 'b'], rng, { avoid: 'a' })).toBe('b');
    expect(pickItem(['a', 'b'], rng, { force: 'z' })).toBe('z');
  });
});
