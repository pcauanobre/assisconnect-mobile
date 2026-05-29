import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';

export default function AnimatedNumber({ value, duration = 700, decimals = 0, style, prefix = '', suffix = '' }) {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;
  const counter = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    counter.setValue(0);
    const id = counter.addListener(({ value: v }) => {
      const n = v * target;
      setDisplay(decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n));
    });
    Animated.timing(counter, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => counter.removeListener(id);
  }, [target, duration, decimals, counter]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : String(display);
  return <Text style={style}>{prefix}{formatted}{suffix}</Text>;
}
