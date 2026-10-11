# EarTrain

Ear training for musicians, covering what a music-theory aural-skills course teaches: pitch, intervals, chords, inversions, scales and modes, scale degrees (solfège) and cadences. Short **lessons** with sounds to try come before each drill, and an **Explorer** lets you build any interval, chord or scale on a keyboard and hear it.

One codebase runs everywhere:

- **Web / PWA** on GitHub Pages. Installable on phones and works offline.
- **Android app** built from the same web code with [Capacitor](https://capacitorjs.com), so it always has the same features.

All sound is synthesised in the browser with the Web Audio API (piano, soft and organ voices), so every pitch is in tune and nothing has to be downloaded.

## What's in it

| Area | Drills | Levels |
|---|---|---|
| Pitch | Higher or Lower · Note Names (perfect pitch, with or without a reference) | 4 + 5 |
| Intervals | Ascending, descending and harmonic, simple and compound | 8 |
| Chords | Qualities (triads, sus, five 7ths, mM7) played block or broken · Inversions with figured bass | 8 + 4 |
| Scales | Major, three minors, all church modes, pentatonic, blues, whole tone, octatonic | 7 |
| Harmony | Scale degrees after a I–IV–V7–I cadence · Cadences (PAC, IAC, HC, plagal, deceptive) in major and minor | 5 + 5 |

Every drill also has a **Custom** mode where you choose exactly which answers and playback styles to include.

- **Learn**: 10 lessons, each ending in a 5-question check.
- **Feedback**: after a wrong answer, *Compare* plays your answer next to the right one.
- **Review**: missed items come back after 1, 3, 7 and 16 days (spaced repetition).
- **Daily mix**: mixes questions from everything you've been practising.
- **Progress**: streak, XP, daily goal, a 14-day chart, your weakest items and stars per level.
- **Keyboard shortcuts**: 1–9 to answer, Space to replay, Enter to continue.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (theory, generators, progress / review logic)
npm run build      # type-check + production build into dist/
```

> Keep `node_modules` off OneDrive, or move the project out of OneDrive. OneDrive turns rarely used files into cloud-only placeholders, which makes `npm`, `tsc` and tests hang.

## Deploy to GitHub Pages

`.github/workflows/deploy-pages.yml` tests, builds and deploys on every push to `main`.

1. Push the repo to GitHub.
2. On GitHub, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main`. The site appears at `https://<user>.github.io/<repo>/`.

The build uses relative paths and hash routing, so it works under any repo name with no configuration. To install it on a phone, open the site and choose **Add to Home Screen** (iOS Safari) or **Install app** (Android Chrome).

## Build the Android app

Requires a JDK and the Android SDK, either Android Studio or Homebrew's `android-commandlinetools`.

```sh
npm run android        # build web, sync into android/, open Android Studio
npm run android:apk    # or build a debug APK from the command line
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

Gradle needs **JDK 21**. Newer JDKs fail with "Unsupported class file major version". With Homebrew:

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
```

If Gradle can't find the SDK, set `ANDROID_HOME` (for example `/opt/homebrew/share/android-commandlinetools`) or create `android/local.properties` with `sdk.dir=...`.

After changing web code, run `npm run build && npx cap sync` to update the native app.

## Project layout

- `src/theory/`: notes, intervals, chords, scales and harmony (Roman numerals, four-part voice leading, cadences)
- `src/audio/`: `events.ts` (pure note scheduling) and `engine.ts` (Web Audio synthesiser)
- `src/exercises/`: one module per drill, each with levels, custom options and a question generator
- `src/learn/lessons.ts`: lesson content
- `src/state/`: progress bookkeeping (stats, streaks, spaced review) and the local-storage store
- `src/ui/`: screens and components (hash router, piano keyboard, session player)
- `tests/`: Vitest unit tests

## Version 1

The original Expo / React Native app is tagged `v1-expo`. Its uncommitted GitHub Pages export setup is saved in `git stash` as "v1 Expo web/GitHub Pages export setup".

## Roadmap (phase 2)

Chord-progression dictation, melodic dictation on the keyboard, rhythm and meter, and singing with microphone pitch detection.
