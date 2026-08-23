import { HighScores } from '../types';

export function scoreTest(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function updateHighScores(hs: HighScores, key: string, score: number): HighScores {
  const prevConfig = hs.byConfig[key] ?? 0;
  return {
    byConfig: { ...hs.byConfig, [key]: Math.max(prevConfig, score) },
    global: Math.max(hs.global, score),
  };
}
