import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function IdosoCard({ idoso, onView, onEdit, onDelete }) {
  const { activeColors: c, scale } = useAccessibility();

  function calcularIdade(dataNasc) {
    if (!dataNasc) return '?';
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  const isInactive = idoso.inativo || idoso.falecido;
  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusColor = idoso.falecido ? c.textSecondary : idoso.inativo ? '#F59E0B' : c.success;

  return (
    <View style={[styles.card, { backgroundColor: c.white }, isInactive && styles.cardInactive]}>
      {idoso.fotoUrl ? (
        <Image source={{ uri: idoso.fotoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: c.surface }]}>
          <Feather name="user" size={28} color={c.textSecondary} />
        </View>
      )}

      <Text style={[styles.name, { color: c.textPrimary, fontSize: scale(13) }]} numberOfLines={1}>{idoso.nome}</Text>
      <Text style={[styles.info, { color: c.textSecondary, fontSize: scale(11) }]}>
        {idoso.sexo === 'Masculino' ? 'M' : idoso.sexo === 'Feminino' ? 'F' : '-'} | {calcularIdade(idoso.dataNascimento)} anos
      </Text>

      <View style={[styles.badge, { backgroundColor: statusColor }]}>
        <Text style={[styles.badgeText, { fontSize: scale(10) }]}>{statusLabel}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onView} style={[styles.actionBtn, { backgroundColor: c.surface }]}>
          <Feather name="eye" size={16} color={c.primary} />
        </Pressable>
        <Pressable onPress={onEdit} style={[styles.actionBtn, { backgroundColor: c.surface }]}>
          <Feather name="edit-2" size={16} color={c.primary} />
        </Pressable>
        <Pressable onPress={onDelete} style={[styles.actionBtn, { backgroundColor: c.surface }]}>
          <Feather name="trash-2" size={16} color={c.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 14, padding: 12, margin: 4,
    alignItems: 'center', elevation: 2,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  },
  cardInactive: { opacity: 0.6 },
  photo: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  info: { fontSize: 11, marginTop: 2 },
  badge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 8, gap: 8 },
  actionBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
