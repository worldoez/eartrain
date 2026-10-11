// Extends app.json. EXPO_BASE_URL lets the web build live under a sub-path,
// e.g. https://<user>.github.io/<repo>/ on GitHub Pages (set by the deploy workflow).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || '',
  },
});
