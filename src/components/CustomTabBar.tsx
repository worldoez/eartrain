import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

// Thin wrapper around the default tab bar for consistent theming.
// Not wired into the navigator yet; kept for future custom tab styling.
export function CustomTabBar() {
  return <View style={styles.bar} />;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: Colors.surface },
});
