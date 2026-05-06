import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import BottomSheet from './BottomSheet';

const SEXO_OPTIONS = ['Todos', 'Masculino', 'Feminino'];
const STATUS_OPTIONS = ['Todos', 'Ativo', 'Inativo', 'Falecido'];

export default function FilterModal({ visible, onClose, onApply, initialFilters }) {
  const { activeColors: c, scale } = useAccessibility();
  const [sexo, setSexo] = useState(initialFilters?.sexo || 'Todos');
  const [status, setStatus] = useState(initialFilters?.status || 'Todos');
  const [idadeMin, setIdadeMin] = useState(initialFilters?.idadeMin || '');
  const [idadeMax, setIdadeMax] = useState(initialFilters?.idadeMax || '');

  function handleApply() { onApply({ sexo, status, idadeMin, idadeMax }); onClose(); }
  function handleClear() {
    setSexo('Todos'); setStatus('Todos'); setIdadeMin(''); setIdadeMax('');
    onApply({ sexo: 'Todos', status: 'Todos', idadeMin: '', idadeMax: '' });
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.card, { backgroundColor: c.white }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Filtros</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Feather name="x" size={20} color={c.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>SEXO</Text>
          <View style={styles.chips}>
            {SEXO_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, { borderColor: c.border, backgroundColor: c.surface },
                  sexo === opt && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => setSexo(opt)}
              >
                <Text style={[styles.chipText, { color: c.textSecondary },
                  sexo === opt && { color: '#fff', fontWeight: '700' }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 14 }]}>STATUS</Text>
          <View style={styles.chips}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, { borderColor: c.border, backgroundColor: c.surface },
                  status === opt && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => setStatus(opt)}
              >
                <Text style={[styles.chipText, { color: c.textSecondary },
                  status === opt && { color: '#fff', fontWeight: '700' }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 14 }]}>FAIXA ETÁRIA</Text>
          <View style={styles.ageRow}>
            <TextInput value={idadeMin} onChangeText={setIdadeMin} placeholder="Mín" keyboardType="number-pad"
              style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
              placeholderTextColor={c.textSecondary} />
            <TextInput value={idadeMax} onChangeText={setIdadeMax} placeholder="Máx" keyboardType="number-pad"
              style={[styles.input, { flex: 1, backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
              placeholderTextColor={c.textSecondary} />
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <Pressable style={[styles.btn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]} onPress={handleClear}>
            <Text style={[styles.btnText, { color: c.textPrimary }]}>Limpar</Text>
          </Pressable>
          <Pressable style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleApply}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Aplicar</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '800' },
  closeBtn: { padding: 4 },
  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  ageRow: { flexDirection: 'row' },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, fontSize: 14 },
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { fontWeight: '700', fontSize: 14 },
});
