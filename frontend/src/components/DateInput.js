import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseDate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

function formatDisplay(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  if (!y || !m || !d) return str;
  return `${d}/${m}/${y}`;
}

function toIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayIso() {
  const t = new Date();
  return toIso(t.getFullYear(), t.getMonth(), t.getDate());
}

function DateInput({ value, onChange, placeholder = 'DD/MM/AAAA', style, iconOnly, iconColor, iconSize = 22, triggerless }, ref) {
  const { activeColors: c, scale } = useAccessibility();
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setTempValue(value || '');
      setShow(true);
    },
    close: () => setShow(false),
  }));

  const initial = parseDate(value);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [tempValue, setTempValue] = useState(value || '');

  const today = todayIso();

  const calendarDays = useMemo(() => {
    const total = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  function handleOpen() {
    const d = parseDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setTempValue(value || '');
    setShow(true);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day) {
    if (!day) return;
    setTempValue(toIso(viewYear, viewMonth, day));
  }

  function confirm() {
    if (tempValue) onChange(tempValue);
    setShow(false);
  }

  const [selectingYear, setSelectingYear] = useState(false);
  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear() + 5;
    const arr = [];
    for (let i = currentYear; i >= currentYear - 120; i--) arr.push(i);
    return arr;
  }, []);

  const selectedIso = tempValue;
  const calendarModal = (
    <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
      <Pressable style={styles.overlay} onPress={() => setShow(false)}>
        <Pressable style={[styles.sheet, { backgroundColor: c.white }]} onPress={() => {}}>
          <View style={[styles.calHeader, { borderBottomColor: c.border }]}>
            <Pressable onPress={prevMonth} style={[styles.navBtn, selectingYear && { opacity: 0 }]} disabled={selectingYear} hitSlop={8}>
              <Feather name="chevron-left" size={22} color={c.primary} />
            </Pressable>
            <Pressable style={styles.headerCenter} onPress={() => setSelectingYear(!selectingYear)}>
              <Text style={[styles.calTitle, { color: c.textPrimary }]}>{selectingYear ? 'Selecione o Ano' : MESES[viewMonth]}</Text>
              <Text style={[styles.calYear, { color: c.primary, fontWeight: '700' }]}>{viewYear} <Feather name={selectingYear ? 'chevron-up' : 'chevron-down'} size={12} /></Text>
            </Pressable>
            <Pressable onPress={nextMonth} style={[styles.navBtn, selectingYear && { opacity: 0 }]} disabled={selectingYear} hitSlop={8}>
              <Feather name="chevron-right" size={22} color={c.primary} />
            </Pressable>
          </View>
          
          {!selectingYear ? (
            <>
              <View style={styles.weekRow}>
                {DIAS_SEMANA.map(d => (
                  <Text key={d} style={[styles.weekLabel, { color: c.textSecondary }]}>{d}</Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {calendarDays.map((day, idx) => {
                  if (!day) return <View key={`e-${idx}`} style={styles.dayCell} />;
                  const iso = toIso(viewYear, viewMonth, day);
                  const selected = iso === selectedIso;
                  const isToday = iso === today;
                  return (
                    <Pressable
                      key={iso}
                      style={[
                        styles.dayCell,
                        selected && { backgroundColor: c.primary, borderRadius: 50 },
                        !selected && isToday && [styles.todayRing, { borderColor: c.primary }],
                      ]}
                      onPress={() => selectDay(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        { color: c.textPrimary },
                        selected && { color: '#fff', fontWeight: '700' },
                        isToday && !selected && { color: c.primary, fontWeight: '700' },
                      ]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={{ height: 260 }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.yearsGrid}>
                {yearsList.map(y => (
                  <Pressable 
                    key={y} 
                    style={[styles.yearCell, viewYear === y && { backgroundColor: c.primary }]} 
                    onPress={() => { setViewYear(y); setSelectingYear(false); }}
                  >
                    <Text style={[styles.yearText, { color: c.textPrimary }, viewYear === y && { color: '#fff', fontWeight: 'bold' }]}>{y}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <Pressable style={styles.cancelBtn} onPress={() => setShow(false)}>
              <Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, { backgroundColor: selectedIso ? c.primary : c.inactive }]}
              onPress={confirm}
              disabled={!selectedIso}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (triggerless) {
    return calendarModal;
  }

  if (iconOnly) {
    return (
      <>
        <Pressable onPress={handleOpen} hitSlop={10} accessibilityRole="button">
          <Feather name="calendar" size={iconSize} color={iconColor || c.primary} />
        </Pressable>
        {calendarModal}
      </>
    );
  }

  return (
    <>
      <Pressable
        style={[styles.row, { backgroundColor: c.white, borderColor: c.border }, style]}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={value ? `Data: ${formatDisplay(value)}` : placeholder}
      >
        <Feather name="calendar" size={18} color={c.primary} style={styles.icon} />
        <Text style={[styles.valueText, !value && { color: c.textSecondary }]}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={c.textSecondary} />
      </Pressable>
      {calendarModal}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 11,
  },
  icon: { marginRight: 8 },
  valueText: { flex: 1, fontSize: 14, fontWeight: '500' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navBtn: { padding: 8 },
  headerCenter: { alignItems: 'center' },
  calTitle: { fontSize: 16, fontWeight: '700' },
  calYear: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayCell: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    borderWidth: 1.5,
    borderRadius: 50,
  },
  dayText: { fontSize: 13 },
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
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  yearCell: {
    width: '30%',
    margin: '1.5%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  yearText: {
    fontSize: 15,
  },
});

export default forwardRef(DateInput);
