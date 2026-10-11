import type { PointerEvent } from 'react';
import { isWhiteKey, PITCH_CLASS_NAMES, pitchClass } from '../../theory/notes';

export type KeyMark = 'correct' | 'wrong' | 'active' | 'dim';

// Responsive piano: white keys share the width; black keys sit on the seams.
export function Piano({
  from,
  to,
  onPress,
  marks = {},
  labels = 'c',
  disabled,
}: {
  from: number;
  to: number;
  onPress?: (midi: number) => void;
  marks?: Record<number, KeyMark>;
  labels?: 'c' | 'all' | 'none';
  disabled?: (midi: number) => boolean;
}) {
  const whites: number[] = [];
  for (let m = from; m <= to; m++) if (isWhiteKey(m)) whites.push(m);
  const w = 100 / whites.length;

  const label = (m: number) => {
    if (labels === 'none') return null;
    if (labels === 'c' && pitchClass(m) !== 0) return null;
    return labels === 'c' ? `C${Math.floor(m / 12) - 1}` : PITCH_CLASS_NAMES[pitchClass(m)];
  };

  const keyProps = (m: number) => {
    const off = disabled?.(m);
    return {
      className: `${isWhiteKey(m) ? 'pk-white' : 'pk-black'} ${marks[m] ? `pk-${marks[m]}` : ''} ${off ? 'pk-off' : ''}`,
      onPointerDown: (e: PointerEvent) => {
        e.preventDefault();
        if (!off) onPress?.(m);
      },
      'aria-label': PITCH_CLASS_NAMES[pitchClass(m)],
      role: 'button' as const,
    };
  };

  return (
    <div className="piano" role="group" aria-label="Piano keyboard">
      {whites.map((m, i) => (
        <div key={m} {...keyProps(m)} style={{ left: `${i * w}%`, width: `${w}%` }}>
          <span className="pk-label">{label(m)}</span>
        </div>
      ))}
      {whites.map((m, i) => {
        const b = m + 1;
        if (b > to || isWhiteKey(b)) return null;
        return (
          <div key={b} {...keyProps(b)} style={{ left: `${(i + 1) * w - w * 0.3}%`, width: `${w * 0.6}%` }}>
            <span className="pk-label">{labels === 'all' ? PITCH_CLASS_NAMES[pitchClass(b)] : null}</span>
          </div>
        );
      })}
    </div>
  );
}
