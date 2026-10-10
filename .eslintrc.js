module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Small layout tweaks are written inline for readability.
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
  },
};
