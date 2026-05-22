import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

/**
 * Floating Action Button com entrada por mola + squeeze ao tocar.
 * Pode mostrar badge numérico opcional.
 */
export default function FAB({
  icon = 'plus',
  onPress,
  color,
  badge,
  accessibilityLabel = 'Ação principal',
}) {
  const { activeColors: c } = useAccessibility();
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
      delay: 120,
    }).start();
  }, [enter]);

  const bg = color || c.primary;
  const enterScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const opacity = enter.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 1] });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(press, { toValue: 0.9, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: bg, opacity, transform: [{ scale: Animated.multiply(enterScale, press) }] },
          ]}
        >
          <Feather name={icon} size={24} color="#fff" />
          {badge != null && badge > 0 && (
            <View style={[styles.badge, { borderColor: c.surface }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 20, right: 20,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2,
    backgroundColor: '#e5302a',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
