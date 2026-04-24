import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../contexts/AccessibilityContext';

const HEADER_HEIGHT = 56;

export default function ScreenHeader({ title }) {
  const { activeColors } = useAccessibility();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 0 : insets.top;

  return (
    <View style={[
      styles.header,
      { height: HEADER_HEIGHT + topPadding, paddingTop: topPadding, backgroundColor: activeColors.primary },
    ]}>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
