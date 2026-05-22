import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable,
  TextInput, ScrollView, Switch,
} from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import Toast from '../../components/Toast';
import FeedbackDialog from '../../components/FeedbackDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import useFeedback from '../../hooks/useFeedback';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMedicamentosByIdoso, createMedicamento, updateMedicamento, deleteMedicamento,
} from '../../services/medicamentoService';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAccessibility } from '../../contexts/AccessibilityContext';

const FREQUENCIAS = ['Diário', '12/12h', '8/8h', '6/6h', 'Semanal', 'Quando necessário'];

export default function MedicamentosScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const { activeColors: c, scale } = useAccessibility();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', dosagem: '', horarios: '', frequencia: 'Diário', observacoes: '', ativo: true });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });
  const fb = useFeedback();
  const [excluirAlvo, setExcluirAlvo] = useState(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try {
      setLoading(true);
      const res = await getMedicamentosByIdoso(idosoId);
      setMedicamentos(res.data);
    } catch { /* mantém última lista carregada */ }
    finally { setLoading(false); }
  }

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: '', dosagem: '', horarios: '', frequencia: 'Diário', observacoes: '', ativo: true });
    setModalVisible(true);
  }

  function abrirEditar(med) {
    setEditando(med);
    setForm({ nome: med.nome || '', dosagem: med.dosagem || '', horarios: med.horarios || '',
      frequencia: med.frequencia || 'Diário', observacoes: med.observacoes || '', ativo: med.ativo });
    setModalVisible(true);
  }

  async function salvar() {
    if (!form.nome.trim()) { showToast('Informe o nome do medicamento.', 'warn'); return; }
    try {
      const payload = { ...form, idosoId };
      if (editando) await updateMedicamento(editando.id, payload);
      else await createMedicamento(payload);
      setModalVisible(false);
      fb.success(
        editando ? 'Medicamento atualizado!' : 'Medicamento cadastrado!',
        editando ? 'As alterações foram salvas.' : `${form.nome} foi adicionado à lista.`,
        1500,
      );
      await load();
    } catch {
      fb.error('Não foi possível salvar', 'Verifique os dados e tente novamente.');
    }
  }

  function confirmarExcluir(med) {
    setExcluirAlvo(med);
  }

  async function executarExclusao() {
    if (!excluirAlvo) return;
    try {
      await deleteMedicamento(excluirAlvo.id);
      fb.success('Medicamento removido', `${excluirAlvo.nome} foi excluído.`, 1400);
      await load();
    } catch {
      fb.error('Falha ao excluir', 'Tente novamente em alguns instantes.');
    }
  }

  if (loading) return <LoadingOverlay />;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <View style={[styles.header, { backgroundColor: c.white, borderBottomColor: c.border }]}>
        <Text style={[styles.subtitle, { color: c.textPrimary }]}>{idosoNome || 'Idoso'}</Text>
        <Text style={[styles.counter, { color: c.textSecondary }]}>{medicamentos.length} medicamento(s)</Text>
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="package" size={48} color={c.border} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhum medicamento cadastrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.white }, !item.ativo && styles.cardInativo]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: c.accent }]}>
                <Feather name="activity" size={18} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medNome, { color: c.textPrimary }]}>{item.nome}</Text>
                <Text style={[styles.medSub, { color: c.textSecondary }]}>{item.dosagem} — {item.frequencia}</Text>
              </View>
              {!item.ativo && (
                <View style={[styles.badgeInativo, { backgroundColor: c.inactive }]}>
                  <Text style={styles.badgeTxt}>Suspenso</Text>
                </View>
              )}
            </View>
            {!!item.horarios && (
              <View style={styles.timeRow}>
                <Feather name="clock" size={13} color={c.textSecondary} />
                <Text style={[styles.timeText, { color: c.textSecondary }]}>{item.horarios}</Text>
              </View>
            )}
            {!!item.observacoes && <Text style={[styles.obs, { color: c.textSecondary }]}>{item.observacoes}</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: c.primary }]} onPress={() => abrirEditar(item)}>
                <Feather name="edit-2" size={14} color="#fff" />
                <Text style={styles.btnTxt}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: c.danger }]} onPress={() => confirmarExcluir(item)}>
                <Feather name="trash-2" size={14} color="#fff" />
                <Text style={styles.btnTxt}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Pressable style={[styles.fab, { backgroundColor: c.primary }]} onPress={abrirNovo}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: c.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>
                {editando ? 'Editar Medicamento' : 'Novo Medicamento'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Nome *</Text>
              <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.nome} onChangeText={(v) => setForm({ ...form, nome: v })} placeholder="Ex: Losartana" placeholderTextColor={c.textSecondary} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Dosagem</Text>
              <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.dosagem} onChangeText={(v) => setForm({ ...form, dosagem: v })} placeholder="Ex: 50mg" placeholderTextColor={c.textSecondary} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Horários (separados por vírgula)</Text>
              <TextInput style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.horarios} onChangeText={(v) => setForm({ ...form, horarios: v })} placeholder="Ex: 08:00, 20:00" placeholderTextColor={c.textSecondary} />
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Frequência</Text>
              <View style={styles.chipsRow}>
                {FREQUENCIAS.map((f) => (
                  <TouchableOpacity key={f}
                    style={[styles.chip, { backgroundColor: c.white, borderColor: c.border }, form.frequencia === f && { backgroundColor: c.primary, borderColor: c.primary }]}
                    onPress={() => setForm({ ...form, frequencia: f })}>
                    <Text style={[styles.chipTxt, { color: c.textPrimary }, form.frequencia === f && { color: '#fff', fontWeight: '700' }]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Observações</Text>
              <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top', backgroundColor: c.white, borderColor: c.border, color: c.textPrimary }]}
                value={form.observacoes} onChangeText={(v) => setForm({ ...form, observacoes: v })} placeholder="Observações adicionais" multiline placeholderTextColor={c.textSecondary} />
              {editando && (
                <View style={styles.switchRow}>
                  <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Medicamento ativo</Text>
                  <Switch value={form.ativo} onValueChange={(v) => setForm({ ...form, ativo: v })} trackColor={{ false: '#ccc', true: c.success }} />
                </View>
              )}
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
        title="Excluir medicamento?"
        message={excluirAlvo ? `Esta ação não pode ser desfeita. "${excluirAlvo.nome}" será removido.` : ''}
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
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 10 },
  card: { borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardInativo: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  medNome: { fontSize: 15, fontWeight: '700' },
  medSub: { fontSize: 12, marginTop: 2 },
  badgeInativo: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 48 },
  timeText: { fontSize: 13 },
  obs: { fontSize: 12, marginTop: 6, marginLeft: 48, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 5 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
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
  modalBody: { paddingHorizontal: 20, paddingTop: 12, maxHeight: 440 },
  handle: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: { borderRadius: 8, padding: 10, borderWidth: 1, fontSize: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipTxt: { fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  modalActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { fontWeight: '700', fontSize: 14 },
});
