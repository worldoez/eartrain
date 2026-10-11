import { describe, expect, it } from 'vitest';
import { BOX_GAPS, dayKey, dueReviews, emptyProgress, mastery, recordAnswer, recordSession, starsFor, weakestItems } from '../src/state/progress';

const T0 = new Date(2026, 9, 6, 12).getTime();
const DAY = 864e5;

describe('recordAnswer', () => {
  it('tracks stats, xp and daily totals', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'intervals', 'M3', true, T0);
    p = recordAnswer(p, 'intervals', 'M3', false, T0);
    expect(p.stats.intervals.M3).toEqual({ seen: 2, correct: 1, recent: [1, 0] });
    expect(p.xp).toBe(12);
    expect(p.days[dayKey(T0)]).toEqual({ answered: 2, correct: 1 });
    expect(mastery(p, 'intervals')).toBe(0.5);
    expect(mastery(p, 'chords')).toBeNull();
  });

  it('keeps only the last 10 results', () => {
    let p = emptyProgress();
    for (let i = 0; i < 15; i++) p = recordAnswer(p, 'x', 'a', i >= 5, T0);
    expect(p.stats.x.a.recent).toHaveLength(10);
    expect(mastery(p, 'x')).toBe(1);
  });

  it('counts consecutive-day streaks and resets after a gap', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'x', 'a', true, T0);
    p = recordAnswer(p, 'x', 'a', true, T0 + 1000);
    expect(p.streak.count).toBe(1);
    p = recordAnswer(p, 'x', 'a', true, T0 + DAY);
    expect(p.streak.count).toBe(2);
    p = recordAnswer(p, 'x', 'a', true, T0 + 3 * DAY);
    expect(p.streak.count).toBe(1);
  });
});

describe('spaced review', () => {
  it('adds misses, schedules successes, and retires mastered items', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'intervals', 'TT', false, T0);
    expect(dueReviews(p, T0)).toHaveLength(1);

    let t = T0;
    for (let box = 1; box < BOX_GAPS.length; box++) {
      p = recordAnswer(p, 'intervals', 'TT', true, t, true);
      expect(p.review[0].box).toBe(box);
      expect(dueReviews(p, t)).toHaveLength(0);
      t += BOX_GAPS[box] * DAY;
      expect(dueReviews(p, t)).toHaveLength(1);
    }
    p = recordAnswer(p, 'intervals', 'TT', true, t, true);
    expect(p.review).toHaveLength(0);
  });

  it('a miss sends an item back to the start', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', 'x', false, T0);
    p = recordAnswer(p, 'a', 'x', true, T0, true);
    p = recordAnswer(p, 'a', 'x', false, T0 + 10);
    expect(p.review[0]).toMatchObject({ box: 0, due: T0 + 10 });
  });

  it('correct answers in normal practice do not advance items that are not due', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'a', 'x', false, T0);
    p = recordAnswer(p, 'a', 'x', true, T0, true); // box 1, due tomorrow
    p = recordAnswer(p, 'a', 'x', true, T0 + 100); // not due, not review
    expect(p.review[0].box).toBe(1);
  });
});

describe('sessions and summaries', () => {
  it('records best scores and last level', () => {
    let p = emptyProgress();
    p = recordSession(p, { at: T0, exerciseId: 'scales', levelId: '2', total: 10, correct: 9, seconds: 60 });
    p = recordSession(p, { at: T0, exerciseId: 'scales', levelId: '2', total: 10, correct: 5, seconds: 60 });
    expect(p.levelBest['scales:2']).toBe(90);
    expect(p.lastLevel.scales).toBe('2');
    p = recordSession(p, { at: T0, exerciseId: 'mix', levelId: 'mix', total: 10, correct: 5, seconds: 60 });
    expect(p.lastLevel.mix).toBeUndefined();
  });

  it('stars and weakest items', () => {
    expect([starsFor(95), starsFor(80), starsFor(60), starsFor(20)]).toEqual([3, 2, 1, 0]);
    let p = emptyProgress();
    for (let i = 0; i < 4; i++) {
      p = recordAnswer(p, 'e', 'good', true, T0);
      p = recordAnswer(p, 'e', 'bad', i === 0, T0);
    }
    expect(weakestItems(p)[0]).toMatchObject({ item: 'bad', acc: 0.25 });
  });
});
