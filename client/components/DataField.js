import React from 'react';
import { Text, TextInput, View } from 'react-native';

// O DataField recebe o rótulo (label) e o valor (value) para exibição.
export default function DataField({ label, value, styles }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        editable={false} // Mantido como somente leitura
      />
    </View>
  );
}
