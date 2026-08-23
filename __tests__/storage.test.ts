jest.mock('@react-native-async-storage/async-storage', () => ({}));

import { DEFAULT_SETTINGS, configKey } from '../src/utils/storage';

describe('storage helpers', () => {
  it('default settings enable pitch easy and disable the rest', () => {
    const s = DEFAULT_SETTINGS;
    expect(s.drills.pitch.enabled).toBe(true);
    expect(s.drills.pitch.level).toBe('easy');
    expect(s.drills.intervals.enabled).toBe(false);
    expect(s.inputMethod).toBe('hybrid');
    expect(s.testCount).toBe(20);
    expect(s.testMinutes).toBe(5);
  });
  it('configKey is stable for identical settings', () => {
    const k1 = configKey(DEFAULT_SETTINGS);
    const k2 = configKey(DEFAULT_SETTINGS);
    expect(k1).toBe(k2);
  });
  it('configKey differs for different enabled sets', () => {
    const a = { ...DEFAULT_SETTINGS, drills: { ...DEFAULT_SETTINGS.drills, intervals: { enabled: true, level: 'easy' as const } } };
    expect(configKey(a)).not.toBe(configKey(DEFAULT_SETTINGS));
  });
});
