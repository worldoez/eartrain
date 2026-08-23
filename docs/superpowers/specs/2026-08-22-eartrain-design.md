# EarTrain — Design Doc

**Date:** 2026-08-22
**Status:** Approved (design phase)
**Sister project:** QuickMaths (`C:\Users\ezhao\OneDrive\Desktop\Vibe\QuickMaths`) — same tech stack and overall shape.

## 1. Purpose

A mobile ear-training app for musicians to practice **perfect pitch, intervals, chords, and scales/modes**. Two practice modes — **Train** (untimed, endless) and **Test** (fixed count within a time cap) — plus a spaced-repetition "missed queue" that resurfaces wrong answers until mastered, and a History tab tracking daily progress. What gets tested is configurable per drill in Settings.

It deliberately mirrors the architecture of QuickMaths (Expo + TypeScript, bottom-tab navigation, AsyncStorage persistence, no backend) so the codebase stays familiar and small. The one thing QuickMaths has no analog for — **audio** — is handled by a single sample-layering engine.

## 2. Tech stack

- **Expo** (React Native + TypeScript), buildable to an Android APK via `eas build` (iOS later).
- **React Navigation** bottom tabs: Train / Test / History / Settings.
- **`expo-av`** for audio playback. Multiple `Audio.Sound` instances play simultaneously to layer chords and harmonic intervals.
- **AsyncStorage** for all persistence (settings, missed queue, history, high scores) — wrapped in a small typed storage utility.
- No backend, no auth, no analytics SDKs.
- Clean, minimal UI: large tap targets, big legible answer buttons / piano keys, since this is used quickly and repeatedly.

## 3. Screens (bottom-tab navigation)

1. **Train** — endless question stream, no timer. Play the sound, answer, immediate feedback (green flash on correct, auto-advance ~500ms; red flash on wrong, show the correct answer ~1.5s, then advance). A **Replay** button is always available here. Logs every attempt to today's history record as it goes. Runs until the user navigates away.
2. **Test** — user taps **Start** → fixed number of questions (default **20**) within a time cap (default **5 minutes**), both visible on screen. Same question flow as Train, but **one play per question** (no Replay) to keep the test honest; wrong answers don't end the run, just don't count (and still feed the missed queue). At the end: results screen showing score = **% correct**, time-to-finish as a secondary stat, and a "New High Score!" banner if beaten.
3. **History** — one row per calendar day (local device time): date, total attempts (Train + Test combined), accuracy % (correct/attempted), best Test score that day, and total time practiced. Most recent day first. A small accuracy-trend sparkline is a nice-to-have, not required.
4. **Settings** — see §6.

## 4. Drill types & difficulty presets

Each drill is independently **enabled/disabled** (at least one must stay on) and has an **Easy / Medium / Hard** selector that maps to a curated preset. When multiple drills are enabled, each question picks a uniformly random enabled drill, then a uniformly random item within that drill's active preset.

### 4.1 Pitch (identify a single note)
- **Easy:** white keys only (C, D, E, F, G, A, B), one octave (C4–B4), reference tone (a C) played before the question.
- **Medium:** all 12 notes, one octave, reference tone optional (user toggle).
- **Hard:** all 12 notes, two octaves (C4–B5), no reference tone.

### 4.2 Intervals (identify the distance between two notes)
- **Easy:** consonant set only — m3, M3, P4, P5, M6, P8. Melodic, ascending. One-octave starting range.
- **Medium:** all simple intervals (m2 through P8). Both **melodic** (notes in sequence) and **harmonic** (notes together). Ascending.
- **Hard:** all simple intervals + compound intervals (m9, M9, m10, P11, etc.). Melodic + harmonic. Ascending **and** descending. Wider starting range.

### 4.3 Chords (identify chord quality, and at Hard, inversion)
- **Easy:** major & minor triads, root position, block chords.
- **Medium:** + diminished & augmented triads, root position. Both block and arpeggiated presentation.
- **Hard:** + 7th chords (maj7, dom7, m7, m7♭5, dim7). Inversions included. Block.

