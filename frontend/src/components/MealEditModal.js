import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { updateCardapio } from '../services/cardapioService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import BottomSheet from './BottomSheet';

const TIPOS = [
  { key: 'cafe', label: 'Café da Manhã' },
  { key: 'almoco', label: 'Almoço' },
  { key: 'jantar', label: 'Jantar' },
];

export default function MealEditModal({ visible, onClose, dia, meals, onSaved }) {
  const { activeColors: c, scale } = useAccessibility();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meals) {
      const initial = {};
      TIPOS.forEach(({ key }) => {
        initial[key] = { prato: meals[key]?.prato || '', calorias: meals[key]?.calorias?.toString() || '' };
      });
      setForm(initial);
    }
  }, [meals, visible]);

  function updateMeal(tipo, field, value) {
    setForm((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [field]: value } }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      const items = TIPOS.map(({ key }) => ({
        dia, tipo: key,
        prato: form[key]?.prato || '',
        calorias: parseInt(form[key]?.calorias) || 0,
      }));
      await updateCardapio(items);
      onSaved?.();
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o cardápio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.card, { backgroundColor: c.white }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.textPrimary }]}>Editar — {dia}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Feather name="x" size={20} color={c.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {TIPOS.map(({ key, label }) => (
            <View key={key} style={[styles.mealSection, { borderBottomColor: c.border }]}>
              <Text style={[styles.mealLabel, { color: c.primary }]}>{label}</Text>
              <TextInput
                value={form[key]?.prato || ''}
                onChangeText={(v) => updateMeal(key, 'prato', v)}
                placeholder="Nome do prato"
                style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
                placeholderTextColor={c.textSecondary}
              />
              <TextInput
                value={form[key]?.calorias || ''}
                onChangeText={(v) => updateMeal(key, 'calorias', v)}
                placeholder="Calorias (kcal)"
                keyboardType="number-pad"
                style={[styles.input, { marginTop: 6, backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
                placeholderTextColor={c.textSecondary}
              />
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <Pressable style={[styles.btn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]} onPress={onClose}>
            <Text style={[styles.btnText, { color: c.textPrimary }]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, { backgroundColor: c.primary }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={[styles.btnText, { color: '#fff' }]}>Salvar</Text>
            }
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
  body: { paddingHorizontal: 20, paddingTop: 4, maxHeight: 340 },
  mealSection: { paddingVertical: 14, borderBottomWidth: 1 },
  mealLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, fontSize: 14 },
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { fontWeight: '700', fontSize: 14 },
});
