import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AcessibilidadeScreen({ navigation }) {
  const { config, setFontScale, setHighContrast, setDarkMode, scale, activeColors: c } = useAccessibility();

  const ESCALAS = [
    { valor: 1, label: 'Padrão' },
    { valor: 1.15, label: 'Grande' },
    { valor: 1.3, label: 'Muito grande' },
  ];

  function restaurarPadrao() {
    Alert.alert(
      'Restaurar padrões',
      'Isso vai redefinir fonte, contraste e modo escuro para os valores originais.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            setFontScale(1);
            setHighContrast(false);
            setDarkMode(false);
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScreenHeader title="Acessibilidade" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>

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
                    config.fontScale === e.valor && { color: '#fff', fontWeight: '700' },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.preview, { backgroundColor: c.surface }]}>
            <Text style={[styles.previewSub, { fontSize: scale(12), color: c.textSecondary }]}>
              Exemplo de texto secundário
            </Text>
            <Text style={[styles.previewText, { fontSize: scale(14), color: c.textPrimary }]}>
              Texto padrão do aplicativo
            </Text>
            <Text style={[styles.previewTitle, { fontSize: scale(18), color: c.primary }]}>
              Título de exemplo
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
                Cores mais fortes, bordas mais visíveis, leitura facilitada.
              </Text>
            </View>
            <Switch
              value={config.highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#ccc', true: c.primary }}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: c.white, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: scale(15), color: c.primary }]}>
                Modo escuro
              </Text>
              <Text style={[styles.sub, { fontSize: scale(12), color: c.textSecondary }]}>
                Fundo escuro para ambientes com pouca luz.
              </Text>
              {config.highContrast && (
                <View style={[styles.disabledBadge, { backgroundColor: c.accent }]}>
                  <Feather name="lock" size={11} color={c.textSecondary} />
                  <Text style={[styles.disabledText, { fontSize: scale(11), color: c.textSecondary }]}>
                    Desativado no modo alto contraste
                  </Text>
                </View>
              )}
            </View>
            <Switch
              value={config.darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ccc', true: c.primary }}
              disabled={config.highContrast}
            />
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.accent }]}>
          <Feather name="info" size={16} color={c.primary} />
          <Text style={[styles.infoText, { fontSize: scale(12), color: c.textPrimary }]}>
            As preferências são salvas no dispositivo e aplicadas em todas as telas do app.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: c.border }]}
          onPress={restaurarPadrao}
        >
          <Feather name="refresh-ccw" size={14} color={c.textSecondary} />
          <Text style={[styles.resetText, { fontSize: scale(13), color: c.textSecondary }]}>
            Restaurar padrões
          </Text>
        </TouchableOpacity>

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
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  preview: { marginTop: 12, padding: 12, borderRadius: 8, gap: 4 },
  previewSub: {},
  previewText: { marginBottom: 2 },
  previewTitle: { fontWeight: '800' },
  disabledBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  disabledText: {},
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 8, marginTop: 4,
  },
  infoText: { flex: 1 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
  },
  resetText: {},
});
