import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function PageTitle({ title }) {
  const { activeColors: c, scale } = useAccessibility();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(26) }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
