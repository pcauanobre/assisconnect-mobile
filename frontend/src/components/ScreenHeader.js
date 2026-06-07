import React, { useEffect, useRef } from 'react';
import { StyleSheet, Platform, Pressable, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

const HEADER_HEIGHT = 56;

export default function ScreenHeader({ title, onBack }) {
  const { activeColors, scale } = useAccessibility();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 0 : insets.top;

  const enter = useRef(new Animated.Value(0)).current;
  const backScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const titleOpacity = enter;
  const titleTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <Animated.View style={[
      styles.header,
      { height: HEADER_HEIGHT + topPadding, paddingTop: topPadding, backgroundColor: activeColors.primary },
    ]}>
      {onBack && (
        <Pressable
          onPress={onBack}
          onPressIn={() => Animated.spring(backScale, { toValue: 0.85, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(backScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
          style={styles.backBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Animated.View>
        </Pressable>
      )}
      <Animated.Text
        style={[
          styles.title,
          { color: '#fff', fontSize: scale(18), opacity: titleOpacity, transform: [{ translateY: titleTranslate }] },
        ]}
      >
        {title}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    bottom: 0,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
