import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet, Alert } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppState } from '../context/AppStateContext';
import { Drill, Difficulty, Settings, InputMethod } from '../types';

const DRILLS: Drill[] = ['pitch', 'intervals', 'chords', 'scales'];
const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];

export function SettingsScreen() {
  const { settings, setSettings, resetMissed, missedQueue } = useAppState();

  const toggle = (d: Drill) => {
    const next = { ...settings.drills, [d]: { ...settings.drills[d], enabled: !settings.drills[d].enabled } };
    const enabledCount = DRILLS.filter((x) => next[x].enabled).length;
    if (enabledCount === 0) { Alert.alert('Keep at least one drill enabled'); return; }
    setSettings({ ...settings, drills: next });
  };

  const setLevel = (d: Drill, level: Difficulty) =>
    setSettings({ ...settings, drills: { ...settings.drills, [d]: { ...settings.drills[d], level } } });

  const confirmResetMissed = () => Alert.alert('Reset missed queue?', '', [
    { text: 'Cancel' }, { text: 'Reset', onPress: resetMissed },
  ]);

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Settings</Text>
      {DRILLS.map((d) => (
        <View key={d} style={styles.drill}>
          <View style={styles.row}>
            <Text style={styles.label}>{d}</Text>
            <Switch value={settings.drills[d].enabled} onValueChange={() => toggle(d)} />
          </View>
          {settings.drills[d].enabled && (
            <View style={styles.levels}>
              {LEVELS.map((l) => (
                <Pressable key={l} onPress={() => setLevel(d, l)} style={[styles.levelBtn, settings.drills[d].level === l && styles.levelBtnActive]}>
                  <Text style={settings.drills[d].level === l ? styles.levelTextActive : styles.levelText}>{l}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
      <Text style={styles.sectionTitle}>Input method</Text>
      <View style={styles.levels}>
        {(['hybrid', 'buttons', 'piano'] as InputMethod[]).map((m) => (
          <Pressable key={m} onPress={() => setSettings({ ...settings, inputMethod: m })} style={[styles.levelBtn, settings.inputMethod === m && styles.levelBtnActive]}>
            <Text style={settings.inputMethod === m ? styles.levelTextActive : styles.levelText}>{m}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={confirmResetMissed} style={styles.resetBtn}><Text style={styles.resetText}>Reset missed queue ({missedQueue.length})</Text></Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  drill: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#222' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#fff', fontSize: 16, textTransform: 'capitalize' },
  levels: { flexDirection: 'row', gap: 8, marginTop: 8 },
  levelBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#1a1d24', borderRadius: 8 },
  levelBtnActive: { backgroundColor: '#6c8cff' },
  levelText: { color: '#9aa0aa' },
  levelTextActive: { color: '#fff', fontWeight: '700' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  resetBtn: { marginTop: 24, paddingVertical: 12, backgroundColor: '#ff5c5c', borderRadius: 8, alignItems: 'center' },
  resetText: { color: '#fff', fontWeight: '700' },
});
