import { DrillItem, MissedItem, Drill } from '../types';

const PULL_PROBABILITY = 0.4;
const NEEDED_STREAK = 2;

export function shouldPullFromMissed(rng: () => number = Math.random): boolean {
  return rng() < PULL_PROBABILITY;
}

export function addMissed(queue: MissedItem[], item: DrillItem): MissedItem[] {
  if (queue.some((m) => m.key === item.key)) return queue;
  return [...queue, { key: item.key, drill: item.drill, correctStreak: 0, neededStreak: NEEDED_STREAK }];
}

export function recordCorrect(queue: MissedItem[], key: string): MissedItem[] {
  return queue
    .map((m) => (m.key === key ? { ...m, correctStreak: m.correctStreak + 1 } : m))
    .filter((m) => m.correctStreak < m.neededStreak); // mastered items removed
}

export function recordWrong(queue: MissedItem[], key: string, drill: Drill): MissedItem[] {
  const exists = queue.some((m) => m.key === key);
  if (!exists) {
    return [...queue, { key, drill, correctStreak: 0, neededStreak: NEEDED_STREAK }];
  }
  return queue.map((m) => (m.key === key ? { ...m, correctStreak: 0 } : m));
}

// weighted-random pick: weight = 1 / (correctStreak + 1)
export function pullMissed(queue: MissedItem[], rng: () => number = Math.random): MissedItem | null {
  if (!shouldPullFromMissed(rng) || queue.length === 0) return null;
  const weights = queue.map((m) => 1 / (m.correctStreak + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < queue.length; i++) {
    r -= weights[i];
    if (r <= 0) return queue[i];
  }
  return queue[queue.length - 1];
}
