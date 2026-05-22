import React, { useEffect, useRef } from 'react';
import { Text, Image, Pressable, StyleSheet, View, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { calcularIdade } from '../utils/helpers';

function ActionBtn({ icon, color, bg, onPress, label }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.actionBtn, { backgroundColor: bg, transform: [{ scale }] }]}>
        <Feather name={icon} size={16} color={color} />
      </Animated.View>
    </Pressable>
  );
}

export default function IdosoCard({ idoso, onView, onEdit, onDelete, index = 0 }) {
  const { activeColors: c, scale } = useAccessibility();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index, 8) * 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const isInactive = idoso.inativo || idoso.falecido;
  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusColor = idoso.falecido ? c.textSecondary : idoso.inativo ? '#F59E0B' : c.success;
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: c.white, opacity: enter, transform: [{ translateY }] },
        isInactive && styles.cardInactive,
      ]}
    >
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
        <ActionBtn icon="eye"     color={c.primary} bg={c.surface} onPress={onView}   label="Ver detalhes" />
        <ActionBtn icon="edit-2"  color={c.primary} bg={c.surface} onPress={onEdit}   label="Editar" />
        <ActionBtn icon="trash-2" color={c.danger}  bg={c.surface} onPress={onDelete} label="Excluir" />
      </View>
    </Animated.View>
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
