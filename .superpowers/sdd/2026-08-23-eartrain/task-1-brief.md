# Task 1: Scaffold Expo project + TypeScript + Jest

**Files:**
- Create: `package.json`, `tsconfig.json`, `babel.config.js`, `app.json`, `App.tsx`
- Create: `jest.config.js`, `__tests__/.gitkeep`

**Interfaces:**
- Produces: a runnable `npx expo start` project; `npm test` runs Jest.

- [ ] **Step 1: Initialize the Expo project**

Run:
```bash
cd "C:/Users/ezhao/OneDrive/Desktop/Vibe/EarTrain"
npx create-expo-app@latest . --template blank-typescript
```
If prompted about the non-empty directory (it contains `docs/` and `.superpowers/`), proceed — create-expo-app won't overwrite those.

- [ ] **Step 2: Install runtime dependencies**

Run:
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler expo-av @react-native-async-storage/async-storage
```

- [ ] **Step 3: Install Jest + types for unit tests**

Run:
```bash
npm install --save-dev jest @types/jest ts-jest
npx ts-jest config:init
```

- [ ] **Step 4: Add test scripts to package.json**

Edit `package.json` `"scripts"` to include:
```json
"test": "jest",
"ts:check": "tsc --noEmit"
```

- [ ] **Step 5: Verify TypeScript + Jest baseline**

Run:
```bash
npm run ts:check
npm test
```
Expected: `ts:check` passes (no errors); Jest runs with "no tests found" (not a failure of setup).

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Expo + TS + Jest project"
```