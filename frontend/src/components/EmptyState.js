import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function EmptyState({ icon = 'inbox', title, subtitle }) {
  const { activeColors: c, scale } = useAccessibility();
  return (
    <View style={styles.container}>
      <Feather name={icon} size={48} color={c.border} />
      {!!title && <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(15) }]}>{title}</Text>}
      {!!subtitle && <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: scale(12) }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 15, fontWeight: '700', marginTop: 12 },
  subtitle: { fontSize: 12, marginTop: 4, textAlign: 'center' },
});
