import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { activeColors: c, scale } = useAccessibility();
  return (
    <View style={[styles.container, { backgroundColor: c.white, borderColor: c.border }]}>
      <Feather name="search" size={18} color={c.textSecondary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        placeholderTextColor={c.textSecondary}
        style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, marginBottom: 12,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14 },
});
