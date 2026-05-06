import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

const ICONS = {
  success: 'check-circle',
  error:   'x-circle',
  warn:    'alert-triangle',
  info:    'bell',
};

export default function Toast({ visible, message, type = 'info', onHide, duration = 2500 }) {
  const { activeColors: c, scale } = useAccessibility();
  const opacity = useRef(new Animated.Value(0)).current;

  const COLORS = {
    success: c.success || '#16a34a',
    error:   c.danger  || '#dc2626',
    warn:    '#d97706',
    info:    c.primary,
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
          .start(() => onHide && onHide());
      }, duration);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  const bg = COLORS[type] || COLORS.info;
  const icon = ICONS[type] || ICONS.info;

  return (
    <Animated.View style={[styles.wrapper, { opacity, backgroundColor: bg }]} pointerEvents="none">
      <Feather name={icon} size={18} color="#fff" />
      <Text style={[styles.text, { fontSize: scale(13) }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', top: 80, left: 16, right: 16, zIndex: 1000,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, elevation: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  text: { color: '#fff', fontWeight: '700', flex: 1 },
});
