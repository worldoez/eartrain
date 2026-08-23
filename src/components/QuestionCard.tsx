import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { DrillItem } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { AnswerButtons } from './AnswerButtons';
import { PianoKeyboard } from './PianoKeyboard';
import { TipPanel } from './TipPanel';

export function QuestionCard({ item, onAnswered, showReplay, showTip, inputMode }: {
  item: DrillItem;
  onAnswered: (correct: boolean) => void;
  showReplay: boolean;
  showTip: boolean;
  inputMode: 'buttons' | 'piano';
}) {
  const [locked, setLocked] = useState(false);
  const [lastPick, setLastPick] = useState<string | number | null>(null);

  const play = async () => {
    if (item.isHarmonic) await audioEngine.playNotesSimultaneous(item.answerMidi);
    else if (item.drill === 'scales') await audioEngine.playSequence(item.answerMidi, 400);
    else if (item.drill === 'intervals') await audioEngine.playSequence(item.answerMidi, 300);
    else await audioEngine.playNote(item.answerMidi[0]);
  };

  useEffect(() => { play(); }, [item.key]);

  const handlePick = (label: string | number, correct: boolean) => {
    setLocked(true);
    setLastPick(label);
    setTimeout(() => onAnswered(correct), correct ? 500 : 1500);
  };

  return (
    <View>
      <Pressable onPress={play} style={styles.playBtn}><Text style={styles.playText}>▶ Play</Text></Pressable>
      {showReplay && <Pressable onPress={play} style={styles.replay}><Text style={styles.replayText}>Replay</Text></Pressable>}
      {inputMode === 'piano' ? (
        <PianoKeyboard onPick={(midi, correct) => handlePick(midi, correct)} locked={locked} correctMidi={item.answerMidi[0]} lastPick={lastPick as number | null} />
      ) : (
        <AnswerButtons options={item.answerOptions} correctAnswer={item.correctAnswer} onPick={(label, correct) => handlePick(label, correct)} locked={locked} lastPick={lastPick as string | null} />
      )}
      {locked && <Text style={styles.feedback}>{item.correctAnswer === lastPick || item.answerMidi[0] === lastPick ? 'Correct!' : `Answer: ${item.display}`}</Text>}
      {showTip && <TipPanel item={item} />}
    </View>
  );
}

const styles = StyleSheet.create({
  playBtn: { alignSelf: 'center', paddingVertical: 18, paddingHorizontal: 32, backgroundColor: Colors.accent, borderRadius: 12, marginVertical: 16 },
  playText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  replay: { alignSelf: 'center', marginTop: 8 },
  replayText: { color: Colors.textMuted, fontSize: 14 },
  feedback: { color: Colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 16 },
});
