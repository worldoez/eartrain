import type { CapacitorConfig } from '@capacitor/cli';

// The native Android app wraps the same web build that is deployed to
// GitHub Pages, so both always have identical features.
const config: CapacitorConfig = {
  appId: 'com.eartrain.app',
  appName: 'EarTrain',
  webDir: 'dist',
  backgroundColor: '#0b0d14',
};

export default config;