### 4.4 Scales / modes (identify a played scale)
- **Easy:** major, natural minor.
- **Medium:** + harmonic minor, melodic minor, Dorian, Mixolydian.
- **Hard:** + all modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) + whole-tone, diminished, chromatic.

### Stretch drills (slot in later without restructuring)
- **Cadences** (identify I–V, IV–V–I, etc.) and **short melody dictation**. Same enable/level pattern; no architecture change needed.

## 5. Audio engine

The 24 single-note samples (C4–B5, MIDI 60–83) are **generated from math, not sourced externally** — a Node additive-synthesis script (`scripts/generate-samples.mjs`) writes 16-bit mono WAV files at 44.1 kHz: a fundamental sine at the note's exact frequency plus harmonics 2–5 (amplitude ~1/n), shaped by an ADSR envelope and an exponential decay. Because the frequencies are computed directly, **intonation is exact by construction** — essential for an ear-training app. The synthesized tone is piano-ish; a real sampled instrument can be dropped in later by swapping the sample set, with the engine interface unchanged.

A single `AudioEngine` utility (using `expo-av`, Expo-Go-compatible) exposes three primitives:

- `playNote(midi: number)` — one sample. Used by **Pitch**.
- `playNotesSimultaneous(midi: number[])` — multiple `Audio.Sound` instances started together. Used by **harmonic intervals** and **chords**.
- `playSequence(midi: number[], gapMs: number)` — samples started one after another. Used by **melodic intervals** and **scales**.

Every drill is built from these three primitives over the same 24 samples, so there is exactly one audio engine and the asset footprint stays small. Notes are addressed by **MIDI number** internally; the engine maps MIDI → sample file via a static require map (Metro does not resolve dynamic requires).

## 6. Settings tab

- **Drills:** per-drill enable toggle + Easy/Medium/Hard selector (Pitch, Intervals, Chords, Scales).
- **Input method:** Hybrid (default) / Buttons-only / Piano-only. *Hybrid* = piano keyboard for Pitch, multiple-choice buttons for Intervals/Chords/Scales. The user can override to a single input style for all drills.
- **Pitch reference tone:** on/off (applies to Pitch drill; always on at Easy, toggle at Medium, off at Hard).
- **Test configuration:** question count (default 20) and time cap (default 5 min).
- **Reset buttons** (with confirmation): "Reset missed-question queue" and "Reset history & high scores".
- Changes apply immediately to the next generated question.

## 7. Answer input (hybrid by default)

- **Pitch drill:** an on-screen **piano keyboard** (the same 2-octave range as the samples). The user taps the note they heard. The piano doubles as a "tap to hear" explore aid on the Train screen.
- **Intervals / Chords / Scales:** **multiple-choice buttons** showing the answer names (e.g. `m2  M2  m3  M3  P4  ♭5  P5 …` for intervals; `Major  Minor  Dim  Aug  maj7  dom7 …` for chords; `Major  Nat min  Harm min  Dorian …` for scales). Buttons are large and one-thumb friendly.
- If the user picks Buttons-only, Pitch also uses a 12-note button grid; if Piano-only, named drills present their answers as tappable note-combos on the keyboard where feasible and fall back to buttons otherwise.

## 8. Spaced repetition ("missed queue") — mirrors QuickMaths

- Every item has a **canonical string key**: `"pitch:G4"`, `"interval:m3:harmonic"`, `"chord:maj7:inv1"`, `"scale:dorian"`.
- A persisted list of missed items, each with `key`, `drill`, `correctStreak` (starts at 0), `neededStreak` (default 2).
- On each new question (Train or Test), with ~40% probability pull a weighted-random item from the missed queue (weight = inverse of `correctStreak`, so more-recently-failed items resurface more often) instead of generating fresh. Otherwise generate a fresh random item per current Settings.
- A fresh item answered incorrectly is added to the missed queue at `correctStreak = 0`.
- A missed-queue item answered correctly increments `correctStreak`; at `correctStreak >= neededStreak` it's removed (mastered). Answered incorrectly again → reset to 0.
- A small badge/icon marks questions pulled from the missed queue — purely cosmetic, doesn't affect scoring.

