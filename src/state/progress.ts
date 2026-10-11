// Pure progress bookkeeping: stats, streaks, XP, spaced-repetition review.
// All functions return new objects so they work with React state.

export interface ItemStat {
  seen: number;
  correct: number;
  recent: number[]; // last 10 results, 1 = correct
}

export interface ReviewItem {
  exerciseId: string;
  item: string;
  due: number; // epoch ms
  box: number; // Leitner box: 0 = due again soon, higher = longer gaps
}

export interface SessionRecord {
  at: number;
  exerciseId: string; // 'mix' / 'review' for mixed sessions
  levelId: string;
  total: number;
  correct: number;
  seconds: number;
}

export interface DayStat {
  answered: number;
  correct: number;
}

export interface Progress {
  xp: number;
  streak: { count: number; lastDay: string | null };
  days: Record<string, DayStat>;
  stats: Record<string, Record<string, ItemStat>>; // exerciseId -> item -> stat
  levelBest: Record<string, number>; // `${exerciseId}:${levelId}` -> best %
  lastLevel: Record<string, string>; // exerciseId -> last level played
  lessonsDone: string[];
  review: ReviewItem[];
  sessions: SessionRecord[];
}

export const emptyProgress = (): Progress => ({
  xp: 0,
  streak: { count: 0, lastDay: null },
  days: {},
  stats: {},
  levelBest: {},
  lastLevel: {},
  lessonsDone: [],
  review: [],
  sessions: [],
});

const DAY = 24 * 60 * 60 * 1000;
// Leitner gaps in days for boxes 0..4. Mastered after box 4.
export const BOX_GAPS = [0, 1, 3, 7, 16];

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prevDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1).getTime());
}

export function recordAnswer(p: Progress, exerciseId: string, item: string, correct: boolean, now: number, inReview = false): Progress {
  const exStats = { ...(p.stats[exerciseId] ?? {}) };
  const prev = exStats[item] ?? { seen: 0, correct: 0, recent: [] };
  exStats[item] = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    recent: [...prev.recent, correct ? 1 : 0].slice(-10),
  };

  const today = dayKey(now);
  const day = p.days[today] ?? { answered: 0, correct: 0 };

  let streak = p.streak;
  if (streak.lastDay !== today) {
    streak = { count: streak.lastDay === prevDayKey(today) ? streak.count + 1 : 1, lastDay: today };
  }

  return {
    ...p,
    xp: p.xp + (correct ? 10 : 2),
    streak,
    days: { ...p.days, [today]: { answered: day.answered + 1, correct: day.correct + (correct ? 1 : 0) } },
    stats: { ...p.stats, [exerciseId]: exStats },
    review: updateReview(p.review, exerciseId, item, correct, now, inReview),
  };
}

// Wrong answers enter the review queue; answering a due item correctly moves
// it to a longer gap, and it leaves the queue after the last box.
export function updateReview(queue: ReviewItem[], exerciseId: string, item: string, correct: boolean, now: number, inReview: boolean): ReviewItem[] {
  const idx = queue.findIndex((r) => r.exerciseId === exerciseId && r.item === item);
  if (!correct) {
    const entry: ReviewItem = { exerciseId, item, due: now, box: 0 };
    return idx === -1 ? [...queue, entry] : queue.map((r, i) => (i === idx ? entry : r));
  }
  if (idx === -1) return queue;
  const r = queue[idx];
  // Only count a correct answer as a review when the item was due (or asked in review mode).
  if (!inReview && r.due > now) return queue;
  const box = r.box + 1;
  if (box >= BOX_GAPS.length) return queue.filter((_, i) => i !== idx);
  return queue.map((x, i) => (i === idx ? { ...x, box, due: now + BOX_GAPS[box] * DAY } : x));
}

export function dueReviews(p: Progress, now: number): ReviewItem[] {
  return p.review.filter((r) => r.due <= now);
}

// Accuracy over recent answers for the given items (0..1), or null if unplayed.
export function mastery(p: Progress, exerciseId: string, items?: string[]): number | null {
  const ex = p.stats[exerciseId];
  if (!ex) return null;
  const keys = items ?? Object.keys(ex);
  let n = 0;
  let c = 0;
  for (const k of keys) {
    const s = ex[k];
    if (!s) continue;
    n += s.recent.length;
    c += s.recent.reduce((a, b) => a + b, 0);
  }
  return n ? c / n : null;
}

export function starsFor(pct: number): number {
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 50) return 1;
  return 0;
}

export function recordSession(p: Progress, s: SessionRecord): Progress {
  const key = `${s.exerciseId}:${s.levelId}`;
  const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  return {
    ...p,
    sessions: [...p.sessions, s].slice(-300),
    levelBest: { ...p.levelBest, [key]: Math.max(p.levelBest[key] ?? 0, pct) },
    lastLevel: s.exerciseId === 'mix' || s.exerciseId === 'review' ? p.lastLevel : { ...p.lastLevel, [s.exerciseId]: s.levelId },
  };
}

export function weakestItems(p: Progress, minSeen = 3): { exerciseId: string; item: string; acc: number; seen: number }[] {
  const out: { exerciseId: string; item: string; acc: number; seen: number }[] = [];
  for (const [exerciseId, items] of Object.entries(p.stats)) {
    for (const [item, s] of Object.entries(items)) {
      if (s.seen < minSeen) continue;
      const acc = s.recent.reduce((a, b) => a + b, 0) / s.recent.length;
      out.push({ exerciseId, item, acc, seen: s.seen });
    }
  }
  return out.sort((a, b) => a.acc - b.acc);
}
