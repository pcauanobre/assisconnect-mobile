import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getRegistrosSaude, createRegistroSaude, deleteRegistroSaude,
} from '../../services/saudeService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';

export default function SaudeScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    data: today, peso: '', pressaoSistolica: '', pressaoDiastolica: '',
    temperatura: '', glicemia: '', observacoes: '',
  });

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try {
      setLoading(true);
      const res = await getRegistrosSaude(idosoId);
      setRegistros(res.data);
    } catch (e) {
      console.log('[SAUDE] Erro:', e);
    } finally { setLoading(false); }
  }

  function abrirNovo() {
    setForm({
      data: today, peso: '', pressaoSistolica: '', pressaoDiastolica: '',
      temperatura: '', glicemia: '', observacoes: '',
    });
    setModalVisible(true);
  }

  async function salvar() {
    try {
      const payload = {
        idosoId,
        data: form.data,
        peso: form.peso ? parseFloat(form.peso.replace(',', '.')) : null,
        pressaoSistolica: form.pressaoSistolica ? parseInt(form.pressaoSistolica, 10) : null,
        pressaoDiastolica: form.pressaoDiastolica ? parseInt(form.pressaoDiastolica, 10) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura.replace(',', '.')) : null,
        glicemia: form.glicemia ? parseInt(form.glicemia, 10) : null,
        observacoes: form.observacoes,
      };
      await createRegistroSaude(payload);
      setModalVisible(false);
      await load();
    } catch {
      Alert.alert('Erro', 'Falha ao salvar registro.');
    }
  }

  function confirmarExcluir(r) {
    Alert.alert('Excluir registro', `Registro de ${r.data}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await deleteRegistroSaude(r.id);
          await load();
        },
      },
    ]);
  }

  // Simple weight evolution: last 6 records, min-max scale
  const pesos = registros.filter(r => r.peso != null).slice(0, 6).reverse();
  const minP = pesos.length ? Math.min(...pesos.map(r => r.peso)) - 1 : 0;
  const maxP = pesos.length ? Math.max(...pesos.map(r => r.peso)) + 1 : 1;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{idosoNome || 'Idoso'}</Text>
        <Text style={styles.counter}>{registros.length} registro(s)</Text>
      </View>

      {pesos.length > 1 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Evolucao do peso</Text>
          <View style={styles.chartArea}>
            {pesos.map((r, i) => {
              const h = ((r.peso - minP) / (maxP - minP)) * 70 + 10;
              return (
                <View key={i} style={styles.chartCol}>
                  <Text style={styles.chartValue}>{r.peso}</Text>
                  <View style={[styles.chartBar, { height: h }]} />
                  <Text style={styles.chartLabel}>{r.data?.slice(5)}</Text>
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="heart" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum registro de saude ainda</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="calendar" size={14} color={colors.primary} />
              <Text style={styles.cardDate}>{item.data}</Text>
              <TouchableOpacity onPress={() => confirmarExcluir(item)}>
                <Feather name="trash-2" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
            <View style={styles.metricsGrid}>
              <Metric label="Peso" value={item.peso != null ? `${item.peso} kg` : '-'} icon="activity" />
              <Metric label="Pressao" value={
                item.pressaoSistolica ? `${item.pressaoSistolica}/${item.pressaoDiastolica || '-'}` : '-'
              } icon="heart" />
              <Metric label="Temp." value={item.temperatura != null ? `${item.temperatura}°C` : '-'} icon="thermometer" />
              <Metric label="Glicemia" value={item.glicemia != null ? `${item.glicemia}` : '-'} icon="droplet" />
            </View>
            {!!item.observacoes && <Text style={styles.obs}>{item.observacoes}</Text>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={abrirNovo}>
        <Feather name="plus" size={26} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo Registro de Saude</Text>
            <ScrollView style={{ maxHeight: 450 }}>
              <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input} value={form.data}
                onChangeText={(v) => setForm({ ...form, data: v })}
                placeholder="2026-04-23"
              />
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input} value={form.peso}
                onChangeText={(v) => setForm({ ...form, peso: v })}
                keyboardType="numeric" placeholder="Ex: 68.5"
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>P. Sistolica</Text>
                  <TextInput
                    style={styles.input} value={form.pressaoSistolica}
                    onChangeText={(v) => setForm({ ...form, pressaoSistolica: v })}
                    keyboardType="numeric" placeholder="120"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>P. Diastolica</Text>
                  <TextInput
                    style={styles.input} value={form.pressaoDiastolica}
                    onChangeText={(v) => setForm({ ...form, pressaoDiastolica: v })}
                    keyboardType="numeric" placeholder="80"
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Temperatura</Text>
                  <TextInput
                    style={styles.input} value={form.temperatura}
                    onChangeText={(v) => setForm({ ...form, temperatura: v })}
                    keyboardType="numeric" placeholder="36.5"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Glicemia</Text>
                  <TextInput
                    style={styles.input} value={form.glicemia}
                    onChangeText={(v) => setForm({ ...form, glicemia: v })}
                    keyboardType="numeric" placeholder="100"
                  />
                </View>
              </View>
              <Text style={styles.label}>Observacoes</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={form.observacoes}
                onChangeText={(v) => setForm({ ...form, observacoes: v })}
                placeholder="Notas clinicas"
                multiline
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={salvar}>
                <Text style={[styles.modalBtnTxt, { color: colors.white }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Metric({ label, value, icon }) {
  return (
    <View style={styles.metric}>
      <Feather name={icon} size={14} color={colors.primary} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.white, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  subtitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  counter: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textSecondary, marginTop: 10 },
  chartCard: {
    backgroundColor: colors.white, margin: 12, padding: 14, borderRadius: 12, elevation: 1,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartValue: { fontSize: 10, color: colors.textSecondary },
  chartBar: { width: 14, backgroundColor: colors.primary, borderRadius: 3, marginVertical: 3 },
  chartLabel: { fontSize: 10, color: colors.textSecondary },
  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardDate: { fontWeight: '700', color: colors.textPrimary, flex: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: {
    flexBasis: '48%', backgroundColor: colors.surface, padding: 10, borderRadius: 8, alignItems: 'center',
  },
  metricLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  metricValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  obs: { marginTop: 8, fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surfaceLight, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.white, borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: colors.border, fontSize: 14,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  btnSave: { backgroundColor: colors.primary },
  modalBtnTxt: { fontWeight: '700', color: colors.textPrimary },
});
