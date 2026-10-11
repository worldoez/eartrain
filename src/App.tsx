import { TabBar } from './ui/components/TabBar';
import { useRoute } from './ui/router';
import { HomeScreen } from './ui/screens/Home';
import { ExploreScreen, LearnScreen, LessonScreen } from './ui/screens/Learn';
import { ExerciseScreen, PracticeScreen } from './ui/screens/Practice';
import { ProgressScreen } from './ui/screens/Progress';
import { SessionScreen } from './ui/screens/Session';
import { SettingsScreen } from './ui/screens/Settings';

export function App() {
  const { parts, query } = useRoute();
  const [page, id] = parts;

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
