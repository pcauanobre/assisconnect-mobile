import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function EmptyState({ icon = 'inbox', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={48} color={colors.textSecondary} />
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
