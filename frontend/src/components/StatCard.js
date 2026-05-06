import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function StatCard({ icon, label, value, color }) {
  const { activeColors: c, scale } = useAccessibility();
  return (
    <View style={[styles.card, { backgroundColor: c.white }]}>
      <View style={[styles.iconBox, { backgroundColor: color || c.primary }]}>
        <Feather name={icon} size={22} color="#fff" />
      </View>
      <Text style={[styles.value, { color: c.textPrimary, fontSize: scale(26) }]}>{value ?? '-'}</Text>
      <Text style={[styles.label, { color: c.textSecondary, fontSize: scale(11) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 14, padding: 14, margin: 4,
    alignItems: 'center', elevation: 2,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  value: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 11, textAlign: 'center', marginTop: 2 },
});
