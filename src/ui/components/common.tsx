import { useEffect, useState, type ReactNode } from 'react';
import { audio } from '../../audio/engine';
import type { Clip } from '../../audio/events';
import { back } from '../router';
import { Icon } from './Icon';

export function useAudioPlaying(): boolean {
  const [playing, setPlaying] = useState(false);
  useEffect(() => audio.onPlayingChange(setPlaying), []);
  return playing;
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: (() => void) | true; right?: ReactNode }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="icon-btn" aria-label="Back" onClick={onBack === true ? () => back() : onBack}>
          <Icon name="back" />
        </button>
      ) : <span className="topbar-spacer" />}
      {title && <h1 className="topbar-title">{title}</h1>}
      <div className="topbar-right">{right}</div>
    </header>
  );
}

// Small inline "play this example" button used in lessons and the explorer.
export function ListenButton({ label, sub, clip, active }: { label: string; sub?: string; clip: () => Clip; active?: boolean }) {
  const [mine, setMine] = useState(false);
  const playing = useAudioPlaying();
  useEffect(() => { if (!playing) setMine(false); }, [playing]);
  return (
    <button
      className={`listen ${mine && playing ? 'is-playing' : ''} ${active ? 'is-active' : ''}`}
      onClick={() => { setMine(true); void audio.play(clip()); }}
    >
      <span className="listen-icon"><Icon name="play" size={14} fill /></span>
      <span className="listen-text">
        <span className="listen-label">{label}</span>
        {sub && <span className="listen-sub">{sub}</span>}
      </span>
    </button>
  );
}

export function ProgressRing({ value, size = 64, stroke = 7, children, color }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={color ?? 'var(--accent)'}
          strokeDasharray={c} strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name="star" size={size} fill className={i < count ? 'star-on' : 'star-off'} />
      ))}
    </span>
  );
}

export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, background: color }} />
    </div>
  );
}
