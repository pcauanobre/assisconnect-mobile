import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function LoadingOverlay() {
  const { activeColors: c } = useAccessibility();
  return (
    <View style={[styles.overlay, { backgroundColor: c.surface }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
