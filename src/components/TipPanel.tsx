import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { getTip } from '../data/tips';
import { DrillItem } from '../types';

export function TipPanel({ item }: { item: DrillItem }) {
  const [open, setOpen] = useState(false);
  const tip = getTip(item);
  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.toggle}>
        <Text style={styles.toggleText}>{open ? 'Hide tip' : 'How would I hear this?'}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          <Text style={styles.name}>{tip.name}</Text>
          <Text style={styles.tip}>{tip.tip}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  toggle: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: Colors.surface, borderRadius: 8 },
  toggleText: { color: Colors.accent, fontSize: 14 },
  body: { marginTop: 8, padding: 12, backgroundColor: Colors.surface, borderRadius: 8 },
  name: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  tip: { color: Colors.textMuted, fontSize: 14 },
});
