import { go, useRoute } from '../router';
import { Icon } from './Icon';

const TABS = [
  { path: '', label: 'Home', icon: 'home' },
  { path: 'learn', label: 'Learn', icon: 'book' },
  { path: 'practice', label: 'Practice', icon: 'target' },
  { path: 'progress', label: 'Progress', icon: 'chart' },
];

export function TabBar() {
  const { parts } = useRoute();
  const current = parts[0] ?? '';
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = current === t.path || (t.path === 'learn' && (current === 'lesson' || current === 'explore')) || (t.path === 'practice' && current === 'exercise');
        return (
          <button key={t.label} className={`tab ${active ? 'is-active' : ''}`} onClick={() => go(`/${t.path}`)} aria-current={active ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
