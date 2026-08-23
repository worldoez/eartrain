import { scoreTest, updateHighScores } from '../src/utils/scoring';
import { HighScores } from '../src/types';

describe('scoring', () => {
  it('scoreTest returns integer percent', () => {
    expect(scoreTest(15, 20)).toBe(75);
    expect(scoreTest(1, 3)).toBe(33);
  });
  it('updateHighScores raises per-config and global', () => {
    let hs: HighScores = { byConfig: {}, global: 0 };
    hs = updateHighScores(hs, 'pitch:easy', 70);
    expect(hs.byConfig['pitch:easy']).toBe(70);
    expect(hs.global).toBe(70);
    hs = updateHighScores(hs, 'pitch:easy', 60); // lower: no change
    expect(hs.byConfig['pitch:easy']).toBe(70);
    hs = updateHighScores(hs, 'intervals:medium', 90);
    expect(hs.global).toBe(90);
  });
});
