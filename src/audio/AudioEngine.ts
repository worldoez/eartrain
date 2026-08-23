import { Audio } from 'expo-av';
import { MIDI_MIN, MIDI_MAX } from '../utils/midi';
import { midiToFreq } from './midi';

export { midiToFreq };

// Static require map (Metro does not resolve dynamic requires).
// Keys are MIDI numbers 60..83, values are the generated WAV assets.
const SAMPLES: Record<number, number> = {
  60: require('./samples/60.wav'), 61: require('./samples/61.wav'),
  62: require('./samples/62.wav'), 63: require('./samples/63.wav'),
  64: require('./samples/64.wav'), 65: require('./samples/65.wav'),
  66: require('./samples/66.wav'), 67: require('./samples/67.wav'),
  68: require('./samples/68.wav'), 69: require('./samples/69.wav'),
  70: require('./samples/70.wav'), 71: require('./samples/71.wav'),
  72: require('./samples/72.wav'), 73: require('./samples/73.wav'),
  74: require('./samples/74.wav'), 75: require('./samples/75.wav'),
  76: require('./samples/76.wav'), 77: require('./samples/77.wav'),
  78: require('./samples/78.wav'), 79: require('./samples/79.wav'),
  80: require('./samples/80.wav'), 81: require('./samples/81.wav'),
  82: require('./samples/82.wav'), 83: require('./samples/83.wav'),
};

class AudioEngine {
  private sounds: Map<number, Audio.Sound> = new Map();
  private loaded = false;

  async init(): Promise<void> {
    if (this.loaded) return;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      const { sound } = await Audio.Sound.createAsync(SAMPLES[midi]);
      this.sounds.set(midi, sound);
    }
    this.loaded = true;
  }

  private async playOne(midi: number): Promise<void> {
    const sound = this.sounds.get(midi);
    if (!sound) return;
    await sound.replayAsync();
  }

  async playNote(midi: number): Promise<void> { await this.playOne(midi); }

  async playNotesSimultaneous(midi: number[]): Promise<void> {
    await Promise.all(midi.map((m) => this.playOne(m)));
  }

  async playSequence(midi: number[], gapMs: number): Promise<void> {
    for (const m of midi) {
      await this.playOne(m);
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}

export const audioEngine = new AudioEngine();
