import { todayKey, recordAttempt } from '../src/utils/history';

describe('history rollup', () => {
  it('todayKey is YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 7, 23))).toBe('2026-08-23');
  });
  it('records an attempt into today entry', () => {
    const h = {};
    const out = recordAttempt(h, { correct: true, isTest: false, seconds: 4 }, () => '2026-08-23');
    const e = out['2026-08-23'];
    expect(e.attempts).toBe(1);
    expect(e.correct).toBe(1);
    expect(e.secondsPracticed).toBe(4);
  });
  it('tracks best test score', () => {
    let h = recordAttempt({}, { correct: true, isTest: true, testScore: 80, seconds: 5 }, () => '2026-08-23');
    h = recordAttempt(h, { correct: false, isTest: true, testScore: 90, seconds: 5 }, () => '2026-08-23');
    expect(h['2026-08-23'].bestTestScore).toBe(90);
    expect(h['2026-08-23'].attempts).toBe(2);
  });
});
