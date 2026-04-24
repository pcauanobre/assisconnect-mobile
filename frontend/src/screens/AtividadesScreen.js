import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAtividades, saveAtividade } from '../services/atividadeService';
import ScreenHeader from '../components/ScreenHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../theme/colors';

export default function AtividadesScreen({ navigation }) {
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
      Alert.alert('Atencao', 'Informe o nome da atividade.');
      return;
    }
    try {
      await saveAtividade({
        nome: form.nome, dataRegistro: form.dataRegistro,
        horaRegistro: form.horaRegistro, presentes: [],
      });
      setModalVisible(false);
      setForm({ nome: '', dataRegistro: hoje.toISOString().slice(0, 10), horaRegistro: '14:00' });
      await carregar();
      Alert.alert('Sucesso', 'Atividade criada. Registre presenca na aba Registro.');
    } catch { Alert.alert('Erro', 'Falha ao criar atividade.'); }
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

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  if (loading) return <LoadingOverlay />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader title="Atividades" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.arrow}>
            <Feather name="chevron-left" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MESES[mes - 1]} / {ano}</Text>
          <TouchableOpacity onPress={() => mudarMes(1)} style={styles.arrow}>
            <Feather name="chevron-right" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="calendar" size={18} color={colors.primary} />
            <Text style={styles.statValue}>{atividadesMes.length}</Text>
            <Text style={styles.statLabel}>Atividades</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="users" size={18} color={colors.primary} />
            <Text style={styles.statValue}>
              {atividadesMes.reduce((acc, a) => acc + (a.presentes || []).length, 0)}
            </Text>
            <Text style={styles.statLabel}>Presencas</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="star" size={18} color={colors.primary} />
            <Text style={styles.statValue}>{Object.keys(ranking).length}</Text>
            <Text style={styles.statLabel}>Tipos</Text>
          </View>
        </View>

        {rankingList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 mais frequentadas</Text>
            {rankingList.map((r, i) => (
              <View key={r.nome} style={styles.rankingRow}>
                <View style={styles.rankingPos}>
                  <Text style={styles.rankingPosText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankingNome}>{r.nome}</Text>
                  <Text style={styles.rankingSub}>
                    {r.qtd} evento(s) — {r.totalPresentes} presenca(s)
                  </Text>
                </View>
                <Feather name="trending-up" size={16} color={colors.success} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todas as atividades</Text>
          {atividadesOrdenadas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma atividade neste mes</Text>
          ) : (
            atividadesOrdenadas.map((a) => (
              <View key={a.id} style={styles.atividadeCard}>
                <View style={styles.atividadeLeft}>
                  <Feather name="activity" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.atividadeNome}>{a.nome}</Text>
                  <View style={styles.atividadeInfoRow}>
                    <Feather name="calendar" size={10} color={colors.textSecondary} />
                    <Text style={styles.atividadeInfo}>{a.dataRegistro}</Text>
                    {a.horaRegistro && (
                      <>
                        <Feather name="clock" size={10} color={colors.textSecondary} />
                        <Text style={styles.atividadeInfo}>{a.horaRegistro}</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.presentesBadge}>
                  <Feather name="user-check" size={11} color={colors.white} />
                  <Text style={styles.presentesText}>{(a.presentes || []).length}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={26} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Atividade</Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input} value={form.nome}
              onChangeText={(v) => setForm({ ...form, nome: v })}
              placeholder="Ex: Ginastica Laboral"
            />
            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input} value={form.dataRegistro}
              onChangeText={(v) => setForm({ ...form, dataRegistro: v })}
              placeholder="AAAA-MM-DD"
            />
            <Text style={styles.label}>Hora</Text>
            <TextInput
              style={styles.input} value={form.horaRegistro}
              onChangeText={(v) => setForm({ ...form, horaRegistro: v })}
              placeholder="HH:MM"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={criarAtividade}>
                <Text style={[styles.modalBtnTxt, { color: colors.white }]}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  presentesBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  presentesText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surfaceLight, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
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
