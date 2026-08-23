# EarTrain

An ear-training app for musicians: train perfect pitch, interval recognition, chord recognition, and scale/mode recognition. Four tabs — **Train**, **Test**, **History**, **Settings** — with configurable drills, difficulty levels, and answer input (buttons or a tappable piano).

Built with Expo 57 + React Native + TypeScript. Audio is generated locally (additive-synthesis WAV samples, MIDI 60–83) — no external assets.

## Quick test in Expo Go

1. `npm install`
2. `npx expo start`
3. Install **Expo Go** from the Play Store, then scan the QR code shown in the terminal.

> The app plays sound, so make sure your phone isn't muted. Audio samples are generated on first setup via `npm run gen-samples` (already committed, so no action needed).

## Build an installable APK (EAS)

1. `npm install -g eas-cli`
2. `eas login` (create a free Expo account if you don't have one)
3. `eas build:configure`
4. `eas build -p android --profile preview`
5. When the build finishes, download the `.apk` from the Expo dashboard.
6. On your phone, enable **"install from unknown sources"**, then open the `.apk` to install.

## Scripts

- `npm test` — run the Jest unit tests (pure logic: types, MIDI, presets, formulas, generators, missed queue, tips, storage, history, scoring, audio math).
- `npm run ts:check` — TypeScript type-check (`tsc --noEmit`).
- `npm run gen-samples` — regenerate the 24 WAV piano samples (MIDI 60–83) into `src/audio/samples/`.

## Project layout

- `src/types/` — core domain types (`DrillItem`, `Settings`, `MissedItem`, `HistoryEntry`, `HighScores`).
- `src/drills/` — presets, chord/scale formulas, and the drill generators (`generateItem`).
- `src/utils/` — MIDI helpers, missed-queue logic, storage, history rollup, scoring.
- `src/audio/` — `AudioEngine` (expo-av playback) + generated samples.
- `src/data/` — mnemonic tip lookup.
- `src/context/` — `AppStateProvider` (settings, missed queue, history, high scores).
- `src/components/` — `QuestionCard`, `AnswerButtons`, `PianoKeyboard`, `TipPanel`, `ScreenWrapper`.
- `src/screens/` — `TrainScreen`, `TestScreen`, `HistoryScreen`, `SettingsScreen`.
- `src/navigation/` — bottom-tab navigator.

## Known v1 simplifications

- The missed-queue pull regenerates a fresh item of the same drill rather than replaying the exact missed note/chord; a v2 should map `key → regenerate-by-key`.
- The piano keyboard renders white keys only (fine for Easy pitch); Medium/Hard pitch would need a black-key overlay.
- Per-attempt seconds in history is a fixed 5s estimate, not measured duration.
