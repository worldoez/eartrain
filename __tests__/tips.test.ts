import { getTip } from '../src/data/tips';
import { DrillItem } from '../src/types';

const mk = (over: Partial<DrillItem>): DrillItem => ({
  drill: 'pitch', key: '', display: '', answerMidi: [], answerOptions: [], correctAnswer: '', ...over,
});

describe('tips', () => {
  it('returns a mnemonic for minor 3rd', () => {
    const t = getTip(mk({ drill: 'intervals', display: 'm3' }));
    expect(t.name).toBe('m3');
    expect(t.tip.length).toBeGreaterThan(5);
  });
  it('returns a mnemonic for major chord', () => {
    const t = getTip(mk({ drill: 'chords', display: 'maj' }));
    expect(t.name).toBe('maj');
    expect(t.tip).toMatch(/bright|happy/i);
  });
  it('returns a default tip for an unknown key', () => {
    const t = getTip(mk({ drill: 'scales', display: 'wholeTone' }));
    expect(t.name).toBe('wholeTone');
    expect(t.tip.length).toBeGreaterThan(0);
  });
});
