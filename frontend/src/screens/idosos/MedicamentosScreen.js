import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMedicamentosByIdoso, createMedicamento,
  updateMedicamento, deleteMedicamento,
} from '../../services/medicamentoService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';

const FREQUENCIAS = ['Diario', '12/12h', '8/8h', '6/6h', 'Semanal', 'Quando necessario'];

export default function MedicamentosScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nome: '', dosagem: '', horarios: '', frequencia: 'Diario',
    observacoes: '', ativo: true,
  });

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    try {
      setLoading(true);
      const res = await getMedicamentosByIdoso(idosoId);
      setMedicamentos(res.data);
    } catch (e) {
      console.log('[MED] Erro:', e);
    } finally {
      setLoading(false);
    }
  }

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: '', dosagem: '', horarios: '', frequencia: 'Diario', observacoes: '', ativo: true });
    setModalVisible(true);
  }

  function abrirEditar(med) {
    setEditando(med);
    setForm({
      nome: med.nome || '',
      dosagem: med.dosagem || '',
      horarios: med.horarios || '',
      frequencia: med.frequencia || 'Diario',
      observacoes: med.observacoes || '',
      ativo: med.ativo,
    });
    setModalVisible(true);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      Alert.alert('Atencao', 'Informe o nome do medicamento.');
      return;
    }
    try {
      const payload = { ...form, idosoId };
      if (editando) {
        await updateMedicamento(editando.id, payload);
      } else {
        await createMedicamento(payload);
      }
      setModalVisible(false);
      await load();
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar o medicamento.');
    }
  }

  function confirmarExcluir(med) {
    Alert.alert(
      'Excluir medicamento',
      `Deseja excluir "${med.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicamento(med.id);
              await load();
            } catch { Alert.alert('Erro', 'Falha ao excluir.'); }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{idosoNome || 'Idoso'}</Text>
        <Text style={styles.counter}>{medicamentos.length} medicamento(s)</Text>
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum medicamento cadastrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.ativo && styles.cardInativo]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Feather name="activity" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medNome}>{item.nome}</Text>
                <Text style={styles.medSub}>{item.dosagem} — {item.frequencia}</Text>
              </View>
              {!item.ativo && (
                <View style={styles.badgeInativo}>
                  <Text style={styles.badgeTxt}>Suspenso</Text>
                </View>
              )}
            </View>
            {!!item.horarios && (
              <View style={styles.timeRow}>
                <Feather name="clock" size={13} color={colors.textSecondary} />
                <Text style={styles.timeText}>{item.horarios}</Text>
              </View>
            )}
            {!!item.observacoes && <Text style={styles.obs}>{item.observacoes}</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => abrirEditar(item)}>
                <Feather name="edit-2" size={14} color={colors.white} />
                <Text style={styles.btnTxt}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnDel]} onPress={() => confirmarExcluir(item)}>
                <Feather name="trash-2" size={14} color={colors.white} />
                <Text style={styles.btnTxt}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={abrirNovo}>
        <Feather name="plus" size={26} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar Medicamento' : 'Novo Medicamento'}
            </Text>
            <ScrollView style={{ maxHeight: 480 }}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(v) => setForm({ ...form, nome: v })}
                placeholder="Ex: Losartana"
              />

              <Text style={styles.label}>Dosagem</Text>
              <TextInput
                style={styles.input}
                value={form.dosagem}
                onChangeText={(v) => setForm({ ...form, dosagem: v })}
                placeholder="Ex: 50mg"
              />

              <Text style={styles.label}>Horarios (separados por virgula)</Text>
              <TextInput
                style={styles.input}
                value={form.horarios}
                onChangeText={(v) => setForm({ ...form, horarios: v })}
                placeholder="Ex: 08:00, 20:00"
              />

              <Text style={styles.label}>Frequencia</Text>
              <View style={styles.chipsRow}>
                {FREQUENCIAS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, form.frequencia === f && styles.chipActive]}
                    onPress={() => setForm({ ...form, frequencia: f })}
                  >
                    <Text style={[styles.chipTxt, form.frequencia === f && styles.chipTxtActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Observacoes</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={form.observacoes}
                onChangeText={(v) => setForm({ ...form, observacoes: v })}
                placeholder="Observacoes adicionais"
                multiline
              />

              {editando && (
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Medicamento ativo</Text>
                  <Switch
                    value={form.ativo}
                    onValueChange={(v) => setForm({ ...form, ativo: v })}
                    trackColor={{ false: '#ccc', true: colors.success }}
                  />
                </View>
              )}
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
  header: {
    backgroundColor: colors.white, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  subtitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  counter: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textSecondary, marginTop: 10 },
  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1,
  },
  cardInativo: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  medNome: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  medSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badgeInativo: {
    backgroundColor: colors.inactive, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  badgeTxt: { color: colors.white, fontSize: 11, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 48 },
  timeText: { fontSize: 13, color: colors.textSecondary },
  obs: { fontSize: 12, color: colors.textSecondary, marginTop: 6, marginLeft: 48, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 8, gap: 5,
  },
  btnEdit: { backgroundColor: '#2563eb' },
  btnDel: { backgroundColor: colors.danger },
  btnTxt: { color: colors.white, fontWeight: '700', fontSize: 12 },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  btnSave: { backgroundColor: colors.primary },
  modalBtnTxt: { fontWeight: '700', color: colors.textPrimary },
});
