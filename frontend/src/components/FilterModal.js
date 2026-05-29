import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import BottomSheet from './BottomSheet';

const SEXO_OPTIONS = ['Todos', 'Masculino', 'Feminino'];
const STATUS_OPTIONS = ['Todos', 'Ativo', 'Inativo', 'Falecido'];

const AGE_MIN = 50;
const AGE_MAX = 110;
const MIN_GAP = 0.04;
const THUMB_SIZE = 22;

function ratioToAge(r) {
  return Math.round(AGE_MIN + r * (AGE_MAX - AGE_MIN));
}
function ageToRatio(age) {
  const a = Number(age);
  if (!Number.isFinite(a)) return null;
  return Math.max(0, Math.min(1, (a - AGE_MIN) / (AGE_MAX - AGE_MIN)));
}

function AgeRangeSlider({ valueMin, valueMax, onChange, c }) {
  const [trackW, setTrackW] = useState(0);
  const initMinR = ageToRatio(valueMin) ?? 0;
  const initMaxR = ageToRatio(valueMax) ?? 1;
  const [minR, setMinR] = useState(initMinR);
  const [maxR, setMaxR] = useState(initMaxR);

  const minRef = useRef(initMinR);
  const maxRef = useRef(initMaxR);
  const trackRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => { minRef.current = minR; }, [minR]);
  useEffect(() => { maxRef.current = maxR; }, [maxR]);
  useEffect(() => { trackRef.current = trackW; }, [trackW]);

  function commit() {
    const minAge = ratioToAge(minRef.current);
    const maxAge = ratioToAge(maxRef.current);
    onChange(
      minAge <= AGE_MIN ? '' : String(minAge),
      maxAge >= AGE_MAX ? '' : String(maxAge),
    );
  }

  const minPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = minRef.current; },
    onPanResponderMove: (_, g) => {
      if (!trackRef.current) return;
      const delta = g.dx / trackRef.current;
      const next = Math.max(0, Math.min(maxRef.current - MIN_GAP, startRef.current + delta));
      setMinR(next);
    },
    onPanResponderRelease: commit,
    onPanResponderTerminate: commit,
  }), []);

  const maxPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = maxRef.current; },
    onPanResponderMove: (_, g) => {
      if (!trackRef.current) return;
      const delta = g.dx / trackRef.current;
      const next = Math.min(1, Math.max(minRef.current + MIN_GAP, startRef.current + delta));
      setMaxR(next);
    },
    onPanResponderRelease: commit,
    onPanResponderTerminate: commit,
  }), []);

  const minAge = ratioToAge(minR);
  const maxAge = ratioToAge(maxR);
  const minLeft = trackW * minR;
  const maxLeft = trackW * maxR;

  return (
    <View style={sliderStyles.wrapper}>
      <View style={sliderStyles.labelRow}>
        <View style={[sliderStyles.bubble, { left: Math.max(0, minLeft - 16), backgroundColor: c.primary }]}>
          <Text style={sliderStyles.bubbleText}>{minAge}</Text>
        </View>
        <View style={[sliderStyles.bubble, { left: Math.max(0, maxLeft - 16), backgroundColor: c.primary }]}>
          <Text style={sliderStyles.bubbleText}>{maxAge}</Text>
        </View>
      </View>

      <View
        style={sliderStyles.trackArea}
        onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      >
        <View style={[sliderStyles.trackBg, { backgroundColor: c.surface, borderColor: c.border }]} />
        <View style={[sliderStyles.trackFill, {
          backgroundColor: c.primary,
          left: minLeft,
          width: Math.max(0, maxLeft - minLeft),
        }]} />
        <View
          {...minPan.panHandlers}
          style={[sliderStyles.thumb, {
            backgroundColor: c.white,
            borderColor: c.primary,
            left: minLeft - THUMB_SIZE / 2,
          }]}
        />
        <View
          {...maxPan.panHandlers}
          style={[sliderStyles.thumb, {
            backgroundColor: c.white,
            borderColor: c.primary,
            left: maxLeft - THUMB_SIZE / 2,
          }]}
        />
      </View>

      <View style={sliderStyles.scale}>
        <Text style={[sliderStyles.scaleText, { color: c.textSecondary }]}>{AGE_MIN}</Text>
        <Text style={[sliderStyles.scaleText, { color: c.textSecondary }]}>{AGE_MAX}+</Text>
      </View>
    </View>
  );
}

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
          <AgeRangeSlider
            key={visible ? 'open' : 'closed'}
            valueMin={idadeMin}
            valueMax={idadeMax}
            onChange={(min, max) => { setIdadeMin(min); setIdadeMax(max); }}
            c={c}
          />
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
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { fontWeight: '700', fontSize: 14 },
});

const sliderStyles = StyleSheet.create({
  wrapper: { paddingTop: 30, paddingBottom: 4 },
  labelRow: {
    position: 'relative', height: 26, marginBottom: 6,
  },
  bubble: {
    position: 'absolute', top: 0,
    minWidth: 32, paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  bubbleText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  trackArea: {
    height: THUMB_SIZE, justifyContent: 'center', position: 'relative',
  },
  trackBg: {
    height: 4, borderRadius: 2, borderWidth: 1,
  },
  trackFill: {
    position: 'absolute', height: 4, borderRadius: 2, top: (THUMB_SIZE - 4) / 2,
  },
  thumb: {
    position: 'absolute', top: 0,
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    elevation: 2,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
  },
  scale: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  scaleText: { fontSize: 10, fontWeight: '600' },
});
