import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getVisitasPorIdoso, createVisita, deleteVisita,
} from '../../services/visitaService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';

const PARENTESCOS = ['Filho(a)', 'Neto(a)', 'Sobrinho(a)', 'Irmao(a)', 'Amigo(a)', 'Outro'];

export default function VisitasScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    dataVisita: today, nomeVisitante: '', parentesco: 'Filho(a)', observacoes: '',
  });

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try {
      setLoading(true);
      const res = await getVisitasPorIdoso(idosoId);
      setVisitas(res.data);
    } catch (e) {
      console.log('[VISITAS] Erro:', e);
    } finally { setLoading(false); }
  }

  function abrirNovo() {
    setForm({ dataVisita: today, nomeVisitante: '', parentesco: 'Filho(a)', observacoes: '' });
    setModalVisible(true);
  }

  async function salvar() {
    if (!form.nomeVisitante.trim()) {
      Alert.alert('Atencao', 'Informe o nome do visitante.');
      return;
    }
    try {
      await createVisita({ ...form, idosoId });
      setModalVisible(false);
      await load();
    } catch { Alert.alert('Erro', 'Falha ao registrar visita.'); }
  }

  function confirmarExcluir(v) {
    Alert.alert('Excluir visita', `Visita de ${v.nomeVisitante}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await deleteVisita(v.id);
          await load();
        },
      },
    ]);
  }

  const diasDesdeUltima = visitas.length
    ? Math.floor((Date.now() - new Date(visitas[0].dataVisita).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{idosoNome || 'Idoso'}</Text>
        <Text style={styles.counter}>{visitas.length} visita(s)</Text>
        {diasDesdeUltima !== null && (
          <Text style={[styles.lastVisit, diasDesdeUltima > 30 && { color: colors.danger }]}>
            {diasDesdeUltima === 0 ? 'Visita hoje' : `Ultima visita ha ${diasDesdeUltima} dia(s)`}
          </Text>
        )}
      </View>

      <FlatList
        data={visitas}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma visita registrada</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Feather name="user-check" size={18} color={colors.primary} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nomeVisitante}>{item.nomeVisitante}</Text>
              <Text style={styles.parentesco}>{item.parentesco}</Text>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <Text style={styles.dateText}>{item.dataVisita}</Text>
              </View>
              {!!item.observacoes && <Text style={styles.obs}>{item.observacoes}</Text>}
            </View>
            <TouchableOpacity onPress={() => confirmarExcluir(item)}>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={abrirNovo}>
        <Feather name="plus" size={26} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registrar Visita</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input} value={form.dataVisita}
                onChangeText={(v) => setForm({ ...form, dataVisita: v })}
              />
              <Text style={styles.label}>Nome do visitante *</Text>
              <TextInput
                style={styles.input} value={form.nomeVisitante}
                onChangeText={(v) => setForm({ ...form, nomeVisitante: v })}
                placeholder="Ex: Maria Silva"
              />
              <Text style={styles.label}>Parentesco</Text>
              <View style={styles.chipsRow}>
                {PARENTESCOS.map((p) => (
                  <TouchableOpacity key={p}
                    style={[styles.chip, form.parentesco === p && styles.chipActive]}
                    onPress={() => setForm({ ...form, parentesco: p })}>
                    <Text style={[styles.chipTxt, form.parentesco === p && styles.chipTxtActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Observacoes</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={form.observacoes}
                onChangeText={(v) => setForm({ ...form, observacoes: v })}
                placeholder="Detalhes da visita"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.white, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  subtitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  counter: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  lastVisit: { fontSize: 12, fontWeight: '700', color: colors.success, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textSecondary, marginTop: 10 },
  card: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12,
    padding: 12, marginBottom: 10, elevation: 1, alignItems: 'flex-start', gap: 10,
  },
  cardLeft: { alignItems: 'center' },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  nomeVisitante: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  parentesco: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: 11, color: colors.textSecondary },
  obs: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 12, color: colors.textPrimary },
  chipTxtActive: { color: colors.white, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  btnSave: { backgroundColor: colors.primary },
  modalBtnTxt: { fontWeight: '700', color: colors.textPrimary },
});
