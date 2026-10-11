import { audio } from '../../audio/engine';
import { EXERCISES, EXERCISE_BY_ID } from '../../exercises';
import { dayKey, dueReviews, mastery, starsFor, weakestItems } from '../../state/progress';
import { useProgress } from '../../state/store';
import { Bar, Stars, TopBar } from '../components/common';
import { Icon } from '../components/Icon';
import { go, sessionHref } from '../router';

export function ProgressScreen() {
  const p = useProgress();
  const now = Date.now();
  const days = Array.from({ length: 14 }, (_, i) => {
    const t = now - (13 - i) * 864e5;
    const k = dayKey(t);
    return { k, label: new Date(t).toLocaleDateString(undefined, { weekday: 'narrow' }), ...(p.days[k] ?? { answered: 0, correct: 0 }) };
  });
  const max = Math.max(10, ...days.map((d) => d.answered));
  const totals = Object.values(p.days).reduce((a, d) => ({ answered: a.answered + d.answered, correct: a.correct + d.correct }), { answered: 0, correct: 0 });
  const acc = totals.answered ? Math.round((totals.correct / totals.answered) * 100) : 0;
  const weak = weakestItems(p).filter((w) => w.acc < 0.8 && EXERCISE_BY_ID[w.exerciseId]).slice(0, 6);
  const due = dueReviews(p, now).length;

  return (
    <div className="screen">
      <TopBar title="Progress" />
      <div className="tiles">
        <div className="tile"><Icon name="flame" size={20} fill className="c-warn" /><strong>{p.streak.count}</strong><span className="muted small">day streak</span></div>
        <div className="tile"><Icon name="bolt" size={20} fill className="c-accent" /><strong>{p.xp}</strong><span className="muted small">XP</span></div>
        <div className="tile"><Icon name="target" size={20} className="c-good" /><strong>{acc}%</strong><span className="muted small">accuracy</span></div>
        <div className="tile"><Icon name="check" size={20} className="c-accent" /><strong>{totals.answered}</strong><span className="muted small">answered</span></div>
      </div>

      <section className="card">
        <h3 className="card-title">Last 14 days</h3>
        <div className="chart" role="img" aria-label="Questions answered per day">
          {days.map((d) => (
            <div key={d.k} className="chart-col" title={`${d.k}: ${d.correct}/${d.answered}`}>
              <div className="chart-bar" style={{ height: `${(d.answered / max) * 100}%` }}>
                <div className="chart-bar-good" style={{ height: d.answered ? `${(d.correct / d.answered) * 100}%` : 0 }} />
              </div>
              <span className="chart-label">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="legend"><span><i className="sw sw-good" /> correct</span><span><i className="sw" /> answered</span></div>
      </section>

      {(weak.length > 0 || due > 0) && (
        <section className="card">
          <h3 className="card-title">Needs work</h3>
          <ul className="breakdown">
            {weak.map((w) => (
              <li key={`${w.exerciseId}:${w.item}`}>
                <span className="breakdown-label">{EXERCISE_BY_ID[w.exerciseId].itemLabel(w.item)}<span className="muted tiny"> · {EXERCISE_BY_ID[w.exerciseId].title}</span></span>
                <Bar value={w.acc} color={w.acc < 0.5 ? 'var(--bad)' : 'var(--warn)'} />
                <span className="breakdown-num">{Math.round(w.acc * 100)}%</span>
              </li>
            ))}
          </ul>
          {due > 0 && (
            <button className="btn btn-primary btn-block" onClick={() => { audio.unlock(); go(sessionHref({ mode: 'review' })); }}>
              Review {due} item{due === 1 ? '' : 's'} now
            </button>
          )}
        </section>
      )}

      <section className="card">
        <h3 className="card-title">Skills</h3>
        <ul className="skill-list">
          {EXERCISES.map((ex) => {
            const m = mastery(p, ex.id);
            const bests = ex.levels.map((l) => p.levelBest[`${ex.id}:${l.id}`]);
            const cleared = bests.filter((b) => b !== undefined && b >= 75).length;
            return (
              <li key={ex.id} className={`cat-${ex.category}`}>
                <button className="skill-list-row" onClick={() => go(`/exercise/${ex.id}`)}>
                  <span className="skill-list-name"><span className="dot" />{ex.title}</span>
                  <span className="muted small">{cleared}/{ex.levels.length} levels</span>
                  <Bar value={m ?? 0} color="var(--cat)" />
                  <span className="skill-levels">
                    {bests.map((b, i) => <Stars key={i} count={b === undefined ? 0 : starsFor(b)} size={9} />)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
