import { HistoryEntry } from '../types';

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function recordAttempt(
  history: Record<string, HistoryEntry>,
  ev: { correct: boolean; isTest: boolean; testScore?: number; seconds: number },
  keyFn: () => string = todayKey,
): Record<string, HistoryEntry> {
  const key = keyFn();
  const prev = history[key] ?? { date: key, attempts: 0, correct: 0, bestTestScore: 0, secondsPracticed: 0 };
  const next: HistoryEntry = {
    date: key,
    attempts: prev.attempts + 1,
    correct: prev.correct + (ev.correct ? 1 : 0),
    bestTestScore: Math.max(prev.bestTestScore, ev.isTest ? (ev.testScore ?? 0) : prev.bestTestScore),
    secondsPracticed: prev.secondsPracticed + ev.seconds,
  };
  return { ...history, [key]: next };
}
