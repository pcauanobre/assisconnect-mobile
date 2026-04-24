import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function Toast({ visible, message, type = 'info', onHide, duration = 2500 }) {
  const opacity = useRef(new Animated.Value(0)).current;

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

  const bg = type === 'success' ? colors.success
    : type === 'error' ? colors.danger
    : type === 'warn' ? '#d97706'
    : colors.primary;

  const icon = type === 'success' ? 'check-circle'
    : type === 'error' ? 'x-circle'
    : type === 'warn' ? 'alert-triangle'
    : 'bell';

  return (
    <Animated.View style={[styles.wrapper, { opacity, backgroundColor: bg }]} pointerEvents="none">
      <Feather name={icon} size={18} color={colors.white} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', top: 80, left: 20, right: 20, zIndex: 1000,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 10, elevation: 5,
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  text: { color: colors.white, fontWeight: '700', flex: 1, fontSize: 13 },
});
