import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable,
  TextInput, Alert, ScrollView,
} from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import Toast from '../../components/Toast';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getRegistrosSaude, createRegistroSaude, deleteRegistroSaude } from '../../services/saudeService';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import DateInput from '../../components/DateInput';

export default function SaudeScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const { activeColors: c, scale } = useAccessibility();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    data: today, peso: '', pressaoSistolica: '', pressaoDiastolica: '', temperatura: '', glicemia: '', observacoes: '',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try { setLoading(true); const res = await getRegistrosSaude(idosoId); setRegistros(res.data); }
    catch (e) { console.log('[SAUDE] Erro:', e); }
    finally { setLoading(false); }
  }

  function abrirNovo() {
    setForm({ data: today, peso: '', pressaoSistolica: '', pressaoDiastolica: '', temperatura: '', glicemia: '', observacoes: '' });
    setModalVisible(true);
  }

  async function salvar() {
    try {
      const payload = {
        idosoId, data: form.data,
        peso: form.peso ? parseFloat(form.peso.replace(',', '.')) : null,
        pressaoSistolica: form.pressaoSistolica ? parseInt(form.pressaoSistolica, 10) : null,
        pressaoDiastolica: form.pressaoDiastolica ? parseInt(form.pressaoDiastolica, 10) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura.replace(',', '.')) : null,
        glicemia: form.glicemia ? parseInt(form.glicemia, 10) : null,
        observacoes: form.observacoes,
      };
      await createRegistroSaude(payload);
      setModalVisible(false);
      showToast('Registro de saúde salvo!', 'success');
      await load();
    } catch { showToast('Falha ao salvar registro.', 'error'); }
  }

  function confirmarExcluir(r) {
    Alert.alert('Excluir registro', `Registro de ${r.data}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteRegistroSaude(r.id); await load(); } },
    ]);
  }

  const pesos = registros.filter(r => r.peso != null).slice(0, 6).reverse();
  const minP = pesos.length ? Math.min(...pesos.map(r => r.peso)) - 1 : 0;
  const maxP = pesos.length ? Math.max(...pesos.map(r => r.peso)) + 1 : 1;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <View style={[styles.header, { backgroundColor: c.white, borderBottomColor: c.border }]}>
        <Text style={[styles.subtitle, { color: c.textPrimary }]}>{idosoNome || 'Idoso'}</Text>
        <Text style={[styles.counter, { color: c.textSecondary }]}>{registros.length} registro(s)</Text>
      </View>

      {pesos.length > 1 && (
        <View style={[styles.chartCard, { backgroundColor: c.white }]}>
          <Text style={[styles.chartTitle, { color: c.primary }]}>Evolução do peso</Text>
          <View style={styles.chartArea}>
            {pesos.map((r, i) => {
              const h = ((r.peso - minP) / (maxP - minP)) * 70 + 10;
              return (
                <View key={i} style={styles.chartCol}>
                  <Text style={[styles.chartValue, { color: c.textSecondary }]}>{r.peso}</Text>
                  <View style={[styles.chartBar, { height: h, backgroundColor: c.primary }]} />
                  <Text style={[styles.chartLabel, { color: c.textSecondary }]}>{r.data?.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <FlatList
        data={registros}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="heart" size={48} color={c.border} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhum registro de saúde ainda</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.white }]}>
            <View style={styles.cardHeader}>
              <Feather name="calendar" size={14} color={c.primary} />
              <Text style={[styles.cardDate, { color: c.textPrimary }]}>{item.data}</Text>
              <TouchableOpacity onPress={() => confirmarExcluir(item)}>
                <Feather name="trash-2" size={16} color={c.danger} />
              </TouchableOpacity>
            </View>
            <View style={styles.metricsGrid}>
              {[
                { label: 'Peso', value: item.peso != null ? `${item.peso} kg` : '-', icon: 'activity' },
                { label: 'Pressão', value: item.pressaoSistolica ? `${item.pressaoSistolica}/${item.pressaoDiastolica || '-'}` : '-', icon: 'heart' },
                { label: 'Temp.', value: item.temperatura != null ? `${item.temperatura}°C` : '-', icon: 'thermometer' },
                { label: 'Glicemia', value: item.glicemia != null ? `${item.glicemia}` : '-', icon: 'droplet' },
              ].map((m, i) => (
                <View key={i} style={[styles.metric, { backgroundColor: c.surface }]}>
                  <Feather name={m.icon} size={14} color={c.primary} />
                  <Text style={[styles.metricLabel, { color: c.textSecondary }]}>{m.label}</Text>
                  <Text style={[styles.metricValue, { color: c.textPrimary }]}>{m.value}</Text>
                </View>
              ))}
            </View>
            {!!item.observacoes && <Text style={[styles.obs, { color: c.textSecondary }]}>{item.observacoes}</Text>}
          </View>
        )}
      />

      <Pressable style={[styles.fab, { backgroundColor: c.primary }]} onPress={abrirNovo}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: c.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Novo Registro de Saúde</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Data</Text>
              <DateInput value={form.data} onChange={(v) => setForm({ ...form, data: v })} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Peso (kg)</Text>
              <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.peso} onChangeText={(v) => setForm({ ...form, peso: v })} keyboardType="numeric" placeholder="Ex: 68.5" placeholderTextColor={c.textSecondary} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>P. Sistólica</Text>
                  <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                    value={form.pressaoSistolica} onChangeText={(v) => setForm({ ...form, pressaoSistolica: v })} keyboardType="numeric" placeholder="120" placeholderTextColor={c.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>P. Diastólica</Text>
                  <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                    value={form.pressaoDiastolica} onChangeText={(v) => setForm({ ...form, pressaoDiastolica: v })} keyboardType="numeric" placeholder="80" placeholderTextColor={c.textSecondary} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Temperatura</Text>
                  <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                    value={form.temperatura} onChangeText={(v) => setForm({ ...form, temperatura: v })} keyboardType="numeric" placeholder="36.5" placeholderTextColor={c.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Glicemia</Text>
                  <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                    value={form.glicemia} onChangeText={(v) => setForm({ ...form, glicemia: v })} keyboardType="numeric" placeholder="100" placeholderTextColor={c.textSecondary} />
                </View>
              </View>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Observações</Text>
              <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top', backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.observacoes} onChangeText={(v) => setForm({ ...form, observacoes: v })} placeholder="Notas clínicas" multiline placeholderTextColor={c.textSecondary} />
            </ScrollView>
            <View style={[styles.modalActions, { borderTopColor: c.border }]}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnTxt, { color: c.textPrimary, fontSize: scale(14) }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.primary }]} onPress={salvar}>
                <Text style={[styles.modalBtnTxt, { color: '#fff', fontSize: scale(14) }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
      </BottomSheet>
      <Toast visible={toast.visible} message={toast.message} type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 14, borderBottomWidth: 1 },
  subtitle: { fontSize: 15, fontWeight: '700' },
  counter: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 10 },
  chartCard: { margin: 12, padding: 14, borderRadius: 12, elevation: 1 },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartValue: { fontSize: 10 },
  chartBar: { width: 14, borderRadius: 3, marginVertical: 3 },
  chartLabel: { fontSize: 10 },
  card: { borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardDate: { fontWeight: '700', flex: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flexBasis: '48%', padding: 10, borderRadius: 8, alignItems: 'center' },
  metricLabel: { fontSize: 11, marginTop: 2 },
  metricValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  obs: { marginTop: 8, fontSize: 12, fontStyle: 'italic' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderRadius: 20 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 12, maxHeight: 400 },
  handle: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { borderRadius: 8, padding: 10, borderWidth: 1, fontSize: 14 },
  modalActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { fontWeight: '700', fontSize: 14 },
});
