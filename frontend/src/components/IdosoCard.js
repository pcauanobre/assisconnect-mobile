import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function IdosoCard({ idoso, onView, onEdit, onDelete }) {
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
  const statusColor = idoso.falecido ? colors.textSecondary : idoso.inativo ? '#F59E0B' : colors.success;

  return (
    <View style={[styles.card, isInactive && styles.cardInactive]}>
      {idoso.fotoUrl ? (
        <Image source={{ uri: idoso.fotoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Feather name="user" size={28} color={colors.textSecondary} />
        </View>
      )}

      <Text style={styles.name} numberOfLines={1}>{idoso.nome}</Text>
      <Text style={styles.info}>
        {idoso.sexo === 'Masculino' ? 'M' : idoso.sexo === 'Feminino' ? 'F' : '-'} | {calcularIdade(idoso.dataNascimento)} anos
      </Text>

      <View style={[styles.badge, { backgroundColor: statusColor }]}>
        <Text style={styles.badgeText}>{statusLabel}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onView} style={styles.actionBtn}>
          <Feather name="eye" size={16} color={colors.primary} />
        </Pressable>
        <Pressable onPress={onEdit} style={styles.actionBtn}>
          <Feather name="edit-2" size={16} color="#2563EB" />
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionBtn}>
          <Feather name="trash-2" size={16} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInactive: { opacity: 0.6 },
  photo: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  photoPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  info: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 10, color: colors.white, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
});
