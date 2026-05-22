import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import { useAccessibility } from '../contexts/AccessibilityContext';

/**
 * Diálogo de confirmação reutilizável.
 * Funciona em web e mobile (BottomSheet é Modal cross-platform).
 *
 * Props:
 *   visible, onClose
 *   title, message
 *   confirmLabel, cancelLabel
 *   variant: 'danger' (vermelho) | 'primary' (default)
 *   icon: nome do Feather
 *   onConfirm: chamado ao confirmar (após fechar)
 */
export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  icon,
}) {
  const { activeColors: c, scale } = useAccessibility();

  const accent = variant === 'danger' ? (c.danger || '#dc2626') : c.primary;
  const iconName = icon || (variant === 'danger' ? 'alert-triangle' : 'help-circle');

  function handleConfirm() {
    onClose && onClose();
    // Pequeno delay para a animação de saída terminar antes da ação
    setTimeout(() => onConfirm && onConfirm(), 80);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.card, { backgroundColor: c.white }]}>
        <View style={[styles.iconWrap, { backgroundColor: variant === 'danger' ? '#fee2e2' : c.surface }]}>
          <Feather name={iconName} size={28} color={accent} />
        </View>

        <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(18) }]}>{title}</Text>

        {!!message && (
          <Text style={[styles.message, { color: c.textSecondary, fontSize: scale(14) }]}>
            {message}
          </Text>
        )}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnCancel,
              { borderColor: c.border, backgroundColor: c.surface },
              pressed && { opacity: 0.7 },
            ]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={[styles.btnCancelText, { color: c.textPrimary, fontSize: scale(14) }]}>
              {cancelLabel}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnConfirm,
              { backgroundColor: accent },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleConfirm}
            accessibilityRole="button"
          >
            <Text style={[styles.btnConfirmText, { fontSize: scale(14) }]}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6,
  },
  message: {
    fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  actions: {
    flexDirection: 'row', gap: 10, width: '100%', marginTop: 8,
  },
  btn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  btnCancel: { borderWidth: 1 },
  btnCancelText: { fontWeight: '700' },
  btnConfirm: { /* bg vem de accent */ },
  btnConfirmText: { color: '#fff', fontWeight: '800' },
});
