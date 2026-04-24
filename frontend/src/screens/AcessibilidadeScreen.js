import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import colors, { highContrastColors } from '../theme/colors';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AcessibilidadeScreen() {
  const { config, setFontScale, setHighContrast, scale } = useAccessibility();
  const c = config.highContrast ? highContrastColors : colors;

  const ESCALAS = [
    { valor: 1, label: 'Padrao' },
    { valor: 1.15, label: 'Grande' },
    { valor: 1.3, label: 'Muito grande' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScreenHeader title="Acessibilidade" />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={[styles.section, { backgroundColor: c.white, borderColor: c.border }]}>
          <Text style={[styles.title, { fontSize: scale(15), color: c.primary }]}>
            Tamanho da fonte
          </Text>
          <Text style={[styles.sub, { fontSize: scale(12), color: c.textSecondary }]}>
            Aumente o tamanho do texto para facilitar a leitura.
          </Text>

          <View style={styles.chipsRow}>
            {ESCALAS.map((e) => (
              <TouchableOpacity
                key={e.valor}
                style={[
                  styles.chip,
                  { borderColor: c.border, backgroundColor: c.white },
                  config.fontScale === e.valor && { backgroundColor: c.primary, borderColor: c.primary },
                ]}
                onPress={() => setFontScale(e.valor)}
              >
                <Text
                  style={[
                    { fontSize: scale(13), color: c.textPrimary },
                    config.fontScale === e.valor && { color: c.white, fontWeight: '700' },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.preview, { backgroundColor: c.surface }]}>
            <Text style={[styles.previewText, { fontSize: scale(14), color: c.textPrimary }]}>
              Exemplo: texto do aplicativo
            </Text>
            <Text style={[styles.previewTitle, { fontSize: scale(18), color: c.primary }]}>
              Titulo de exemplo
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: c.white, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: scale(15), color: c.primary }]}>
                Alto contraste
              </Text>
              <Text style={[styles.sub, { fontSize: scale(12), color: c.textSecondary }]}>
                Cores mais fortes, bordas mais visiveis, leitura facilitada.
              </Text>
            </View>
            <Switch
              value={config.highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#ccc', true: c.primary }}
            />
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.accent }]}>
          <Feather name="info" size={16} color={c.primary} />
          <Text style={[styles.infoText, { fontSize: scale(12), color: c.textPrimary }]}>
            As preferencias sao salvas no dispositivo e aplicadas em todas as telas do app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontWeight: '800' },
  sub: { marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  preview: { marginTop: 12, padding: 12, borderRadius: 8 },
  previewText: { marginBottom: 4 },
  previewTitle: { fontWeight: '800' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 8, marginTop: 4,
  },
  infoText: { flex: 1 },
});
