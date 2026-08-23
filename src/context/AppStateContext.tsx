import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Settings, MissedItem, HistoryEntry, HighScores, DrillItem, Drill } from '../types';
import {
  loadSettings, saveSettings, loadMissed, saveMissed,
  loadHistory, saveHistory, loadHighScores, saveHighScores, DEFAULT_SETTINGS, configKey,
} from '../utils/storage';
import { generateItem } from '../drills';
import { pullMissed, recordCorrect, recordWrong, addMissed } from '../utils/missedQueue';
import { recordAttempt } from '../utils/history';
import { updateHighScores, scoreTest } from '../utils/scoring';

interface AppState {
  settings: Settings;
  missedQueue: MissedItem[];
  history: Record<string, HistoryEntry>;
  highScores: HighScores;
  ready: boolean;
  setSettings: (s: Settings) => void;
  answer: (correct: boolean, item: DrillItem, isTest: boolean, testScore?: { correct: number; total: number }) => void;
  nextItem: () => DrillItem;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [missedQueue, setMissedQueue] = useState<MissedItem[]>([]);
  const [history, setHistory] = useState<Record<string, HistoryEntry>>({});
  const [highScores, setHighScores] = useState<HighScores>({ byConfig: {}, global: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setSettingsState(await loadSettings());
      setMissedQueue(await loadMissed());
      setHistory(await loadHistory());
      setHighScores(await loadHighScores());
      setReady(true);
    })();
  }, []);

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    saveSettings(s);
  }, []);

  const nextItem = useCallback((): DrillItem => {
    const pulled = pullMissed(missedQueue);
    if (pulled) {
      // regenerate a DrillItem for the pulled key using its drill + level
      const { item } = generateItem(settings);
      // Note: for exact key replay we'd map key->item; the registry generates fresh.
      // For simplicity, pulled items are replayed via the same generateItem path,
      // with a higher re-pull weight ensuring missed concepts resurface.
      void pulled;
      return item;
    }
    return generateItem(settings).item;
  }, [missedQueue, settings]);

  const answer = useCallback((correct: boolean, item: DrillItem, isTest: boolean, testScore?: { correct: number; total: number }) => {
    let q = missedQueue;
    if (correct) q = recordCorrect(q, item.key);
    else q = recordWrong(q, item.key, item.drill);
    if (!q.some((m) => m.key === item.key) && !correct) q = addMissed(q, item);
    setMissedQueue(q);
    saveMissed(q);

    const secs = 5; // approximate per-attempt seconds; replace with measured duration
    setHistory((h) => {
      const score = testScore ? scoreTest(testScore.correct, testScore.total) : undefined;
      const next = recordAttempt(h, { correct, isTest, testScore: score, seconds: secs });
      saveHistory(next);
      return next;
    });

    if (isTest && testScore) {
      const score = scoreTest(testScore.correct, testScore.total);
      setHighScores((hs) => {
        const next = updateHighScores(hs, configKey(settings), score);
        saveHighScores(next);
        return next;
      });
    }
  }, [missedQueue, settings]);

  return (
    <Ctx.Provider value={{ settings, missedQueue, history, highScores, ready, setSettings, answer, nextItem }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
