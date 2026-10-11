import { useEffect, useMemo, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { EXERCISES, EXERCISE_BY_ID, levelConfig, reviewConfig } from '../../exercises';
import { pick } from '../../exercises/random';
import type { ExerciseConfig, ExerciseDef, Question } from '../../exercises/types';
import { LESSON_BY_ID } from '../../learn/lessons';
import { dueReviews, recordAnswer, recordSession, starsFor, type Progress } from '../../state/progress';
import { getProgress, getSettings, updateProgress } from '../../state/store';
import { pitchClass } from '../../theory/notes';
import { Bar, ProgressRing, Stars, useAudioPlaying } from '../components/common';
import { Icon } from '../components/Icon';
import { Piano, type KeyMark } from '../components/Piano';
import { back, go, useRoute } from '../router';

interface Source {
  key: string; // exercise id, or 'mix' / 'review'
  levelId: string;
  title: string;
  total: number;
  next: (prev: Question | null) => Question;
}

interface Result {
  exerciseId: string;
  item: string;
  correct: boolean;
}

function exerciseSource(ex: ExerciseDef, config: ExerciseConfig, levelId: string, total: number): Source {
  return {
    key: ex.id,
    levelId,
    title: ex.title,
    total,
    next: (prev) => ex.generate(config, Math.random, { avoid: prev?.item }),
  };
}

// Daily mix: questions from the exercises you've been practising, at your level.
function mixSource(p: Progress, total: number): Source {
  const chosen = EXERCISES.filter((e) => p.lastLevel[e.id]).map((e) => ({ ex: e, level: p.lastLevel[e.id] }));
  for (const id of ['intervals', 'chord-quality', 'scale-degrees', 'pitch-compare']) {
    if (chosen.length >= 3) break;
    if (!chosen.some((c) => c.ex.id === id)) chosen.push({ ex: EXERCISE_BY_ID[id], level: '1' });
  }
  return {
    key: 'mix',
    levelId: 'mix',
    title: 'Daily mix',
    total,
    next: (prev) => {
      const pool = chosen.length > 1 && prev ? chosen.filter((c) => c.ex.id !== prev.exerciseId) : chosen;
      const { ex, level } = pick(pool, Math.random);
      return ex.generate(levelConfig(ex, level), Math.random);
    },
  };
}

function reviewSource(p: Progress): Source | null {
  const due = [...dueReviews(p, Date.now())].filter((r) => EXERCISE_BY_ID[r.exerciseId]).sort(() => Math.random() - 0.5).slice(0, 20);
  if (!due.length) return null;
  let i = 0;
  return {
    key: 'review',
    levelId: 'review',
    title: 'Review',
    total: due.length,
    next: () => {
      const r = due[i++ % due.length];
      const ex = EXERCISE_BY_ID[r.exerciseId];
      return ex.generate(reviewConfig(ex, r.item), Math.random, { force: r.item });
    },
  };
}

function buildSource(q: URLSearchParams): Source | null {
  const p = getProgress();
  const n = Number(q.get('n')) || getSettings().sessionLength;
  const mode = q.get('mode');
  if (mode === 'mix') return mixSource(p, n);
  if (mode === 'review') return reviewSource(p);
  const ex = EXERCISE_BY_ID[q.get('ex') ?? ''];
  if (!ex) return null;
  const cfg = q.get('cfg');
  if (cfg) {
    try {
      return exerciseSource(ex, JSON.parse(cfg) as ExerciseConfig, 'custom', n);
    } catch {
      /* fall through to the level */
    }
  }
  const level = q.get('level') ?? '1';
  return exerciseSource(ex, levelConfig(ex, level), level, n);
}

export function SessionScreen() {
  const [run, setRun] = useState(0);
  return <SessionRun key={run} onRestart={() => setRun((r) => r + 1)} />;
}

function SessionRun({ onRestart }: { onRestart: () => void }) {
  const { query } = useRoute();
  const [source] = useState(() => buildSource(query));
  const lessonId = query.get('lesson');

  if (!source) {
    return (
      <div className="screen center-screen">
        <div className="empty">
          <Icon name="check" size={40} />
          <h2>{query.get('mode') === 'review' ? 'Nothing to review' : 'Exercise not found'}</h2>
          <p className="muted">{query.get('mode') === 'review' ? 'Questions you miss come back here on a schedule. You’re all caught up!' : ''}</p>
          <button className="btn btn-primary" onClick={() => go('/')}>Back home</button>
        </div>
      </div>
    );
  }
  return <SessionPlayer source={source} lessonId={lessonId} onRestart={onRestart} />;
}

function SessionPlayer({ source, lessonId, onRestart }: { source: Source; lessonId: string | null; onRestart: () => void }) {
  const settings = getSettings();
  const [q, setQ] = useState<Question>(() => source.next(null));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [combo, setCombo] = useState(0);
  const [needsTap, setNeedsTap] = useState(() => !audio.unlocked);
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());
  const xpStart = useRef(getProgress().xp);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playing = useAudioPlaying();
  const praise = useMemo(() => pick(['Correct!', 'Nice ear!', 'Yes!', 'Spot on!'], Math.random), [index]);

  // Play each new question automatically once audio is unlocked.
  useEffect(() => {
    if (!needsTap && !done) void audio.play(q.clip);
  }, [q, needsTap, done]);

  useEffect(() => () => {
    audio.stop();
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const finish = (all: Result[]) => {
    audio.stop();
    const correct = all.filter((r) => r.correct).length;
    updateProgress((p) => {
      let next = recordSession(p, {
        at: Date.now(),
        exerciseId: source.key,
        levelId: source.levelId,
        total: all.length,
        correct,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
      });
      if (lessonId && !next.lessonsDone.includes(lessonId)) next = { ...next, lessonsDone: [...next.lessonsDone, lessonId] };
      return next;
    });
    setDone(true);
  };

  const next = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (index + 1 >= source.total) {
      finish(results);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
    setQ(source.next(q));
  };

  const answer = (id: string) => {
    if (picked || needsTap) return;
    const correct = id === q.answer;
    setPicked(id);
    const all = [...results, { exerciseId: q.exerciseId, item: q.item, correct }];
    setResults(all);
    setCombo((c) => (correct ? c + 1 : 0));
    updateProgress((p) => recordAnswer(p, q.exerciseId, q.item, correct, Date.now(), source.key === 'review'));
    if (correct && settings.autoAdvance) {
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        if (index + 1 >= source.total) finish(all);
        else {
          setIndex(index + 1);
          setPicked(null);
          setQ(source.next(q));
        }
      }, 850);
    }
  };

  const replay = () => {
    if (playing) audio.stop();
    else void audio.play(q.clip);
  };

  // Keyboard: 1–9 answer, Space replays, Enter continues.
  const handlers = useRef({ answer, next, replay });
  handlers.current = { answer, next, replay };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ') { e.preventDefault(); handlers.current.replay(); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (picked) handlers.current.next(); return; }
      const d = Number(e.key);
      if (d >= 1 && d <= q.choices.length) handlers.current.answer(q.choices[d - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, picked]);

  if (done) {
    return <Summary source={source} results={results} xp={getProgress().xp - xpStart.current} lessonId={lessonId} onRestart={onRestart} />;
  }

  const ex = EXERCISE_BY_ID[q.exerciseId];
  const isCorrect = picked === q.answer;
  const answerChoice = q.choices.find((c) => c.id === q.answer);
  const pickedChoice = q.choices.find((c) => c.id === picked);

  const marks: Record<number, KeyMark> = {};
  if (q.input === 'piano' && picked) {
    marks[60 + Number(q.answer)] = 'correct';
    if (!isCorrect) marks[60 + Number(picked)] = 'wrong';
  }

  return (
    <div className={`session cat-${ex.category}`}>
      <div className="session-top">
        <button className="icon-btn" aria-label="End session" onClick={() => back()}><Icon name="x" /></button>
        <div className="session-progress" role="progressbar" aria-valuenow={index + (picked ? 1 : 0)} aria-valuemax={source.total}>
          <div style={{ width: `${((index + (picked ? 1 : 0)) / source.total) * 100}%` }} />
        </div>
        <div className={`combo ${combo >= 3 ? 'is-on' : ''}`} aria-label={`Streak ${combo}`}>
          <Icon name="flame" size={18} fill /> {combo}
        </div>
      </div>

      <div className="session-body">
        <div className="session-kicker">{source.key === 'mix' || source.key === 'review' ? `${source.title} · ${ex.title}` : ex.title} · {index + 1} of {source.total}</div>
        <h2 className="session-prompt">{q.prompt}</h2>

        <button className={`orb ${playing ? 'is-playing' : ''}`} onClick={replay} aria-label={playing ? 'Stop' : 'Play again'}>
          <span className="orb-ring" /><span className="orb-ring r2" />
          <Icon name={playing ? 'stop' : 'play'} size={34} fill />
        </button>
        <div className="session-tools">
          <button className="chip" onClick={() => void audio.play(q.clip)}><Icon name="replay" size={16} /> Replay</button>
          {q.contextClip && <button className="chip" onClick={() => void audio.play(q.contextClip!)}><Icon name="sound" size={16} /> Hear the key</button>}
        </div>

        {q.input === 'piano' ? (
          <div className="session-piano">
            <Piano
              from={60}
              to={71}
              labels="all"
              marks={marks}
              disabled={(m) => !q.choices.some((c) => c.id === String(pitchClass(m)))}
              onPress={(m) => (picked ? void audio.play({ events: [{ midi: m, time: 0, dur: 1 }], length: 1 }) : answer(String(pitchClass(m))))}
            />
          </div>
        ) : (
          <div className={`choices ${q.choices.length > 6 ? 'is-dense' : ''}`}>
            {q.choices.map((c, i) => {
              const state = !picked ? '' : c.id === q.answer ? 'is-correct' : c.id === picked ? 'is-wrong' : 'is-faded';
              return (
                <button key={c.id} className={`choice ${state}`} onClick={() => answer(c.id)} disabled={!!picked && c.id !== q.answer && c.id !== picked}>
                  <span className="choice-key">{i + 1}</span>
                  <span className="choice-label">{c.label}</span>
                  {c.sub && <span className="choice-sub">{c.sub}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {picked && (
        <div className={`feedback ${isCorrect ? 'is-good' : 'is-bad'}`} role="status">
          <div className="feedback-head">
            <span className="feedback-badge"><Icon name={isCorrect ? 'check' : 'x'} size={18} /></span>
            <strong>{isCorrect ? praise : `It was ${answerChoice?.label}`}</strong>
          </div>
          <p className="feedback-explain">{q.explain}</p>
          {!isCorrect && q.clipFor && (
            <div className="feedback-compare">
              <button className="chip" onClick={() => void audio.play(q.clip)}><Icon name="play" size={14} fill /> Correct: {answerChoice?.label}</button>
              {(() => {
                const yours = q.clipFor!(picked);
                return yours ? <button className="chip chip-bad" onClick={() => void audio.play(yours)}><Icon name="compare" size={14} /> Yours: {pickedChoice?.label ?? picked}</button> : null;
              })()}
            </div>
          )}
          {!(isCorrect && settings.autoAdvance) && (
            <button className="btn btn-primary btn-block" onClick={next}>{index + 1 >= source.total ? 'See results' : 'Continue'}</button>
          )}
        </div>
      )}

      {needsTap && (
        <div className="tap-overlay">
          <button className="btn btn-primary btn-lg" onClick={() => { audio.unlock(); setNeedsTap(false); }}>
            <Icon name="play" size={18} fill /> Start
          </button>
          <p className="muted">Turn your sound on 🔊</p>
        </div>
      )}
    </div>
  );
}

function Summary({ source, results, xp, lessonId, onRestart }: { source: Source; results: Result[]; xp: number; lessonId: string | null; onRestart: () => void }) {
  const correct = results.filter((r) => r.correct).length;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
  const stars = starsFor(pct);
  const byItem = new Map<string, { exerciseId: string; item: string; n: number; c: number }>();
  for (const r of results) {
    const k = `${r.exerciseId}:${r.item}`;
    const e = byItem.get(k) ?? { exerciseId: r.exerciseId, item: r.item, n: 0, c: 0 };
    e.n++;
    if (r.correct) e.c++;
    byItem.set(k, e);
  }
  const rows = [...byItem.values()].sort((a, b) => a.c / a.n - b.c / b.n);
  const missed = results.length - correct;
  const message = pct >= 90 ? 'Outstanding!' : pct >= 75 ? 'Great work!' : pct >= 50 ? 'Good progress' : 'Keep at it — it gets easier';
  const lesson = lessonId ? LESSON_BY_ID[lessonId] : null;

  return (
    <div className="screen summary">
      <div className="summary-hero">
        <ProgressRing value={pct / 100} size={150} stroke={12} color={pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}>
          <div className="summary-pct">{pct}%</div>
          <div className="muted small">{correct} / {results.length}</div>
        </ProgressRing>
        <Stars count={stars} size={28} />
        <h2>{message}</h2>
        <div className="summary-xp"><Icon name="bolt" size={16} fill /> +{xp} XP</div>
        {lesson && <div className="pill pill-good"><Icon name="check" size={14} /> Lesson complete: {lesson.title}</div>}
      </div>

      <section className="card">
        <h3 className="card-title">Breakdown</h3>
        <ul className="breakdown">
          {rows.map((r) => (
            <li key={`${r.exerciseId}:${r.item}`}>
              <span className="breakdown-label">{EXERCISE_BY_ID[r.exerciseId].itemLabel(r.item)}</span>
              <Bar value={r.c / r.n} color={r.c === r.n ? 'var(--good)' : r.c === 0 ? 'var(--bad)' : 'var(--warn)'} />
              <span className="breakdown-num">{r.c}/{r.n}</span>
            </li>
          ))}
        </ul>
        {missed > 0 && <p className="muted small">Missed items were added to your review queue.</p>}
      </section>

      <div className="summary-actions">
        <button className="btn btn-primary btn-block" onClick={onRestart}><Icon name="replay" size={18} /> Practise again</button>
        {lesson ? (
          <button className="btn btn-block" onClick={() => go(`/exercise/${lesson.practice.exerciseId}`)}>Go to full practice</button>
        ) : source.key !== 'mix' && source.key !== 'review' ? (
          <button className="btn btn-block" onClick={() => go(`/exercise/${source.key}`)}>Choose another level</button>
        ) : null}
        <button className="btn btn-ghost btn-block" onClick={() => go('/')}>Done</button>
      </div>
    </div>
  );
}
