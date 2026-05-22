import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable,
  TextInput, ScrollView,
} from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import Toast from '../../components/Toast';
import FeedbackDialog from '../../components/FeedbackDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import useFeedback from '../../hooks/useFeedback';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getVisitasPorIdoso, createVisita, deleteVisita } from '../../services/visitaService';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import DateInput from '../../components/DateInput';

const PARENTESCOS = ['Filho(a)', 'Neto(a)', 'Sobrinho(a)', 'Irmão(a)', 'Amigo(a)', 'Outro'];

export default function VisitasScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const { activeColors: c, scale } = useAccessibility();
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ dataVisita: today, nomeVisitante: '', parentesco: 'Filho(a)', observacoes: '' });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });
  const fb = useFeedback();
  const [excluirAlvo, setExcluirAlvo] = useState(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try { setLoading(true); const res = await getVisitasPorIdoso(idosoId); setVisitas(res.data); }
    catch { /* mantém estado anterior */ }
    finally { setLoading(false); }
  }

  function abrirNovo() {
    setForm({ dataVisita: today, nomeVisitante: '', parentesco: 'Filho(a)', observacoes: '' });
    setModalVisible(true);
  }

  async function salvar() {
    if (!form.nomeVisitante.trim()) { showToast('Informe o nome do visitante.', 'warn'); return; }
    try {
      await createVisita({ ...form, idosoId });
      setModalVisible(false);
      fb.success('Visita registrada!', `${form.nomeVisitante} foi adicionado ao histórico.`, 1500);
      await load();
    } catch {
      fb.error('Falha ao registrar', 'Tente novamente em alguns instantes.');
    }
  }

  function confirmarExcluir(v) {
    setExcluirAlvo(v);
  }

  async function executarExclusao() {
    if (!excluirAlvo) return;
    try {
      await deleteVisita(excluirAlvo.id);
      fb.success('Visita removida', 'O registro foi excluído.', 1300);
      await load();
    } catch {
      fb.error('Falha ao excluir', 'Tente novamente em alguns instantes.');
    }
  }

  const diasDesdeUltima = visitas.length
    ? Math.floor((Date.now() - new Date(visitas[0].dataVisita).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <View style={[styles.header, { backgroundColor: c.white, borderBottomColor: c.border }]}>
        <Text style={[styles.subtitle, { color: c.textPrimary }]}>{idosoNome || 'Idoso'}</Text>
        <Text style={[styles.counter, { color: c.textSecondary }]}>{visitas.length} visita(s)</Text>
        {diasDesdeUltima !== null && (
          <Text style={[styles.lastVisit, { color: diasDesdeUltima > 30 ? c.danger : c.success }]}>
            {diasDesdeUltima === 0 ? 'Visita hoje' : `Última visita há ${diasDesdeUltima} dia(s)`}
          </Text>
        )}
      </View>

      <FlatList
        data={visitas}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={c.border} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhuma visita registrada</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.white }]}>
            <View style={[styles.iconCircle, { backgroundColor: c.accent }]}>
              <Feather name="user-check" size={18} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nomeVisitante, { color: c.textPrimary }]}>{item.nomeVisitante}</Text>
              <Text style={[styles.parentesco, { color: c.primary }]}>{item.parentesco}</Text>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={11} color={c.textSecondary} />
                <Text style={[styles.dateText, { color: c.textSecondary }]}>{item.dataVisita}</Text>
              </View>
              {!!item.observacoes && <Text style={[styles.obs, { color: c.textSecondary }]}>{item.observacoes}</Text>}
            </View>
            <TouchableOpacity onPress={() => confirmarExcluir(item)}>
              <Feather name="trash-2" size={16} color={c.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Pressable style={[styles.fab, { backgroundColor: c.primary }]} onPress={abrirNovo}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: c.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Registrar Visita</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Data</Text>
              <DateInput value={form.dataVisita} onChange={(v) => setForm({ ...form, dataVisita: v })} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Nome do visitante *</Text>
              <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.nomeVisitante} onChangeText={(v) => setForm({ ...form, nomeVisitante: v })} placeholder="Ex: Maria Silva" placeholderTextColor={c.textSecondary} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Parentesco</Text>
              <View style={styles.chipsRow}>
                {PARENTESCOS.map((p) => (
                  <TouchableOpacity key={p}
                    style={[styles.chip, { backgroundColor: c.white, borderColor: c.border }, form.parentesco === p && { backgroundColor: c.primary, borderColor: c.primary }]}
                    onPress={() => setForm({ ...form, parentesco: p })}>
                    <Text style={[styles.chipTxt, { color: c.textPrimary }, form.parentesco === p && { color: '#fff', fontWeight: '700' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Observações</Text>
              <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top', backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.observacoes} onChangeText={(v) => setForm({ ...form, observacoes: v })} placeholder="Detalhes da visita" multiline placeholderTextColor={c.textSecondary} />
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
      <FeedbackDialog
        visible={fb.visible}
        onClose={fb.close}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        autoCloseMs={fb.autoCloseMs}
      />
      <ConfirmDialog
        visible={!!excluirAlvo}
        onClose={() => setExcluirAlvo(null)}
        onConfirm={executarExclusao}
        title="Excluir visita?"
        message={excluirAlvo ? `A visita de ${excluirAlvo.nomeVisitante} em ${excluirAlvo.dataVisita} será removida.` : ''}
        confirmLabel="Excluir"
        variant="danger"
        icon="trash-2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 14, borderBottomWidth: 1 },
  subtitle: { fontSize: 15, fontWeight: '700' },
  counter: { fontSize: 12, marginTop: 2 },
  lastVisit: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 10 },
  card: { flexDirection: 'row', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1, alignItems: 'flex-start', gap: 10 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  nomeVisitante: { fontSize: 15, fontWeight: '700' },
  parentesco: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: 11 },
  obs: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
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
  modalBody: { paddingHorizontal: 20, paddingTop: 12, maxHeight: 380 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { borderRadius: 8, padding: 10, borderWidth: 1, fontSize: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipTxt: { fontSize: 12 },
  modalActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { fontWeight: '700', fontSize: 14 },
});
