import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { QuestionCard } from '../components/QuestionCard';
import { useAppState } from '../context/AppStateContext';
import { DrillItem } from '../types';
import { audioEngine } from '../audio/AudioEngine';

export function TrainScreen() {
  const { settings, nextItem, answer } = useAppState();
  const [item, setItem] = useState<DrillItem | null>(null);

  useEffect(() => { audioEngine.init(); }, []);
  useEffect(() => { setItem(nextItem()); }, [settings]);

  const inputMode = settings.inputMethod === 'buttons' ? 'buttons'
    : settings.inputMethod === 'piano' ? 'piano'
    : item?.drill === 'pitch' ? 'piano' : 'buttons';

  if (!item) return <ScreenWrapper><Text>Loading…</Text></ScreenWrapper>;

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Train</Text>
      <QuestionCard
        key={item.key + Math.random()}
        item={item}
        onAnswered={(correct) => {
          answer(correct, item, false);
          setItem(nextItem());
        }}
        showReplay
        showTip
        inputMode={inputMode as 'buttons' | 'piano'}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({ title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 } });
