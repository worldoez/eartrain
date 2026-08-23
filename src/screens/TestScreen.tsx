import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { QuestionCard } from '../components/QuestionCard';
import { useAppState } from '../context/AppStateContext';
import { DrillItem } from '../types';
import { audioEngine } from '../audio/AudioEngine';

export function TestScreen() {
  const { settings, nextItem, answer, highScores } = useAppState();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [item, setItem] = useState<DrillItem | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [secsLeft, setSecsLeft] = useState(settings.testMinutes * 60);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { audioEngine.init(); }, []);

  const start = () => {
    setRunning(true); setDone(false);
    setCorrect(0); setAnswered(0);
    setSecsLeft(settings.testMinutes * 60);
    setItem(nextItem());
    timer.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) { finish(); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setDone(true);
    answer(true, item!, true, { correct, total: settings.testCount });
  };

  const inputMode = settings.inputMethod === 'buttons' ? 'buttons'
    : settings.inputMethod === 'piano' ? 'piano'
    : item?.drill === 'pitch' ? 'piano' : 'buttons';

  if (!running && !done) {
    return (
      <ScreenWrapper>
        <Text style={styles.title}>Test</Text>
        <Text style={styles.sub}>{settings.testCount} questions · {settings.testMinutes} min</Text>
        <Pressable onPress={start} style={styles.startBtn}><Text style={styles.startText}>Start</Text></Pressable>
      </ScreenWrapper>
    );
  }

  if (done) {
    const pct = Math.round((correct / settings.testCount) * 100);
    return (
      <ScreenWrapper>
        <Text style={styles.title}>Results</Text>
        <Text style={styles.score}>{pct}%</Text>
        <Text style={styles.sub}>{correct}/{settings.testCount} correct</Text>
        {pct >= highScores.global && <Text style={styles.banner}>New High Score!</Text>}
        <Pressable onPress={start} style={styles.startBtn}><Text style={styles.startText}>Try again</Text></Pressable>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Test · {secsLeft}s</Text>
      {item && (
        <QuestionCard
          key={item.key + answered}
          item={item}
          onAnswered={(c) => {
            const newCorrect = correct + (c ? 1 : 0);
            const newAnswered = answered + 1;
            setCorrect(newCorrect); setAnswered(newAnswered);
            answer(c, item, true, { correct: newCorrect, total: settings.testCount });
            if (newAnswered >= settings.testCount) finish();
            else setItem(nextItem());
          }}
          showReplay={false}
          showTip={false}
          inputMode={inputMode as 'buttons' | 'piano'}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#9aa0aa', fontSize: 16, marginBottom: 16 },
  startBtn: { alignSelf: 'center', paddingVertical: 18, paddingHorizontal: 40, backgroundColor: '#6c8cff', borderRadius: 12, marginTop: 16 },
  startText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  score: { color: '#3ddc84', fontSize: 56, fontWeight: '700', textAlign: 'center' },
  banner: { color: '#6c8cff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});
