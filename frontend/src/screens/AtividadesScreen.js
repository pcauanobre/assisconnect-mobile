import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  TextInput, RefreshControl,
} from 'react-native';
import BottomSheet from '../components/BottomSheet';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAtividades, saveAtividade, deleteAtividade } from '../services/atividadeService';
import ScreenHeader from '../components/ScreenHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import DateInput from '../components/DateInput';
import MonthYearPicker from '../components/MonthYearPicker';
import Toast from '../components/Toast';
import FeedbackDialog from '../components/FeedbackDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import AnimatedEnter from '../components/AnimatedEnter';
import useFeedback from '../hooks/useFeedback';
import { useAccessibility } from '../contexts/AccessibilityContext';
import colors from '../theme/colors';

export default function AtividadesScreen({ navigation }) {
  const { activeColors: c, scale } = useAccessibility();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (m, t = 'info') => setToast({ visible: true, message: m, type: t });
  const fb = useFeedback();
  const [excluirAlvo, setExcluirAlvo] = useState(null);

  function confirmarExcluirAtiv(ativ) {
    setExcluirAlvo(ativ);
  }

  async function executarExclusao() {
    if (!excluirAlvo) return;
    try {
      await deleteAtividade(excluirAlvo.id);
      fb.success('Atividade removida', `"${excluirAlvo.nome}" foi excluída.`, 1400);
      await carregar();
    } catch {
      fb.error('Falha ao excluir', 'Tente novamente em alguns instantes.');
    }
  }
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [atividadesMes, setAtividadesMes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nome: '', dataRegistro: hoje.toISOString().slice(0, 10), horaRegistro: '14:00',
  });

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const diasNoMes = new Date(ano, mes, 0).getDate();
      const todas = [];
      for (let d = 1; d <= diasNoMes; d++) {
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        try {
          const res = await getAtividades({ data: dataStr });
          (res.data || []).forEach(a => todas.push(a));
        } catch {}
      }
      setAtividadesMes(todas);
    } finally { setLoading(false); }
  }, [mes, ano]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function onRefresh() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  function mudarMes(delta) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 1) { novoMes = 12; novoAno--; }
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    setMes(novoMes); setAno(novoAno);
  }

  async function criarAtividade() {
    if (!form.nome.trim()) {
      showToast('Informe o nome da atividade.', 'warn');
      return;
    }
    const nomeCriado = form.nome;
    try {
      await saveAtividade({
        nome: form.nome, dataRegistro: form.dataRegistro,
        horaRegistro: form.horaRegistro, presentes: [],
      });
      setModalVisible(false);
      setForm({ nome: '', dataRegistro: hoje.toISOString().slice(0, 10), horaRegistro: '14:00' });
      await carregar();
      fb.success('Atividade criada!', `Registre a presença de "${nomeCriado}" na aba Registro.`, 1800);
    } catch {
      fb.error('Falha ao criar', 'Não foi possível salvar a atividade.');
    }
  }

  // Ranking por nome
  const ranking = {};
  atividadesMes.forEach(a => {
    const nome = a.nome;
    if (!ranking[nome]) ranking[nome] = { nome, qtd: 0, totalPresentes: 0 };
    ranking[nome].qtd++;
    ranking[nome].totalPresentes += (a.presentes || []).length;
  });
  const rankingList = Object.values(ranking)
    .sort((a, b) => b.totalPresentes - a.totalPresentes)
    .slice(0, 5);

  // Lista resumo ordenada por data
  const atividadesOrdenadas = [...atividadesMes].sort((a, b) => {
    const dateA = `${a.dataRegistro} ${a.horaRegistro || ''}`;
    const dateB = `${b.dataRegistro} ${b.horaRegistro || ''}`;
    return dateB.localeCompare(dateA);
  });

  if (loading) return <LoadingOverlay />;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScreenHeader title="Atividades" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <AnimatedEnter index={0}>
        <View style={[styles.monthNav, { backgroundColor: c.white }]}>
          <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.arrow}>
            <Feather name="chevron-left" size={22} color={c.primary} />
          </TouchableOpacity>
          <MonthYearPicker
            mes={mes}
            ano={ano}
            onChange={(m, a) => { setMes(m); setAno(a); }}
            colors={c}
          />
          <TouchableOpacity onPress={() => mudarMes(1)} style={styles.arrow}>
            <Feather name="chevron-right" size={22} color={c.primary} />
          </TouchableOpacity>
        </View>
        </AnimatedEnter>

        <AnimatedEnter index={1}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.white }]}>
            <Feather name="calendar" size={18} color={c.primary} />
            <Text style={[styles.statValue, { color: c.textPrimary, fontSize: scale(20) }]}>{atividadesMes.length}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Atividades</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.white }]}>
            <Feather name="users" size={18} color={c.primary} />
            <Text style={[styles.statValue, { color: c.textPrimary, fontSize: scale(20) }]}>
              {atividadesMes.reduce((acc, a) => acc + (a.presentes || []).length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Presenças</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.white }]}>
            <Feather name="star" size={18} color={c.primary} />
            <Text style={[styles.statValue, { color: c.textPrimary, fontSize: scale(20) }]}>{Object.keys(ranking).length}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Tipos</Text>
          </View>
        </View>
        </AnimatedEnter>

        {rankingList.length > 0 && (
          <AnimatedEnter index={2}>
          <View style={[styles.section, { backgroundColor: c.white }]}>
            <Text style={[styles.sectionTitle, { color: c.primary, fontSize: scale(15) }]}>Top 5 mais frequentadas</Text>
            {rankingList.map((r, i) => (
              <View key={r.nome} style={[styles.rankingRow, { borderBottomColor: c.surface }]}>
                <View style={[styles.rankingPos, { backgroundColor: c.primary }]}>
                  <Text style={[styles.rankingPosText, { fontSize: scale(13) }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rankingNome, { color: c.textPrimary, fontSize: scale(14) }]}>{r.nome}</Text>
                  <Text style={[styles.rankingSub, { color: c.textSecondary, fontSize: scale(11) }]}>
                    {r.qtd} evento(s) — {r.totalPresentes} presença(s)
                  </Text>
                </View>
                <Feather name="trending-up" size={16} color={c.success} />
              </View>
            ))}
          </View>
          </AnimatedEnter>
        )}

        <AnimatedEnter index={3}>
        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={styles.sectionTitle}>Todas as atividades</Text>
          {atividadesOrdenadas.length === 0 ? (
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhuma atividade neste mês</Text>
          ) : (
            atividadesOrdenadas.map((a) => (
              <View key={a.id} style={[styles.atividadeCard, { borderBottomColor: c.surface }]}>
                <View style={[styles.atividadeLeft, { backgroundColor: c.accent }]}>
                  <Feather name="activity" size={16} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.atividadeNome, { color: c.textPrimary, fontSize: scale(14) }]}>{a.nome}</Text>
                  <View style={styles.atividadeInfoRow}>
                    <Feather name="calendar" size={10} color={c.textSecondary} />
                    <Text style={[styles.atividadeInfo, { color: c.textSecondary }]}>{a.dataRegistro}</Text>
                    {a.horaRegistro && (
                      <>
                        <Feather name="clock" size={10} color={c.textSecondary} />
                        <Text style={[styles.atividadeInfo, { color: c.textSecondary }]}>{a.horaRegistro}</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.presentesBadge}>
                  <Feather name="user-check" size={11} color="#fff" />
                  <Text style={[styles.presentesText, { fontSize: scale(11) }]}>{(a.presentes || []).length}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmarExcluirAtiv(a)} style={styles.deleteIconBtn} hitSlop={6}>
                  <Feather name="trash-2" size={15} color={c.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        </AnimatedEnter>
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={24} color={colors.white} />
      </Pressable>

      <BottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: c.primary, fontSize: scale(17) }]}>Nova Atividade</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
            <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Nome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]} value={form.nome}
              placeholderTextColor={c.textSecondary}
              onChangeText={(v) => setForm({ ...form, nome: v })}
              placeholder="Ex: Ginastica Laboral"
            />
            <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Data</Text>
            <DateInput value={form.dataRegistro} onChange={(v) => setForm({ ...form, dataRegistro: v })} />
            <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Hora</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]} value={form.horaRegistro}
              placeholderTextColor={c.textSecondary}
              onChangeText={(v) => setForm({ ...form, horaRegistro: v })}
              placeholder="HH:MM"
            />
            </View>
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnTxt, { fontSize: scale(14) }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={criarAtividade}>
                <Text style={[styles.modalBtnTxt, { color: '#fff', fontSize: scale(14) }]}>Criar</Text>
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
        title="Excluir atividade?"
        message={excluirAlvo ? `"${excluirAlvo.nome}" de ${excluirAlvo.dataRegistro} será removida.` : ''}
        confirmLabel="Excluir"
        variant="danger"
        icon="trash-2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: colors.white, gap: 14,
  },
  arrow: { padding: 6 },
  monthTitle: { fontSize: 17, fontWeight: '800', color: colors.primary },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.white, padding: 14, borderRadius: 12,
    alignItems: 'center', elevation: 1,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: colors.white, marginHorizontal: 12, marginTop: 12,
    borderRadius: 12, padding: 14, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 10 },
  rankingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10,
    borderBottomWidth: 1, borderBottomColor: colors.surface,
  },
  rankingPos: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  rankingPosText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  rankingNome: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rankingSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  atividadeCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10,
    borderBottomWidth: 1, borderBottomColor: colors.surface,
  },
  atividadeLeft: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  atividadeNome: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  atividadeInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  atividadeInfo: { fontSize: 11, color: colors.textSecondary },
  deleteIconBtn: { padding: 6 },
  presentesBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  presentesText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.white, borderRadius: 20 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.primary },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 11,
    borderWidth: 1, borderColor: colors.border, fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  btnSave: { backgroundColor: colors.primary },
  modalBtnTxt: { fontWeight: '700', color: colors.textPrimary },
});
