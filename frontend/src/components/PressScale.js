import React, { useRef } from 'react';
import { Pressable, Animated } from 'react-native';

/**
 * Pressable com feedback de escala (squeeze) no toque.
 * Usa native driver — não bloqueia a thread JS.
 */
export default function PressScale({
  children,
  style,
  onPress,
  onLongPress,
  disabled,
  minScale = 0.95,
  hitSlop,
  accessibilityRole,
  accessibilityLabel,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: minScale, useNativeDriver: true, tension: 200, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }).start()}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
