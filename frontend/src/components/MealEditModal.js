import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, Modal, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { updateCardapio } from '../services/cardapioService';
import colors from '../theme/colors';

const TIPOS = [
  { key: 'cafe', label: 'Cafe da Manha' },
  { key: 'almoco', label: 'Almoco' },
  { key: 'jantar', label: 'Jantar' },
];

export default function MealEditModal({ visible, onClose, dia, meals, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meals) {
      const initial = {};
      TIPOS.forEach(({ key }) => {
        initial[key] = {
          prato: meals[key]?.prato || '',
          calorias: meals[key]?.calorias?.toString() || '',
        };
      });
      setForm(initial);
    }
  }, [meals, visible]);

  function updateMeal(tipo, field, value) {
    setForm((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [field]: value },
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      const items = TIPOS.map(({ key }) => ({
        dia,
        tipo: key,
        prato: form[key]?.prato || '',
        calorias: parseInt(form[key]?.calorias) || 0,
      }));
      await updateCardapio(items);
      onSaved?.();
      onClose();
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar o cardapio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Editar {dia}</Text>

          {TIPOS.map(({ key, label }) => (
            <View key={key} style={styles.mealSection}>
              <Text style={styles.mealLabel}>{label}</Text>
              <TextInput
                value={form[key]?.prato || ''}
                onChangeText={(v) => updateMeal(key, 'prato', v)}
                placeholder="Nome do prato"
                style={styles.input}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                value={form[key]?.calorias || ''}
                onChangeText={(v) => updateMeal(key, 'calorias', v)}
                placeholder="Calorias"
                keyboardType="number-pad"
                style={[styles.input, { marginTop: 4 }]}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Salvar</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 30,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  mealSection: { marginBottom: 12 },
  mealLabel: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, borderWidth: 1, borderColor: colors.border, fontSize: 14,
  },
  saveBtn: {
    marginTop: 16, backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: colors.textSecondary, fontSize: 14 },
});
