import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function EmptyState({ icon = 'inbox', title, subtitle }) {
  const { activeColors: c, scale } = useAccessibility();
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [opacity, scaleAnim, float]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={{ transform: [{ translateY: floatY }] }}>
        <Feather name={icon} size={48} color={c.border} />
      </Animated.View>
      {!!title && <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(15) }]}>{title}</Text>}
      {!!subtitle && <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: scale(12) }]}>{subtitle}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 15, fontWeight: '700', marginTop: 12 },
  subtitle: { fontSize: 12, marginTop: 4, textAlign: 'center' },
});
