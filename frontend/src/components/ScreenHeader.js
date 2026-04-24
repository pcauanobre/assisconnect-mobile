import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

const HEADER_HEIGHT = 56;

export default function ScreenHeader({ title, onBack }) {
  const { activeColors } = useAccessibility();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 0 : insets.top;

  return (
    <View style={[
      styles.header,
      { height: HEADER_HEIGHT + topPadding, paddingTop: topPadding, backgroundColor: activeColors.primary },
    ]}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
      )}
      <Text style={[styles.title, { color: '#fff' }]}>{title}</Text>
    </View>
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
