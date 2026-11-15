import { useEffect } from 'react';
import { useSettings } from './state/store';
import { TabBar } from './ui/components/TabBar';
import { useRoute } from './ui/router';
import { HomeScreen } from './ui/screens/Home';
import { ExploreScreen, LearnScreen, LessonScreen } from './ui/screens/Learn';
import { ExerciseScreen, PracticeScreen } from './ui/screens/Practice';
import { ProgressScreen } from './ui/screens/Progress';
import { SessionScreen } from './ui/screens/Session';
import { SettingsScreen } from './ui/screens/Settings';

// Must match --bg in styles.css for each color scheme.
const THEME_BG: Record<'light' | 'dark', string> = { light: '#f4f5fa', dark: '#0b0d14' };

function useThemeColor() {
  const theme = useSettings().theme;
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    if (theme !== 'system') {
      meta.content = THEME_BG[theme];
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { meta.content = mq.matches ? THEME_BG.dark : THEME_BG.light; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

export function App() {
  const { parts, query } = useRoute();
  const [page, id] = parts;
  useThemeColor();

  if (page === 'session') return <main className="app app-full"><SessionScreen key={query.toString()} /></main>;

  let screen;
  switch (page) {
    case 'learn': screen = <LearnScreen />; break;
    case 'lesson': screen = <LessonScreen key={id} id={id} />; break;
    case 'explore': screen = <ExploreScreen />; break;
    case 'practice': screen = <PracticeScreen />; break;
    case 'exercise': screen = <ExerciseScreen key={id} id={id} />; break;
    case 'progress': screen = <ProgressScreen />; break;
    case 'settings': screen = <SettingsScreen />; break;
    default: screen = <HomeScreen />;
  }
  return (
    <main className="app">
      {screen}
      <TabBar />
    </main>
  );
}
