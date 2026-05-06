import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function MonthYearPicker({ mes, ano, onChange, colors }) {
  const { scale, activeColors } = useAccessibility();
  const c = colors || activeColors;
  const [show, setShow] = useState(false);
  const [tempMes, setTempMes] = useState(mes);
  const [tempAno, setTempAno] = useState(ano);

  function handleOpen() {
    setTempMes(mes);
    setTempAno(ano);
    setShow(true);
  }

  function confirm() {
    onChange(tempMes, tempAno);
    setShow(false);
  }

  return (
    <>
      <Pressable onPress={handleOpen} style={styles.trigger} hitSlop={6}>
        <Text style={[styles.triggerText, { color: c.textPrimary }]}>
          {MESES[mes - 1]} de {ano}
        </Text>
        <Feather name="chevron-down" size={14} color={c.textSecondary} style={{ marginLeft: 4 }} />
      </Pressable>

      <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
        <Pressable style={styles.overlay} onPress={() => setShow(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.white }]} onPress={() => {}}>

            {/* Seletor de ano */}
            <View style={[styles.yearRow, { borderBottomColor: c.border }]}>
              <Pressable onPress={() => setTempAno(y => y - 1)} style={styles.navBtn} hitSlop={8}>
                <Feather name="chevron-left" size={20} color={c.primary} />
              </Pressable>
              <Text style={[styles.yearText, { color: c.textPrimary }]}>{tempAno}</Text>
              <Pressable onPress={() => setTempAno(y => y + 1)} style={styles.navBtn} hitSlop={8}>
                <Feather name="chevron-right" size={20} color={c.primary} />
              </Pressable>
            </View>

            {/* Grade de meses */}
            <View style={styles.monthGrid}>
              {MESES_CURTOS.map((nome, idx) => {
                const m = idx + 1;
                const selected = m === tempMes;
                return (
                  <Pressable
                    key={m}
                    style={[
                      styles.monthCell,
                      selected && { backgroundColor: c.primary, borderRadius: 10 },
                    ]}
                    onPress={() => setTempMes(m)}
                  >
                    <Text style={[
                      styles.monthCellText,
                      { color: c.textSecondary },
                      selected && { color: '#fff', fontWeight: '700' },
                    ]}>
                      {nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Rodapé */}
            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <Pressable style={styles.cancelBtn} onPress={() => setShow(false)}>
                <Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.confirmBtn, { backgroundColor: c.primary }]} onPress={confirm}>
                <Text style={styles.confirmText}>Confirmar</Text>
              </Pressable>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navBtn: { padding: 8 },
  yearText: { fontSize: 18, fontWeight: '700' },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  monthCell: {
    width: '25%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  monthCellText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelText: { fontSize: 14, fontWeight: '600' },
  confirmBtn: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
