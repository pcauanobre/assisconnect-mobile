import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  ActivityIndicator, RefreshControl, Modal, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getEstatisticas, getRelatorio, saveRelatorio,
  gerarPendentes, getRelatoriosPorAno,
} from '../services/relatorioService';
import PageTitle from '../components/PageTitle';
import FeedbackDialog from '../components/FeedbackDialog';
import AnimatedEnter from '../components/AnimatedEnter';
import AnimatedNumber from '../components/AnimatedNumber';
import useFeedback from '../hooks/useFeedback';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { gerarPDFRelatorio } from '../utils/pdfGenerator';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const STAT_COLORS = {
  total:     '#3D1F0C',
  ativo:     '#16a34a',
  inativo:   '#ca8a04',
  falecido:  '#dc2626',
  novo:      '#0ea5e9',
  neutro:    '#3D1F0C',
};

export default function RelatorioMensalScreen() {
  const { activeColors: c, scale } = useAccessibility();
  const anoReal = new Date().getFullYear();
  const mesReal = new Date().getMonth() + 1;

  const [mesSimulado, setMesSimulado] = useState(mesReal);
  const [anoSimulado, setAnoSimulado] = useState(anoReal);
  const [showSimModal, setShowSimModal] = useState(false);

  const [anoSelecionado, setAnoSelecionado] = useState(anoReal);

  const [relatoriosSalvos, setRelatoriosSalvos] = useState({});
  const [qtdMesAtual, setQtdMesAtual] = useState(null);
  const [loadingAno, setLoadingAno] = useState(false);

  const [expandedMonth, setExpandedMonth] = useState(null);
  const [stats, setStats] = useState(null);
  const [relatorio, setRelatorio] = useState(null);

  const fb = useFeedback();
  const [observacoes, setObservacoes] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isSimulando = mesSimulado !== mesReal || anoSimulado !== anoReal;

  const loadAno = useCallback(async (ano) => {
    setLoadingAno(true);
    try {
      if (ano < anoSimulado) {
        await gerarPendentes(13, ano).catch(() => {});
      } else if (ano === anoSimulado && mesSimulado > 1) {
        await gerarPendentes(mesSimulado, ano).catch(() => {});
      }

      const res = await getRelatoriosPorAno(ano);
      const map = {};
      (res.data || []).forEach((r) => { map[r.mes] = r; });
      setRelatoriosSalvos(map);

      if (ano === anoReal) {
        const statsRes = await getEstatisticas(mesReal, anoReal).catch(() => null);
        setQtdMesAtual(statsRes?.data?.quantidadeIdosos ?? null);
      }
    } catch {
      // mantém último ano carregado
    } finally {
      setLoadingAno(false);
    }
  }, [mesSimulado, anoSimulado]);

  useFocusEffect(
    useCallback(() => {
      loadAno(anoSelecionado);
    }, [anoSelecionado, loadAno])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadAno(anoSelecionado);
    setExpandedMonth(null);
    setRefreshing(false);
  }

  function avancarMes() {
    let novoMes = mesSimulado;
    let novoAno = anoSimulado;
    if (mesSimulado === 12) { novoMes = 1; novoAno++; }
    else { novoMes++; }
    setMesSimulado(novoMes);
    setAnoSimulado(novoAno);
    setAnoSelecionado(novoAno);
    setExpandedMonth(null);
  }

  function voltarMes() {
    let novoMes = mesSimulado;
    let novoAno = anoSimulado;
    if (mesSimulado === 1) { novoMes = 12; novoAno--; }
    else { novoMes--; }
    setMesSimulado(novoMes);
    setAnoSimulado(novoAno);
    setAnoSelecionado(novoAno);
    setExpandedMonth(null);
  }

  function resetarSimulacao() {
    setMesSimulado(mesReal);
    setAnoSimulado(anoReal);
    setAnoSelecionado(anoReal);
    setExpandedMonth(null);
    setShowSimModal(false);
  }

  function trocarAno(direcao) {
    setAnoSelecionado((a) => a + direcao);
    setExpandedMonth(null);
  }

  async function handleExpand(mes) {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    if (expandedMonth === mes) {
      setExpandedMonth(null);
      return;
    }

    setExpandedMonth(mes);
    setLoadingDetail(true);
    setStats(null);
    setRelatorio(null);

    try {
      const statsRes = await getEstatisticas(mes, anoSelecionado).catch(() => null);
      if (statsRes) setStats(statsRes.data);

      const relRes = await getRelatorio(mes, anoSelecionado).catch(() => null);
      if (relRes && relRes.data) {
        setRelatorio(relRes.data);
        setObservacoes(relRes.data.observacoes || '');
      } else {
        setObservacoes('');
      }
    } catch {
      // mantém último detalhamento carregado
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSave(mes) {
    try {
      setSaving(true);
      await saveRelatorio({
        mes,
        ano: anoSelecionado,
        quantidadeIdosos: stats?.quantidadeIdosos || 0,
        observacoes,
      });
      fb.success('Relatório salvo!', `Relatório de ${MESES[mes - 1]}/${anoSelecionado} arquivado.`, 1600);
      await loadAno(anoSelecionado);
    } catch {
      fb.error('Falha ao salvar', 'Não foi possível arquivar o relatório.');
    } finally {
      setSaving(false);
    }
  }

  const isAnoAtual = anoSelecionado === anoSimulado;
  const totalMeses = isAnoAtual ? mesSimulado : (anoSelecionado < anoSimulado ? 12 : 0);
  const mesesVisiveis = MESES.slice(0, totalMeses);

  function StatCardItem({ icon, value, label, kind, decimals }) {
    const accent = STAT_COLORS[kind] || STAT_COLORS.neutro;
    return (
      <View style={[styles.statItem, {
        backgroundColor: c.surfaceLight,
        borderLeftColor: accent,
        borderColor: c.border,
      }]}>
        <View style={styles.statHeader}>
          <Feather name={icon} size={14} color={accent} />
          <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(10) }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        {typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            decimals={decimals || 0}
            style={[styles.statValue, { color: accent, fontSize: scale(22) }]}
          />
        ) : (
          <Text style={[styles.statValue, { color: accent, fontSize: scale(22) }]}>{value || '-'}</Text>
        )}
      </View>
    );
  }

  function renderStats(data) {
    if (!data) return null;
    const pctF = Number(data.percentualFeminino || 0);
    const pctM = Number(data.percentualMasculino || 0);
    return (
      <>
        <View style={styles.statsGrid}>
          <StatCardItem icon="users" label="Total" value={data.quantidadeIdosos} kind="total" />
          <StatCardItem icon="user-check" label="Ativos" value={data.idososAtivos} kind="ativo" />
          <StatCardItem icon="user-x" label="Inativos" value={data.idososInativos} kind="inativo" />
          <StatCardItem icon="slash" label="Falecidos" value={data.idososFalecidos} kind="falecido" />
          <StatCardItem icon="user-plus" label="Novos" value={data.novosCadastros} kind="novo" />
          <StatCardItem icon="calendar" label="Média idade" value={data.mediaIdade} kind="neutro" decimals={1} />
          <StatCardItem icon="trending-up" label="Mais velho" value={data.idosoMaisVelho} kind="neutro" />
          <StatCardItem icon="trending-down" label="Mais novo" value={data.idosoMaisNovo} kind="neutro" />
        </View>

        {(data.quantidadeIdosos > 0 || pctF > 0 || pctM > 0) && (
          <View style={styles.genderBlock}>
            <Text style={[styles.genderTitle, { color: c.textSecondary, fontSize: scale(11) }]}>Distribuição por gênero</Text>
            <View style={[styles.genderBar, { borderColor: c.border }]}>
              {pctF > 0 && <View style={[styles.genderSegment, { flex: pctF, backgroundColor: '#ec4899' }]} />}
              {pctM > 0 && <View style={[styles.genderSegment, { flex: pctM, backgroundColor: '#3b82f6' }]} />}
            </View>
            <View style={styles.genderLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
                <Text style={[styles.legendText, { color: c.textPrimary, fontSize: scale(12) }]}>
                  Feminino — {pctF.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={[styles.legendText, { color: c.textPrimary, fontSize: scale(12) }]}>
                  Masculino — {pctM.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <PageTitle title="Relatórios" />

      <AnimatedEnter index={0}>
        <View style={[styles.yearBar, { backgroundColor: c.white, borderBottomColor: c.border }]}>
          <Pressable onPress={() => trocarAno(-1)} style={styles.yearArrow}>
            <Feather name="chevron-left" size={18} color={c.primary} />
          </Pressable>
          <Text style={[styles.yearText, { color: c.primary, fontSize: scale(16) }]}>{anoSelecionado}</Text>
          {anoSelecionado < anoSimulado ? (
            <Pressable onPress={() => trocarAno(1)} style={styles.yearArrow}>
              <Feather name="chevron-right" size={18} color={c.primary} />
            </Pressable>
          ) : <View style={{ width: 30 }} />}
        </View>
      </AnimatedEnter>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {loadingAno ? (
          <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
        ) : mesesVisiveis.length === 0 ? (
          <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(14) }]}>Nenhum relatorio para este ano.</Text>
        ) : (
          mesesVisiveis.map((nomeMes, index) => {
            const mes = index + 1;
            const isExpanded = expandedMonth === mes;
            const isCurrentMonth = anoSelecionado === anoReal && mes === mesReal;
            const isMesPassado = isAnoAtual ? mes < mesSimulado : anoSelecionado < anoSimulado;
            const salvo = relatoriosSalvos[mes];
            const qtd = salvo ? salvo.quantidadeIdosos : (isCurrentMonth ? qtdMesAtual : null);

            return (
              <AnimatedEnter key={mes} index={index + 1}>
                <View style={[
                  styles.monthCard,
                  { backgroundColor: c.white },
                  isCurrentMonth && { borderWidth: 1.5, borderColor: c.primary },
                ]}>
                  <Pressable style={styles.monthHeader} onPress={() => handleExpand(mes)}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.monthTitle, { color: c.textPrimary, fontSize: scale(16) }]}>{nomeMes} {anoSelecionado}</Text>
                        {salvo && salvo.fechado && (
                          <Feather name="check-circle" size={14} color="#16a34a" />
                        )}
                        {isCurrentMonth && (
                          <View style={[styles.currentBadge, { borderColor: c.primary }]}>
                            <Text style={[styles.currentBadgeText, { color: c.primary, fontSize: scale(10) }]}>Mês atual</Text>
                          </View>
                        )}
                      </View>
                      {qtd != null && !isExpanded && (
                        <Text style={[styles.monthSub, { color: c.textSecondary, fontSize: scale(12) }]}>{qtd} idosos</Text>
                      )}
                    </View>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={c.primary} />
                  </Pressable>

                  {isExpanded && (
                    <View style={[styles.detailSection, { borderTopColor: c.surface }]}>
                      {loadingDetail ? (
                        <ActivityIndicator size="small" color={c.primary} style={{ paddingVertical: 20 }} />
                      ) : (
                        <>
                          {isMesPassado && salvo && salvo.fechado && (
                            <View style={styles.savedBadge}>
                              <Feather name="lock" size={12} color={c.textSecondary} />
                              <Text style={[styles.savedBadgeText, { color: c.textSecondary, fontSize: scale(11) }]}>Relatorio fechado</Text>
                            </View>
                          )}
                          {renderStats(stats)}

                          <Text style={[styles.label, { marginTop: 14, color: c.textPrimary, fontSize: scale(14) }]}>Observações</Text>
                          <TextInput
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline
                            style={[styles.input, styles.multiline, { backgroundColor: c.surfaceLight, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
                            placeholder="Observações do mês..."
                            placeholderTextColor={c.textSecondary}
                            editable={isCurrentMonth}
                          />

                          {isCurrentMonth && (
                            <Pressable
                              style={({ pressed }) => [styles.saveBtn, { backgroundColor: c.primary }, pressed && { opacity: 0.85 }]}
                              onPress={() => handleSave(mes)}
                              disabled={saving}
                            >
                              {saving ? (
                                <ActivityIndicator color="#fff" />
                              ) : (
                                <>
                                  <Feather name="check" size={16} color="#fff" />
                                  <Text style={[styles.saveBtnText, { fontSize: scale(15) }]}>Confirmar relatório</Text>
                                </>
                              )}
                            </Pressable>
                          )}

                          <Pressable
                            style={({ pressed }) => [styles.pdfBtn, { backgroundColor: c.primary, borderColor: c.primary }, pressed && { opacity: 0.85 }]}
                            onPress={async () => {
                              try {
                                await gerarPDFRelatorio(
                                  { estatisticas: stats, observacoes },
                                  mes,
                                  anoSelecionado,
                                  ({ type, title, message }) => {
                                    if (type === 'error') fb.error(title, message);
                                    else fb.success(title, message, 1600);
                                  }
                                );
                              } catch {
                                fb.error('Falha ao gerar PDF', 'Não foi possível exportar o relatório.');
                              }
                            }}
                          >
                            <Feather name="download" size={15} color="#fff" />
                            <Text style={[styles.pdfBtnText, { fontSize: scale(14) }]}>Exportar PDF</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </AnimatedEnter>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showSimModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: c.white }]}>
            <Text style={[styles.modalTitle, { color: c.primary, fontSize: scale(18) }]}>Simulacao de Tempo</Text>
            <Text style={[styles.modalDesc, { color: c.textSecondary, fontSize: scale(13) }]}>
              Avance ou volte meses para simular a passagem do tempo.{'\n'}
              Meses anteriores serao fechados automaticamente com os dados do banco.
            </Text>

            <View style={styles.modalNav}>
              <Pressable onPress={voltarMes} style={[styles.modalArrow, { backgroundColor: c.surfaceLight }]}>
                <Feather name="chevron-left" size={24} color={c.primary} />
              </Pressable>
              <Text style={[styles.modalCurrent, { color: c.textPrimary, fontSize: scale(18) }]}>
                {MESES[mesSimulado - 1]} {anoSimulado}
              </Text>
              <Pressable onPress={avancarMes} style={[styles.modalArrow, { backgroundColor: c.surfaceLight }]}>
                <Feather name="chevron-right" size={24} color={c.primary} />
              </Pressable>
            </View>

            {isSimulando && (
              <Pressable style={styles.resetBtn} onPress={resetarSimulacao}>
                <Feather name="rotate-ccw" size={16} color={c.white} />
                <Text style={[styles.resetBtnText, { fontSize: scale(14) }]}>Voltar para hoje</Text>
              </Pressable>
            )}

            <Pressable style={styles.closeBtn} onPress={() => setShowSimModal(false)}>
              <Text style={[styles.closeBtnText, { color: c.textSecondary, fontSize: scale(14) }]}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FeedbackDialog
        visible={fb.visible}
        onClose={fb.close}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        autoCloseMs={fb.autoCloseMs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 30 },
  emptyText: { textAlign: 'center', fontStyle: 'italic', paddingVertical: 40 },

  yearBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 16, borderBottomWidth: 1,
  },
  yearArrow: { padding: 4 },
  yearText: { fontWeight: '700' },

  monthCard: {
    borderRadius: 14, marginBottom: 10,
    elevation: 2, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)', overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  monthTitle: { fontWeight: '700' },
  monthSub: { marginTop: 4 },
  currentBadge: {
    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
  },
  currentBadgeText: { fontWeight: '700' },
  savedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, marginTop: 4,
  },
  savedBadgeText: { fontStyle: 'italic' },

  detailSection: {
    paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  statItem: {
    width: '47.5%', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderLeftWidth: 3,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statValue: { fontWeight: '800' },
  statLabel: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, flex: 1 },

  genderBlock: { marginTop: 16 },
  genderTitle: { fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  genderBar: {
    flexDirection: 'row', borderRadius: 8, overflow: 'hidden',
    height: 14, borderWidth: 1,
  },
  genderSegment: {},
  genderLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontWeight: '600' },

  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 12, paddingVertical: 13, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  pdfBtn: {
    marginTop: 10, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  pdfBtnText: { color: '#fff', fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalBox: {
    borderRadius: 16, padding: 24,
    width: '100%', alignItems: 'center',
  },
  modalTitle: { fontWeight: '800', marginBottom: 8 },
  modalDesc: { textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalNav: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  modalArrow: { padding: 10, borderRadius: 10 },
  modalCurrent: { fontWeight: '700' },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 10, marginBottom: 10,
  },
  resetBtnText: { color: '#fff', fontWeight: '700' },
  closeBtn: { paddingVertical: 10, paddingHorizontal: 30 },
  closeBtnText: { fontWeight: '600' },
});
