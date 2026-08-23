import { addMissed, recordCorrect, recordWrong, pullMissed, shouldPullFromMissed } from '../src/utils/missedQueue';
import { DrillItem, MissedItem } from '../src/types';

const item = (key: string): DrillItem => ({ drill: 'pitch', key, display: 'G4', answerMidi: [67], answerOptions: [], correctAnswer: 'G4' });

describe('missed queue', () => {
  it('adds a fresh missed item at streak 0', () => {
    const q = addMissed([], item('pitch:G4'));
    expect(q).toHaveLength(1);
    expect(q[0].correctStreak).toBe(0);
    expect(q[0].neededStreak).toBe(2);
  });
  it('increments streak on correct and removes at >= needed', () => {
    let q = addMissed([], item('pitch:G4'));
    q = recordCorrect(q, 'pitch:G4');
    expect(q[0].correctStreak).toBe(1);
    q = recordCorrect(q, 'pitch:G4');
    expect(q).toHaveLength(0); // mastered
  });
  it('resets streak to 0 on wrong', () => {
    let q = addMissed([], item('pitch:G4'));
    q = recordCorrect(q, 'pitch:G4'); // streak 1
    q = recordWrong(q, 'pitch:G4', 'pitch'); // reset
    expect(q[0].correctStreak).toBe(0);
  });
  it('does not duplicate an existing key', () => {
    let q = addMissed([], item('pitch:G4'));
    q = addMissed(q, item('pitch:G4'));
    expect(q).toHaveLength(1);
  });
  it('pullMissed returns null on empty queue', () => {
    expect(pullMissed([], () => 0.9)).toBeNull();
  });
  it('pullMissed returns an item when probability fires', () => {
    const q = addMissed([], item('pitch:G4'));
    const picked = pullMissed(q, () => 0.3); // < 0.4 triggers
    expect(picked).not.toBeNull();
    expect(picked!.key).toBe('pitch:G4');
  });
  it('pullMissed returns null when probability does not fire', () => {
    const q = addMissed([], item('pitch:G4'));
    expect(pullMissed(q, () => 0.5)).toBeNull(); // > 0.4 no trigger
  });
  it('shouldPullFromMissed threshold is 0.4', () => {
    expect(shouldPullFromMissed(() => 0.39)).toBe(true);
    expect(shouldPullFromMissed(() => 0.41)).toBe(false);
  });
});
