import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export function AnswerButtons({ options, correctAnswer, onPick, locked, lastPick }: {
  options: string[];
  correctAnswer: string;
  onPick: (label: string, correct: boolean) => void;
  locked?: boolean;
  lastPick?: string | null;
}) {
  return (
    <View style={styles.grid}>
      {options.map((o) => {
        const isCorrect = o === correctAnswer;
        const isPicked = o === lastPick;
        const bg = locked ? (isCorrect ? Colors.correct : isPicked ? Colors.wrong : Colors.surface) : Colors.surface;
        return (
          <Pressable key={o} disabled={locked} onPress={() => onPick(o, isCorrect)} style={[styles.btn, { backgroundColor: bg }]}>
            <Text style={styles.label}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { minWidth: 72, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  label: { color: Colors.text, fontSize: 16, fontWeight: '600' },
});
