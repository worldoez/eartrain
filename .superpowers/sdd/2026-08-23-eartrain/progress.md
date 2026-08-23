# SDD ledger — plan: docs/superpowers/plans/2026-08-23-eartrain.md

## Preflight rulings

- Ruling: Audio samples will be GENERATED, not sourced. — The user asked
  for me to make the audio and whether a library exists. Chose to generate 24
  WAV files (C4–B5, MIDI 60–83) via a Node additive-synthesis script
  (fundamental + decaying harmonics + ADSR) instead of (a) sourcing external
  licensed piano MP3s or (b) runtime synthesis via react-native-audio-api. —
  Why: perfect intonation by construction (load-bearing for ear training),
  no external/licensed assets, no extra native dependency, and keeps the
  Expo Go testing flow intact (react-native-audio-api needs a custom dev
  build and breaks Expo Go). Cost if wrong: the synthesized tone is less rich
  than a sampled real piano; if the user finds it too thin for interval/chord
  recognition, the fix is to swap the generator's harmonic profile or later
  drop in real samples — the AudioEngine interface is unchanged either way.

- Ruling: Work in-place in the EarTrain directory, no git worktree. — The
  repo does not exist yet; Task 1 itself runs `git init`. The worktree skill
  assumes an existing repo to branch from. — Cost if wrong: none
  significant; greenfield project.

- Ruling: Manual/runtime verification steps (Expo Go on a phone, hearing
  audio) are performed by the user at the end, not by subagents. Subagents
  verify via `npm test`, `npm run ts:check`, and code review only. — Why:
  audio/phone interaction cannot run headlessly. — Cost if wrong: a
  runtime-only bug (e.g. audio not playing) would surface at user
  verification rather than in the loop; acceptable since logic is fully
  unit-tested.

## Task progress
