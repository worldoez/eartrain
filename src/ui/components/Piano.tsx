import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { isWhiteKey, midiToName, PITCH_CLASS_NAMES, pitchClass } from '../../theory/notes';

export type KeyMark = 'correct' | 'wrong' | 'active' | 'dim';

// Responsive piano: white keys share the width; black keys sit on the seams.
export function Piano({
  from,
  to,
  onPress,
  marks = {},
  labels = 'c',
  disabled,
  scrollable,
}: {
  from: number;
  to: number;
  onPress?: (midi: number) => void;
  marks?: Record<number, KeyMark>;
  labels?: 'c' | 'all' | 'none';
  disabled?: (midi: number) => boolean;
  /** True when rendered inside a horizontally scrollable container (Explorer); taps fire on pointerup, scrolls never sound. */
  scrollable?: boolean;
}) {
  const whites: number[] = [];
  for (let m = from; m <= to; m++) if (isWhiteKey(m)) whites.push(m);
  const w = 100 / whites.length;

  // Roving tabindex: all keys in range, ordered by pitch; navigation and the
  // single tab stop only ever land on enabled (not disabled) keys.
  const ordered: number[] = [];
  for (let m = from; m <= to; m++) ordered.push(m);
  const enabled = ordered.filter((m) => !disabled?.(m));
  const [navMidi, setNavMidi] = useState<number | null>(null);
  const tabbable =
    navMidi !== null && navMidi >= from && navMidi <= to && disabled?.(navMidi) !== true
      ? navMidi
      : enabled[0];

  const keyRefs = useRef(new Map<number, HTMLButtonElement>());
  const tapGesture = useRef<{ x: number; y: number; midi: number; ok: boolean } | null>(null);

  const navigate = (current: number, delta: -1 | 1) => {
    if (enabled.length === 0) return;
    let next: number | undefined;
    const idx = enabled.indexOf(current);
    if (idx === -1) {
      // Focus is on a disabled/off-range key: jump to the nearest enabled key in the arrow's direction.
      next = delta === 1 ? enabled.find((m) => m > current) : [...enabled].reverse().find((m) => m < current);
    } else {
      const t = idx + delta;
      if (t < 0 || t >= enabled.length) return; // stop at the ends, don't wrap
      next = enabled[t];
    }
    if (next === undefined) return;
    setNavMidi(next);
    keyRefs.current.get(next)?.focus(); // moves focus now; state updates the tab stop to match
  };

  const label = (m: number) => {
    if (labels === 'none') return null;
    if (labels === 'c' && pitchClass(m) !== 0) return null;
    return labels === 'c' ? `C${Math.floor(m / 12) - 1}` : PITCH_CLASS_NAMES[pitchClass(m)];
  };

  const refProps = (m: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      if (el) keyRefs.current.set(m, el);
      else keyRefs.current.delete(m);
    },
    tabIndex: m === tabbable ? 0 : -1,
  });

  const pressProps = (m: number, off: boolean | undefined) => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      if (!off) setNavMidi(m);
      if (!scrollable) { if (!off) onPress?.(m); return; } // instant, unchanged from before
      tapGesture.current = { x: e.clientX, y: e.clientY, midi: m, ok: !off };
    },
    onPointerUp: (e: PointerEvent) => {
      const g = tapGesture.current;
      tapGesture.current = null;
      if (!scrollable || !g || g.midi !== m || !g.ok) return;
      // A scroll gesture moves; a tap doesn't. Only then sound the note.
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 10) onPress?.(m);
    },
    onPointerCancel: () => {
      tapGesture.current = null; // scroll took over (or touch dropped) — no note
    },
  });

  const keyProps = (m: number) => {
    const off = disabled?.(m);
    return {
      ...refProps(m),
      ...pressProps(m, off),
      type: 'button' as const,
      className: `${isWhiteKey(m) ? 'pk-white' : 'pk-black'} ${marks[m] ? `pk-${marks[m]}` : ''} ${off ? 'pk-off' : ''}`,
      onKeyDown: (e: { key: string; preventDefault: () => void }) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!off) onPress?.(m); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); navigate(m, -1); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); navigate(m, 1); }
      },
      'aria-label': midiToName(m),
      'aria-disabled': off || undefined,
      role: 'button' as const,
    };
  };

  return (
    <div className="piano" role="group" aria-label="Piano keyboard">
      {whites.map((m, i) => (
        <button key={m} {...keyProps(m)} style={{ left: `${i * w}%`, width: `${w}%` }}>
          <span className="pk-label">{label(m)}</span>
        </button>
      ))}
      {whites.map((m, i) => {
        const b = m + 1;
        if (b > to || isWhiteKey(b)) return null;
        return (
          <button key={b} {...keyProps(b)} style={{ left: `${(i + 1) * w - w * 0.3}%`, width: `${w * 0.6}%` }}>
            <span className="pk-label">{labels === 'all' ? PITCH_CLASS_NAMES[pitchClass(b)] : null}</span>
          </button>
        );
      })}
    </div>
  );
}