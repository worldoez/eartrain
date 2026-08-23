import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, MissedItem, HistoryEntry, HighScores } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  drills: {
    pitch:     { enabled: true,  level: 'easy' },
    intervals: { enabled: false, level: 'easy' },
    chords:    { enabled: false, level: 'easy' },
    scales:    { enabled: false, level: 'easy' },
  },
  inputMethod: 'hybrid',
  referenceTone: true,
  testCount: 20,
  testMinutes: 5,
};

const KEYS = {
  settings: 'eartrain:settings',
  missed: 'eartrain:missed',
  history: 'eartrain:history',
  highScores: 'eartrain:highscores',
};

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}
export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(s));
}
export async function loadMissed(): Promise<MissedItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.missed);
  return raw ? JSON.parse(raw) : [];
}
export async function saveMissed(q: MissedItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.missed, JSON.stringify(q));
}
export async function loadHistory(): Promise<Record<string, HistoryEntry>> {
  const raw = await AsyncStorage.getItem(KEYS.history);
  return raw ? JSON.parse(raw) : {};
}
export async function saveHistory(h: Record<string, HistoryEntry>): Promise<void> {
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(h));
}
export async function loadHighScores(): Promise<HighScores> {
  const raw = await AsyncStorage.getItem(KEYS.highScores);
  return raw ? JSON.parse(raw) : { byConfig: {}, global: 0 };
}
export async function saveHighScores(h: HighScores): Promise<void> {
  await AsyncStorage.setItem(KEYS.highScores, JSON.stringify(h));
}

// stable key from the active (enabled) drill+level config
export function configKey(settings: Settings): string {
  const parts = (Object.keys(settings.drills) as Array<keyof Settings['drills']>)
    .filter((d) => settings.drills[d].enabled)
    .map((d) => `${d}:${settings.drills[d].level}`)
    .sort();
  return parts.join('|');
}
