import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { activeColors: c, scale } = useAccessibility();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  function animateTo(toValue) {
    Animated.timing(focusAnim, {
      toValue,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [c.border, c.primary],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.white, borderColor }]}>
      <Feather
        name="search"
        size={18}
        color={focused ? c.primary : c.textSecondary}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        placeholderTextColor={c.textSecondary}
        onFocus={() => { setFocused(true); animateTo(1); }}
        onBlur={() => { setFocused(false); animateTo(0); }}
        style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
      />
      {value?.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
        >
          <Feather name="x-circle" size={16} color={c.textSecondary} />
        </Pressable>
      )}
    </Animated.View>
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
  clearBtn: { padding: 4, marginLeft: 4 },
});
