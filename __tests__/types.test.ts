import { Drill, Difficulty, InputMethod, Settings, DrillItem, MissedItem } from '../src/types';

describe('types', () => {
  it('compiles when assigning concrete values', () => {
    const drill: Drill = 'pitch';
    const difficulty: Difficulty = 'medium';
    const input: InputMethod = 'hybrid';
    const settings: Settings = {
      drills: { pitch: { enabled: true, level: 'easy' }, intervals: { enabled: false, level: 'easy' }, chords: { enabled: false, level: 'easy' }, scales: { enabled: false, level: 'easy' } },
      inputMethod: input,
      referenceTone: true,
      testCount: 20,
      testMinutes: 5,
    };
    const item: DrillItem = { drill, key: 'pitch:G4', display: 'G', answerMidi: [67], answerOptions: ['G'], correctAnswer: 'G' };
    const missed: MissedItem = { key: 'pitch:G4', drill, correctStreak: 0, neededStreak: 2 };
    expect(drill).toBe('pitch');
    expect(difficulty).toBe('medium');
    expect(settings.testCount).toBe(20);
    expect(item.answerMidi).toEqual([67]);
    expect(missed.neededStreak).toBe(2);
  });
});