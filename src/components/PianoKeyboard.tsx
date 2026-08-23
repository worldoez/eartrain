import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';
import { MIDI_MIN, MIDI_MAX, isWhiteKey, midiToName } from '../utils/midi';

export function PianoKeyboard({ onPick, locked, correctMidi, lastPick }: {
  onPick: (midi: number, correct: boolean) => void;
  locked?: boolean;
  correctMidi?: number | null;
  lastPick?: number | null;
}) {
  const whites: number[] = [];
  for (let m = MIDI_MIN; m <= MIDI_MAX; m++) if (isWhiteKey(m)) whites.push(m);
  const whiteWidth = (Dimensions.get('window').width - 32) / whites.length;

  const bgFor = (midi: number) => {
    if (!locked) return Colors.keyWhite;
    if (midi === correctMidi) return Colors.correct;
    if (midi === lastPick) return Colors.wrong;
    return Colors.keyWhite;
  };

  return (
    <View style={styles.board}>
      <View style={{ flexDirection: 'row' }}>
        {whites.map((m) => (
          <Pressable key={m} disabled={locked} onPress={() => onPick(m, m === correctMidi)} style={[styles.white, { width: whiteWidth, backgroundColor: bgFor(m) }]}>
            <Text style={styles.whiteLabel}>{midiToName(m)}</Text>
          </Pressable>
        ))}
      </View>
      {/* black keys overlaid omitted for brevity in v1; white-key-only keyboard is acceptable for Easy pitch.
          Add black-key overlay in a follow-up if Medium/Hard pitch needs it. */}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { height: 140, borderRadius: 8, overflow: 'hidden' },
  white: { height: 140, borderRightWidth: 1, borderColor: '#333', justifyContent: 'flex-end', paddingBottom: 6, alignItems: 'center' },
  whiteLabel: { fontSize: 10, color: '#333' },
});
