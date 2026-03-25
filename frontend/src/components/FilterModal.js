import React, { useState } from 'react';
import {
  View, Text, Pressable, Modal, StyleSheet, TextInput,
} from 'react-native';
import colors from '../theme/colors';

const SEXO_OPTIONS = ['Todos', 'Masculino', 'Feminino'];
const STATUS_OPTIONS = ['Todos', 'Ativo', 'Inativo', 'Falecido'];

export default function FilterModal({ visible, onClose, onApply, initialFilters }) {
  const [sexo, setSexo] = useState(initialFilters?.sexo || 'Todos');
  const [status, setStatus] = useState(initialFilters?.status || 'Todos');
  const [idadeMin, setIdadeMin] = useState(initialFilters?.idadeMin || '');
  const [idadeMax, setIdadeMax] = useState(initialFilters?.idadeMax || '');

  function handleApply() {
    onApply({ sexo, status, idadeMin, idadeMax });
    onClose();
  }

  function handleClear() {
    setSexo('Todos');
    setStatus('Todos');
    setIdadeMin('');
    setIdadeMax('');
    onApply({ sexo: 'Todos', status: 'Todos', idadeMin: '', idadeMax: '' });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Filtros</Text>

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.optionRow}>
            {SEXO_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, sexo === opt && styles.chipActive]}
                onPress={() => setSexo(opt)}
              >
                <Text style={[styles.chipText, sexo === opt && styles.chipTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Status</Text>
          <View style={styles.optionRow}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, status === opt && styles.chipActive]}
                onPress={() => setStatus(opt)}
              >
                <Text style={[styles.chipText, status === opt && styles.chipTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Faixa Etaria</Text>
          <View style={styles.ageRow}>
            <TextInput
              value={idadeMin}
              onChangeText={setIdadeMin}
              placeholder="Min"
              keyboardType="number-pad"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              value={idadeMax}
              onChangeText={setIdadeMax}
              placeholder="Max"
              keyboardType="number-pad"
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, styles.btnClear]} onPress={handleClear}>
              <Text style={styles.btnClearText}>Limpar</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnApply]} onPress={handleApply}>
              <Text style={styles.btnApplyText}>Aplicar</Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 30,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textPrimary },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  ageRow: { flexDirection: 'row' },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14,
  },
  btnRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnClear: { backgroundColor: colors.surface },
  btnApply: { backgroundColor: colors.primary },
  btnClearText: { color: colors.textPrimary, fontWeight: '700' },
  btnApplyText: { color: colors.white, fontWeight: '700' },
  closeText: { textAlign: 'center', marginTop: 12, color: colors.textSecondary, fontSize: 14 },
});
