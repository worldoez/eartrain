import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppState } from '../context/AppStateContext';
import { HistoryEntry } from '../types';

export function HistoryScreen() {
  const { history } = useAppState();
  const rows = Object.values(history).sort((a, b) => b.date.localeCompare(a.date));

  const renderRow = ({ item: e }: { item: HistoryEntry }) => {
    const acc = e.attempts ? Math.round((e.correct / e.attempts) * 100) : 0;
    return (
      <View style={styles.row}>
        <Text style={styles.date}>{e.date}</Text>
        <Text style={styles.cell}>{e.attempts} attempts</Text>
        <Text style={styles.cell}>{acc}%</Text>
        <Text style={styles.cell}>Best: {e.bestTestScore}%</Text>
        <Text style={styles.cell}>{Math.round(e.secondsPracticed / 60)}m</Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>History</Text>
      <FlatList data={rows} keyExtractor={(e) => e.date} renderItem={renderRow} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#222' },
  date: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cell: { color: '#9aa0aa', fontSize: 14, marginTop: 2 },
});
