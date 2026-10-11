import { useState } from 'react';
import { audio } from '../../audio/engine';
import { arpeggio, block, sequence, single, after } from '../../audio/events';
import { EXERCISE_BY_ID } from '../../exercises';
import { LESSONS, LESSON_BY_ID, type Block } from '../../learn/lessons';
import { updateProgress, useProgress } from '../../state/store';
import { buildChord, CHORDS, CHORD_BY_ID } from '../../theory/chords';
import { INTERVALS, INTERVAL_BY_ID } from '../../theory/intervals';
import { midiToName, PITCH_CLASS_NAMES, pitchClass } from '../../theory/notes';
import { buildScale, SCALES, SCALE_BY_ID } from '../../theory/scales';
import { ListenButton, TopBar } from '../components/common';
import { Icon } from '../components/Icon';
import { Piano, type KeyMark } from '../components/Piano';
import { go, sessionHref } from '../router';

export function LearnScreen() {
  const progress = useProgress();
  const done = progress.lessonsDone.length;
  return (
    <div className="screen">
      <TopBar title="Learn" />
      <p className="lead">Short lessons with sounds to try, each followed by a 5-question check. {done}/{LESSONS.length} complete.</p>

      <button className="card card-row card-click explore-card" onClick={() => go('/explore')}>
        <span className="card-icon"><Icon name="piano" /></span>
        <span className="card-row-body">
          <strong>Explorer</strong>
          <span className="muted small">Build any interval, chord or scale on a keyboard and hear it</span>
        </span>
        <Icon name="chevron" />
      </button>

      <ol className="path">
        {LESSONS.map((l, i) => {
          const isDone = progress.lessonsDone.includes(l.id);
          const isNext = !isDone && LESSONS.slice(0, i).every((x) => progress.lessonsDone.includes(x.id));
          return (
            <li key={l.id} className={`path-step cat-${l.category} ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}>
              <button className="path-btn" onClick={() => go(`/lesson/${l.id}`)}>
                <span className="path-dot">{isDone ? <Icon name="check" size={16} /> : i + 1}</span>
                <span className="path-body">
                  <strong>{l.title}</strong>
                  <span className="muted small">{l.summary}</span>
                  <span className="muted tiny">{l.minutes} min</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LessonBlock({ b }: { b: Block }) {
  const [pressed, setPressed] = useState<number | null>(null);
  switch (b.kind) {
    case 'h':
      return <h2 className="lesson-h">{b.text}</h2>;
    case 'p':
      return <p className="lesson-p">{b.text}</p>;
    case 'tip':
      return <div className="lesson-tip"><Icon name="bolt" size={18} fill /><p>{b.text}</p></div>;
    case 'listen':
      return (
        <div className={`listen-grid cols-${b.columns ?? 2}`}>
          {b.items.map((it) => <ListenButton key={it.label} label={it.label} sub={it.sub} clip={it.clip} />)}
        </div>
      );
    case 'table':
      return (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'piano':
      return (
        <figure className="lesson-piano">
          <Piano from={60} to={76} labels="all" marks={pressed !== null ? { [pressed]: 'active' } : {}} onPress={(m) => { setPressed(m); void audio.play(single(m)); }} />
          <figcaption className="muted small">{pressed !== null ? `${midiToName(pressed)} — ` : ''}{b.caption}</figcaption>
        </figure>
      );
  }
}

export function LessonScreen({ id }: { id: string }) {
  const lesson = LESSON_BY_ID[id];
  const progress = useProgress();
  if (!lesson) return <div className="screen"><TopBar title="Not found" onBack /></div>;
  const idx = LESSONS.indexOf(lesson);
  const nextLesson = LESSONS[idx + 1];
  const isDone = progress.lessonsDone.includes(id);
  const ex = EXERCISE_BY_ID[lesson.practice.exerciseId];

  return (
    <div className={`screen lesson cat-${lesson.category}`}>
      <TopBar title="" onBack={() => go('/learn')} right={<span className="muted small">Lesson {idx + 1} of {LESSONS.length}</span>} />
      <div className="lesson-hero">
        <span className="eyebrow">{lesson.minutes} min read</span>
        <h1>{lesson.title}</h1>
        <p className="lead">{lesson.summary}</p>
      </div>
      {lesson.blocks.map((b, i) => <LessonBlock key={i} b={b} />)}

      <section className="card lesson-end">
        <h3 className="card-title">{isDone ? 'Lesson complete ✓' : 'Quick check'}</h3>
        <p className="muted small">5 questions from <strong>{ex.title}</strong>. Finish them to complete the lesson.</p>
        <div className="row-gap">
          <button className="btn btn-primary" onClick={() => { audio.unlock(); go(sessionHref({ ex: ex.id, level: lesson.practice.levelId, n: 5, lesson: lesson.id })); }}>
            <Icon name="play" size={16} fill /> {isDone ? 'Check again' : 'Start quick check'}
          </button>
          {!isDone && (
            <button className="btn btn-ghost" onClick={() => updateProgress((p) => ({ ...p, lessonsDone: [...p.lessonsDone, id] }))}>Mark as read</button>
          )}
        </div>
      </section>
      {nextLesson && (
        <button className="card card-row card-click" onClick={() => go(`/lesson/${nextLesson.id}`)}>
          <span className="card-row-body">
            <span className="eyebrow">Next lesson</span>
            <strong>{nextLesson.title}</strong>
          </span>
          <Icon name="chevron" />
        </button>
      )}
    </div>
  );
}

type ExploreMode = 'interval' | 'chord' | 'scale';

export function ExploreScreen() {
  const [mode, setMode] = useState<ExploreMode>('chord');
  const [root, setRoot] = useState(60);
  const [shape, setShape] = useState<Record<ExploreMode, string>>({ interval: 'P5', chord: 'maj', scale: 'major' });
  const [style, setStyle] = useState<'together' | 'apart'>('together');

  const notes =
    mode === 'interval' ? [root, root + INTERVAL_BY_ID[shape.interval].semitones]
      : mode === 'chord' ? buildChord(root, shape.chord)
        : buildScale(root, shape.scale);

  const play = (r = root, s = shape) => {
    const n = mode === 'interval' ? [r, r + INTERVAL_BY_ID[s.interval].semitones] : mode === 'chord' ? buildChord(r, s.chord) : buildScale(r, s.scale);
    if (mode === 'scale') void audio.play(sequence(n, 0.3, 0.45));
    else if (style === 'together') void audio.play(mode === 'chord' ? after(block(n, 1.5), arpeggio(n, 0.25, 1), 0.2) : block(n, 1.6));
    else void audio.play(mode === 'chord' ? arpeggio(n, 0.3, 1.3) : sequence(n, 0.7));
  };

  const marks: Record<number, KeyMark> = {};
  notes.forEach((n) => { marks[n] = 'active'; });
  marks[root] = 'correct';

  const name =
    mode === 'interval' ? `${INTERVAL_BY_ID[shape.interval].name} above ${PITCH_CLASS_NAMES[pitchClass(root)]}`
      : mode === 'chord' ? `${PITCH_CLASS_NAMES[pitchClass(root)]} ${CHORD_BY_ID[shape.chord].name.toLowerCase()}`
        : `${PITCH_CLASS_NAMES[pitchClass(root)]} ${SCALE_BY_ID[shape.scale].name}`;

  const options =
    mode === 'interval' ? INTERVALS.map((i) => ({ id: i.id, label: i.short }))
      : mode === 'chord' ? CHORDS.map((c) => ({ id: c.id, label: c.name }))
        : SCALES.map((s) => ({ id: s.id, label: s.name }));

  return (
    <div className="screen explore">
      <TopBar title="Explorer" onBack={() => go('/learn')} />
      <div className="segmented">
        {(['interval', 'chord', 'scale'] as ExploreMode[]).map((m) => (
          <button key={m} className={mode === m ? 'is-active' : ''} onClick={() => setMode(m)}>{m[0].toUpperCase() + m.slice(1)}s</button>
        ))}
      </div>

      <div className="explore-readout card">
        <div>
          <div className="explore-name">{name}</div>
          <div className="muted small">{notes.map((n) => PITCH_CLASS_NAMES[pitchClass(n)]).join(' · ')}</div>
        </div>
        <button className="orb orb-sm" onClick={() => play()} aria-label="Play"><Icon name="play" size={22} fill /></button>
      </div>

      <div className="explore-piano">
        <Piano from={48} to={84} labels="c" marks={marks} onPress={(m) => { const r = Math.min(m, 72); setRoot(r); play(r); }} />
        <p className="muted small center">Tap a key to set the root.</p>
      </div>

      {mode !== 'scale' && (
        <div className="segmented segmented-sm">
          <button className={style === 'together' ? 'is-active' : ''} onClick={() => setStyle('together')}>Together</button>
          <button className={style === 'apart' ? 'is-active' : ''} onClick={() => setStyle('apart')}>One at a time</button>
        </div>
      )}

      <div className="chips">
        {options.map((o) => (
          <button
            key={o.id}
            className={`chip chip-toggle ${shape[mode] === o.id ? 'is-on' : ''}`}
            onClick={() => { const s = { ...shape, [mode]: o.id }; setShape(s); play(root, s); }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
