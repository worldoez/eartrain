import { audio } from '../../audio/engine';
import { CATEGORIES, EXERCISES } from '../../exercises';
import { LESSONS } from '../../learn/lessons';
import { dayKey, dueReviews, mastery } from '../../state/progress';
import { useProgress, useSettings } from '../../state/store';
import { Bar, ProgressRing } from '../components/common';
import { Icon } from '../components/Icon';
import { go, sessionHref } from '../router';

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function HomeScreen() {
  const progress = useProgress();
  const settings = useSettings();
  const now = Date.now();
  const today = progress.days[dayKey(now)] ?? { answered: 0, correct: 0 };
  const due = dueReviews(progress, now).length;
  const nextLesson = LESSONS.find((l) => !progress.lessonsDone.includes(l.id));
  const streakAlive = progress.streak.lastDay === dayKey(now) || progress.streak.lastDay === dayKey(now - 864e5);
  const streak = streakAlive ? progress.streak.count : 0;
  const goalPct = Math.min(1, today.answered / settings.dailyGoal);

  const start = (href: string) => {
    audio.unlock();
    go(href);
  };

  return (
    <div className="screen">
      <header className="home-head">
        <div>
          <div className="muted small">{greeting()}</div>
          <h1 className="brand">Ear<span>Train</span></h1>
        </div>
        <button className="icon-btn" aria-label="Settings" onClick={() => go('/settings')}><Icon name="gear" /></button>
      </header>

      <section className="hero">
        <ProgressRing value={goalPct} size={96} stroke={10} color="#fff">
          <div className="hero-ring-num">{today.answered}</div>
          <div className="hero-ring-sub">/ {settings.dailyGoal}</div>
        </ProgressRing>
        <div className="hero-body">
          <div className="hero-stats">
            <span className="hero-stat"><Icon name="flame" size={18} fill /> {streak} day{streak === 1 ? '' : 's'}</span>
            <span className="hero-stat"><Icon name="bolt" size={18} fill /> {progress.xp} XP</span>
          </div>
          <div className="hero-title">{goalPct >= 1 ? 'Daily goal reached!' : 'Today’s goal'}</div>
          <button className="btn btn-on-hero" onClick={() => start(sessionHref({ mode: 'mix' }))}>
            <Icon name="shuffle" size={18} /> Daily mix
          </button>
        </div>
      </section>

      {due > 0 && (
        <button className="card card-row card-click review-card" onClick={() => start(sessionHref({ mode: 'review' }))}>
          <span className="card-icon"><Icon name="replay" /></span>
          <span className="card-row-body">
            <strong>{due} to review</strong>
            <span className="muted small">Items you missed, spaced out so they stick</span>
          </span>
          <Icon name="chevron" />
        </button>
      )}

      {nextLesson && (
        <button className={`card card-row card-click cat-${nextLesson.category}`} onClick={() => go(`/lesson/${nextLesson.id}`)}>
          <span className="card-icon cat-bg"><Icon name="book" /></span>
          <span className="card-row-body">
            <span className="eyebrow">{progress.lessonsDone.length ? 'Continue learning' : 'Start here'}</span>
            <strong>{nextLesson.title}</strong>
            <span className="muted small">{nextLesson.summary}</span>
          </span>
          <Icon name="chevron" />
        </button>
      )}

      <h2 className="section-title">Skills</h2>
      <div className="skill-grid">
        {EXERCISES.map((ex) => {
          const m = mastery(progress, ex.id);
          const level = progress.lastLevel[ex.id];
          return (
            <button key={ex.id} className={`skill cat-${ex.category}`} onClick={() => go(`/exercise/${ex.id}`)}>
              <span className="skill-cat">{CATEGORIES.find((c) => c.id === ex.category)?.name}</span>
              <strong className="skill-title">{ex.title}</strong>
              <span className="muted small">{level ? `Level ${level === 'custom' ? 'custom' : level}` : 'Not started'}</span>
              <Bar value={m ?? 0} color="var(--cat)" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
