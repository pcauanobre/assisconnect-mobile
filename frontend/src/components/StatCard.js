import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function StatCard({ icon, label, value, color }) {
  const { activeColors: c, scale } = useAccessibility();
  const [display, setDisplay] = useState(0);
  const entrance = useRef(new Animated.Value(0)).current;
  const counter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    const target = Number(value) || 0;
    counter.setValue(0);
    const id = counter.addListener(({ value: v }) => {
      setDisplay(Math.round(v * target));
    });
    Animated.timing(counter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => counter.removeListener(id);
  }, [value, counter]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: c.white, opacity: entrance, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: color || c.primary }]}>
        <Feather name={icon} size={22} color="#fff" />
      </View>
      <Text style={[styles.value, { color: c.textPrimary, fontSize: scale(26) }]}>
        {value == null ? '-' : display}
      </Text>
      <Text style={[styles.label, { color: c.textSecondary, fontSize: scale(11) }]}>{label}</Text>
    </Animated.View>
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
