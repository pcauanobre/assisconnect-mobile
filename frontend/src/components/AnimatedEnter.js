import React, { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const MAX_STAGGER_INDEX = 8;
const STAGGER_STEP_MS = 60;

export default function AnimatedEnter({
  index = 0,
  delay = 0,
  duration = 320,
  translateFrom = 12,
  style,
  children,
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      progress.setValue(0);
      const cappedIndex = Math.min(index, MAX_STAGGER_INDEX);
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay: delay + cappedIndex * STAGGER_STEP_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return undefined;
    }, [progress, index, delay, duration])
  );

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [translateFrom, 0],
  });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
