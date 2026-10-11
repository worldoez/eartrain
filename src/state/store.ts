import { useSyncExternalStore } from 'react';
import { audio, type Timbre } from '../audio/engine';
import { emptyProgress, type Progress } from './progress';

export interface Settings {
  timbre: Timbre;
  volume: number;
  theme: 'system' | 'light' | 'dark';
  sessionLength: number;
  autoAdvance: boolean;
  dailyGoal: number; // questions per day
}

export const defaultSettings: Settings = {
  timbre: 'piano',
  volume: 0.8,
  theme: 'system',
  sessionLength: 15,
  autoAdvance: true,
  dailyGoal: 40,
};

interface State {
  settings: Settings;
  progress: Progress;
}

const KEY = 'eartrain.v2';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      return {
        settings: { ...defaultSettings, ...parsed.settings },
        progress: { ...emptyProgress(), ...parsed.progress },
      };
    }
  } catch {
    /* storage unavailable or corrupt — start fresh */
  }
  return { settings: defaultSettings, progress: emptyProgress() };
}

let state = load();
const listeners = new Set<() => void>();

function applySideEffects(s: Settings) {
  audio.timbre = s.timbre;
  audio.setVolume(s.volume);
  const root = document.documentElement;
  if (s.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', s.theme);
}
applySideEffects(state.settings);

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l());
}

export function updateSettings(patch: Partial<Settings>) {
  const settings = { ...state.settings, ...patch };
  applySideEffects(settings);
  commit({ ...state, settings });
}

export function updateProgress(fn: (p: Progress) => Progress) {
  commit({ ...state, progress: fn(state.progress) });
}

export function exportData(): string {
  return JSON.stringify(state, null, 2);
}

export function importData(json: string) {
  const parsed = JSON.parse(json) as Partial<State>;
  if (!parsed.progress || !parsed.settings) throw new Error('Not an EarTrain backup');
  const next = { settings: { ...defaultSettings, ...parsed.settings }, progress: { ...emptyProgress(), ...parsed.progress } };
  applySideEffects(next.settings);
  commit(next);
}

export function resetProgress() {
  commit({ ...state, progress: emptyProgress() });
}

export function getProgress(): Progress {
  return state.progress;
}

export function getSettings(): Settings {
  return state.settings;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => state.settings);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state.progress);
}
