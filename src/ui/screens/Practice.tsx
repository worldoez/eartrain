import { useState } from 'react';
import { audio } from '../../audio/engine';
import { CATEGORIES, EXERCISES, EXERCISE_BY_ID } from '../../exercises';
import type { ExerciseConfig } from '../../exercises/types';
import { LESSON_BY_ID } from '../../learn/lessons';
import { mastery, starsFor } from '../../state/progress';
import { useProgress } from '../../state/store';
import { Bar, Stars, TopBar } from '../components/common';
import { Icon } from '../components/Icon';
import { go, sessionHref } from '../router';

export function PracticeScreen() {
  const progress = useProgress();
  return (
    <div className="screen">
      <TopBar title="Practice" />
      <button className="card card-row card-click mix-card" onClick={() => { audio.unlock(); go(sessionHref({ mode: 'mix' })); }}>
        <span className="card-icon"><Icon name="shuffle" /></span>
        <span className="card-row-body">
          <strong>Daily mix</strong>
          <span className="muted small">A bit of everything you’ve been practising</span>
        </span>
        <Icon name="chevron" />
      </button>
      {CATEGORIES.map((cat) => (
        <section key={cat.id} className={`cat-${cat.id}`}>
          <h2 className="section-title"><span className="dot" />{cat.name} <span className="muted small">· {cat.tagline}</span></h2>
          <div className="list">
            {EXERCISES.filter((e) => e.category === cat.id).map((ex) => {
              const m = mastery(progress, ex.id);
              return (
                <button key={ex.id} className="list-row" onClick={() => go(`/exercise/${ex.id}`)}>
                  <span className="list-row-body">
                    <strong>{ex.title}</strong>
                    <span className="muted small">{ex.blurb}</span>
                    {m !== null && <Bar value={m} color="var(--cat)" />}
                  </span>
                  <Icon name="chevron" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ExerciseScreen({ id }: { id: string }) {
  const ex = EXERCISE_BY_ID[id];
  const progress = useProgress();
  const [tab, setTab] = useState<'levels' | 'custom'>('levels');
  const [custom, setCustom] = useState<ExerciseConfig>(() => ({ ...ex?.levels[0].config }));
  if (!ex) return <div className="screen"><TopBar title="Not found" onBack /></div>;

  const lesson = ex.lessonId ? LESSON_BY_ID[ex.lessonId] : null;
  const current = progress.lastLevel[ex.id];
  const start = (params: Record<string, string>) => {
    audio.unlock();
    go(sessionHref({ ex: ex.id, ...params }));
  };

  const toggle = (groupId: string, optId: string, multi: boolean) => {
    setCustom((c) => {
      const cur = c[groupId] ?? [];
      if (!multi) return { ...c, [groupId]: [optId] };
      return { ...c, [groupId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
    });
  };
  const customValid = ex.groups.every((g) => (custom[g.id]?.length ?? 0) >= (g.min ?? 1));

  return (
    <div className={`screen cat-${ex.category}`}>
      <TopBar title={ex.title} onBack={() => go('/practice')} />
      <p className="lead">{ex.blurb}</p>
      {lesson && (
        <button className="card card-row card-click" onClick={() => go(`/lesson/${lesson.id}`)}>
          <span className="card-icon cat-bg"><Icon name="book" /></span>
          <span className="card-row-body">
            <span className="eyebrow">Lesson · {lesson.minutes} min</span>
            <strong>{lesson.title}</strong>
          </span>
          {progress.lessonsDone.includes(lesson.id) ? <span className="pill pill-good"><Icon name="check" size={14} /></span> : <Icon name="chevron" />}
        </button>
      )}

      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'levels'} className={tab === 'levels' ? 'is-active' : ''} onClick={() => setTab('levels')}>Levels</button>
        <button role="tab" aria-selected={tab === 'custom'} className={tab === 'custom' ? 'is-active' : ''} onClick={() => setTab('custom')}><Icon name="sliders" size={16} /> Custom</button>
      </div>

      {tab === 'levels' ? (
        <div className="levels">
          {ex.levels.map((lv, i) => {
            const best = progress.levelBest[`${ex.id}:${lv.id}`];
            const m = mastery(progress, ex.id, lv.config.items);
            return (
              <button key={lv.id} className={`level ${current === lv.id ? 'is-current' : ''}`} onClick={() => start({ level: lv.id })}>
                <span className="level-num">{i + 1}</span>
                <span className="level-body">
                  <strong>{lv.name}</strong>
                  <span className="muted small">{lv.summary}</span>
                </span>
                <span className="level-meta">
                  {best !== undefined ? <Stars count={starsFor(best)} /> : m !== null ? null : <span className="muted small">New</span>}
                  {best !== undefined && <span className="muted small">{best}%</span>}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="custom">
          {ex.groups.map((g) => (
            <section key={g.id} className="custom-group">
              <h3 className="custom-label">{g.label}{g.multi && <span className="muted small"> · choose {g.min ?? 1}+</span>}</h3>
              <div className="chips">
                {g.options.map((o) => {
                  const on = custom[g.id]?.includes(o.id);
                  return (
                    <button key={o.id} className={`chip chip-toggle ${on ? 'is-on' : ''}`} onClick={() => toggle(g.id, o.id, g.multi)} aria-pressed={on}>
                      {o.label}{o.sub && <span className="chip-sub">{o.sub}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <button className="btn btn-primary btn-block" disabled={!customValid} onClick={() => start({ cfg: JSON.stringify(custom) })}>
            <Icon name="play" size={16} fill /> Start custom drill
          </button>
        </div>
      )}
    </div>
  );
}