## 9. "How to hear it" tip panel — analog to QuickMaths' strategy explainer

A pure, deterministic lookup table of **ear-training mnemonics** — no LLM, no network. Each drill item maps to a short tip, e.g.:

- minor 3rd → "First two notes of *Greensleeves* / *Hey Jude*."
- perfect 5th → "Star Wars opening theme."
- major chord → "Bright, happy, stable."
- minor chord → "Sad, dark, somber."
- dominant 7th → "Tense, wants to resolve."

`getTip(drill, item): { name: string; tip: string }` — a static lookup, returning the mnemonic for the specific item.

**Where it shows up:**
- On any incorrect answer (Train or Test), the feedback state shows the correct answer plus an expandable "How to hear it" button that reveals the tip.
- On any Train question (even before answering), a small "How would I hear this?" icon reveals the same panel on demand.
- The panel is dismissible/collapsible so it never slows Test mode; revealing it does not pause or affect Test scoring.

## 10. Data model & persistence

A typed `storage` utility over AsyncStorage (same pattern as QuickMaths):

- **`settings`** — enabled drills, per-drill levels, input method, reference-tone toggle, test count & time cap.
- **`missedQueue`** — array of `{ key, drill, correctStreak, neededStreak }`.
- **`history`** — keyed by `YYYY-MM-DD`; each entry holds `{ attempts, correct, bestTestScore, secondsPracticed }`.
- **`highScores`** — a dictionary keyed by a hash/string of the active drill config (so changing settings doesn't overwrite an unrelated high score), **plus** one overall global high score.

App state is held in a React Context (`AppStateContext`), loaded once on startup and persisted on change, mirroring QuickMaths.

## 11. File structure (planned)

```
App.tsx
src/
  components/
    CustomTabBar.tsx
    QuestionCard.tsx        // play button + feedback state
    AnswerButtons.tsx       // multiple-choice answer grid
    PianoKeyboard.tsx       // 2-octave tappable piano (Pitch input + explore)
    TipPanel.tsx            // "How to hear it" mnemonic panel
    ScreenWrapper.tsx
  constants/
    colors.ts
  context/
    AppStateContext.tsx
  navigation/
    AppNavigator.tsx
  screens/
    TrainScreen.tsx
    TestScreen.tsx
    HistoryScreen.tsx
    SettingsScreen.tsx
  audio/
    samples/                // ~24 piano-note files (C4–B5)
    AudioEngine.ts          // playNote / playNotesSimultaneous / playSequence
  drills/
    index.ts                // drill registry: generate, presets, answer sets
    pitch.ts
    intervals.ts
    chords.ts
    scales.ts
    presets.ts              // Easy/Medium/Hard definitions per drill
  data/
    tips.ts                 // mnemonic lookup table (getTip)
  types/
    index.ts
  utils/
    storage.ts
    history.ts
    missedQueue.ts          // missed-queue logic (pure, testable)
    scoring.ts              // test scoring + high-score keying
    midi.ts                 // MIDI <-> note name helpers
```

## 12. Testing

Pure logic units are unit-testable with no audio and no native dependencies:

- **Drill generation & preset expansion** — given a drill + level, the generator produces valid items within the preset's bounds.
- **Missed-queue logic** — add, promote, master, reset, weighted-random pull.
- **Mnemonic lookup** — `getTip` returns the right tip for each item.
- **Scoring & high-score keying** — config-hash is stable for the same settings, distinct for different settings.
- **History rollup** — per-day aggregation of attempts/accuracy.

The `AudioEngine` is the only module that touches native audio and is verified manually (`npx expo start` + Expo Go).

## 13. Deliverable

Scaffold the full Expo project, implement all screens, drills, the audio engine, the missed-queue, and the mnemonic tip panel — then confirm it runs with `npx expo start`. Provide step-by-step commands for (1) quick testing via Expo Go and (2) producing an installable Android APK via EAS Build, mirroring the QuickMaths handoff.