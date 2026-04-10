import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const HEADER_HEIGHT = 56;

export default function ScreenHeader({ title }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 0 : insets.top;

  return (
    <View style={[styles.header, { height: HEADER_HEIGHT + topPadding, paddingTop: topPadding }]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
