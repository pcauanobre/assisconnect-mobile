import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
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
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef(null);

  const COLORS = {
    success: c.success || '#16a34a',
    error:   c.danger  || '#dc2626',
    warn:    '#d97706',
    info:    c.primary,
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 110, friction: 9, useNativeDriver: true }),
      ]).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 250, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ]).start(({ finished }) => {
          if (finished) {
            setMounted(false);
            onHide && onHide();
          }
        });
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible, duration, onHide, opacity, translateY]);

  if (!mounted) return null;

  const bg = COLORS[type] || COLORS.info;
  const icon = ICONS[type] || ICONS.info;

  return (
    <Animated.View
      style={[styles.wrapper, { opacity, transform: [{ translateY }], backgroundColor: bg }]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
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
