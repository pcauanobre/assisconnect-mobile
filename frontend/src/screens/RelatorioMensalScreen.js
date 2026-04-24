import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  Alert, ActivityIndicator, RefreshControl, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getEstatisticas, getRelatorio, saveRelatorio,
  gerarPendentes, getRelatoriosPorAno,
} from '../services/relatorioService';
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { gerarPDFRelatorio } from '../utils/pdfGenerator';
import { getDadosCompletosRelatorio } from '../services/relatorioExportService';

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function RelatorioMensalScreen() {
  const { activeColors: c, scale } = useAccessibility();
  const anoReal = new Date().getFullYear();
  const mesReal = new Date().getMonth() + 1;

  // Simulacao de tempo (engrenagem)
  const [mesSimulado, setMesSimulado] = useState(mesReal);
  const [anoSimulado, setAnoSimulado] = useState(anoReal);
  const [showSimModal, setShowSimModal] = useState(false);

  // Ano sendo visualizado (filtro por ano)
  const [anoSelecionado, setAnoSelecionado] = useState(anoReal);

  // Relatorios salvos do ano selecionado
  const [relatoriosSalvos, setRelatoriosSalvos] = useState({});
  const [qtdMesAtual, setQtdMesAtual] = useState(null);
  const [loadingAno, setLoadingAno] = useState(false);

  // Detalhes do mes expandido
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [stats, setStats] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isSimulando = mesSimulado !== mesReal || anoSimulado !== anoReal;

  // Carrega relatorios salvos do ano
  const loadAno = useCallback(async (ano) => {
    setLoadingAno(true);
    try {
      // Gera pendentes: ano atual usa mesSimulado, anos passados gera todos os 12 meses
      if (ano < anoSimulado) {
        await gerarPendentes(13, ano).catch(() => {});
      } else if (ano === anoSimulado && mesSimulado > 1) {
        await gerarPendentes(mesSimulado, ano).catch(() => {});
      }

      // Carrega todos os relatorios salvos do ano
      const res = await getRelatoriosPorAno(ano);
      const map = {};
      (res.data || []).forEach((r) => { map[r.mes] = r; });
      setRelatoriosSalvos(map);

      // Busca qtd de idosos do mes atual (sem relatorio salvo ainda)
      if (ano === anoReal) {
        const statsRes = await getEstatisticas(mesReal, anoReal).catch(() => null);
        setQtdMesAtual(statsRes?.data?.quantidadeIdosos ?? null);
      }
    } catch (e) {
      console.log('[RELATORIO] Erro ao carregar ano:', e);
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

  // Navegacao de simulacao
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

  // Navegacao de ano (filtro)
  function trocarAno(direcao) {
    setAnoSelecionado((a) => a + direcao);
    setExpandedMonth(null);
  }

  // Expandir mes
  async function handleExpand(mes) {
    if (expandedMonth === mes) {
      setExpandedMonth(null);
      return;
    }

    setExpandedMonth(mes);
    setLoadingDetail(true);
    setStats(null);
    setRelatorio(null);

    try {
      // Pega estatisticas em tempo real
      const statsRes = await getEstatisticas(mes, anoSelecionado).catch(() => null);
      if (statsRes) setStats(statsRes.data);

      // Pega relatorio salvo (se existir)
      const relRes = await getRelatorio(mes, anoSelecionado).catch(() => null);
      if (relRes && relRes.data) {
        setRelatorio(relRes.data);
        setObservacoes(relRes.data.observacoes || '');
      } else {
        setObservacoes('');
      }
    } catch (e) {
      console.log('[RELATORIO] Erro:', e);
    } finally {
      setLoadingDetail(false);
    }
  }

  // Salvar relatorio do mes atual
  async function handleSave(mes) {
    try {
      setSaving(true);
      await saveRelatorio({
        mes,
        ano: anoSelecionado,
        quantidadeIdosos: stats?.quantidadeIdosos || 0,
        observacoes,
      });
      Alert.alert('Sucesso', 'Relatorio salvo!');
      // Recarrega
      await loadAno(anoSelecionado);
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar o relatorio.');
    } finally {
      setSaving(false);
    }
  }

  // Quantos meses mostrar
  const isAnoAtual = anoSelecionado === anoSimulado;
  const totalMeses = isAnoAtual ? mesSimulado : (anoSelecionado < anoSimulado ? 12 : 0);
  const mesesVisiveis = MESES.slice(0, totalMeses);

  function renderStats(data) {
    if (!data) return null;
    return (
      <>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: '#f0e6d9' }]}>
            <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{data.quantidadeIdosos}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Total Idosos</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#d9f0d9' }]}>
            <Text style={[styles.statValue, { color: '#16a34a', fontSize: scale(22) }]}>{data.idososAtivos}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Ativos</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f0f0d9' }]}>
            <Text style={[styles.statValue, { color: '#ca8a04', fontSize: scale(22) }]}>{data.idososInativos}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Inativos</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f0d9d9' }]}>
            <Text style={[styles.statValue, { color: '#dc2626', fontSize: scale(22) }]}>{data.idososFalecidos}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Falecidos</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: c.surfaceLight }]}>
            <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{data.novosCadastros}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Novos no mes</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: c.surfaceLight }]}>
            <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{typeof data.mediaIdade === 'number' ? data.mediaIdade.toFixed(1) : data.mediaIdade}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Media Idade</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: c.surfaceLight }]}>
            <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{data.idosoMaisVelho || '-'}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Mais velho</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: c.surfaceLight }]}>
            <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{data.idosoMaisNovo || '-'}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Mais novo</Text>
          </View>
        </View>

        {(data.quantidadeIdosos > 0 || data.percentualFeminino > 0) && (
          <View style={styles.genderBar}>
            {(data.percentualFeminino || 0) > 0 && (
              <View style={[styles.genderSegment, { flex: data.percentualFeminino, backgroundColor: '#ec4899' }]}>
                <Text style={styles.genderText}>{data.percentualFeminino?.toFixed?.(0) || Math.round(data.percentualFeminino)}% F</Text>
              </View>
            )}
            {(data.percentualMasculino || 0) > 0 && (
              <View style={[styles.genderSegment, { flex: data.percentualMasculino, backgroundColor: '#3b82f6' }]}>
                <Text style={styles.genderText}>{data.percentualMasculino?.toFixed?.(0) || Math.round(data.percentualMasculino)}% M</Text>
              </View>
            )}
          </View>
        )}
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScreenHeader title="Relatorios" />

      {/* Filtro de ano */}
      <View style={[styles.yearBar, { backgroundColor: c.white, borderBottomColor: c.border }]}>
        <Pressable onPress={() => trocarAno(-1)} style={styles.yearArrow}>
          <Feather name="chevron-left" size={18} color={c.primary} />
        </Pressable>
        <Text style={[styles.yearText, { color: c.primary, fontSize: scale(16) }]}>{anoSelecionado}</Text>
        {anoSelecionado < anoSimulado && (
          <Pressable onPress={() => trocarAno(1)} style={styles.yearArrow}>
            <Feather name="chevron-right" size={18} color={c.primary} />
          </Pressable>
        )}
        {anoSelecionado >= anoSimulado && <View style={{ width: 30 }} />}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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

            return (
              <View key={mes} style={[
                styles.monthCard,
                { backgroundColor: c.white },
                isCurrentMonth && { borderWidth: 2, borderColor: c.primary },
              ]}>
                <Pressable style={styles.monthHeader} onPress={() => handleExpand(mes)}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.monthTitle, { color: c.textPrimary, fontSize: scale(16) }]}>{nomeMes} {anoSelecionado}</Text>
                      {salvo && salvo.fechado && (
                        <Feather name="check-circle" size={14} color="#16a34a" />
                      )}
                    </View>
                    {(() => {
                      const qtd = salvo ? salvo.quantidadeIdosos : (isCurrentMonth ? qtdMesAtual : null);
                      return (isCurrentMonth || (qtd != null && !isExpanded)) ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          {qtd != null && !isExpanded && (
                            <Text style={[styles.monthSub, { color: c.textSecondary, fontSize: scale(12) }]}>{qtd} idosos</Text>
                          )}
                          {isCurrentMonth && (
                            <Text style={[styles.currentBadge, { color: c.primary, backgroundColor: c.accent, fontSize: scale(10) }]}>Mes atual</Text>
                          )}
                        </View>
                      ) : null;
                    })()}
                  </View>
                  <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={c.primary} />
                </Pressable>

                {isExpanded && (
                  <View style={[styles.detailSection, { borderTopColor: c.surface }]}>
                    {loadingDetail ? (
                      <ActivityIndicator size="small" color={c.primary} style={{ paddingVertical: 20 }} />
                    ) : (
                      <>
                        {/* Sempre mostra estatisticas em tempo real */}
                        {isMesPassado && salvo && salvo.fechado && (
                          <View style={styles.savedBadge}>
                            <Feather name="lock" size={12} color={c.textSecondary} />
                            <Text style={[styles.savedBadgeText, { color: c.textSecondary, fontSize: scale(11) }]}>Relatorio fechado</Text>
                          </View>
                        )}
                        {renderStats(stats)}

                        <Text style={[styles.label, { marginTop: 12, color: c.textPrimary, fontSize: scale(14) }]}>Observacoes</Text>
                        <TextInput
                          value={observacoes}
                          onChangeText={setObservacoes}
                          multiline
                          style={[styles.input, styles.multiline, { backgroundColor: c.surfaceLight, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
                          placeholder="Observacoes do mes..."
                          placeholderTextColor={c.textSecondary}
                          editable={isCurrentMonth}
                        />

                        {isCurrentMonth && (
                          <Pressable
                            style={({ pressed }) => [styles.saveBtn, { backgroundColor: c.primary }, pressed && { opacity: 0.8 }]}
                            onPress={() => handleSave(mes)}
                            disabled={saving}
                          >
                            {saving ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <Text style={[styles.saveBtnText, { fontSize: scale(16) }]}>Confirmar Relatorio</Text>
                            )}
                          </Pressable>
                        )}

                        <Pressable
                          style={({ pressed }) => [styles.pdfBtn, pressed && { opacity: 0.8 }]}
                          onPress={async () => {
                            try {
                              const res = await getDadosCompletosRelatorio(mes, anoSelecionado);
                              await gerarPDFRelatorio(res.data, mes, anoSelecionado);
                            } catch (e) {
                              Alert.alert('Erro', 'Falha ao obter dados para o PDF.');
                            }
                          }}
                        >
                          <Feather name="file-text" size={14} color={c.white} />
                          <Text style={[styles.pdfBtnText, { fontSize: scale(14) }]}>Exportar PDF</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal de simulacao */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 30 },
  emptyText: {
    textAlign: 'center', fontSize: 14,
    fontStyle: 'italic', paddingVertical: 40,
  },

  // Barra de simulacao
  simBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 8,
  },
  simArrow: { padding: 6 },
  simCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  simText: { fontSize: 15, fontWeight: '600' },
  simBadge: { backgroundColor: '#ef4444', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  simBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  gearBtn: { padding: 6 },

  // Filtro de ano
  yearBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, gap: 16,
    borderBottomWidth: 1,
  },
  yearArrow: { padding: 4 },
  yearText: { fontWeight: '700' },

  // Cards de mes
  monthCard: {
    borderRadius: 12, marginBottom: 10,
    elevation: 1, boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  monthTitle: { fontWeight: '700' },
  monthSub: { marginTop: 2 },
  currentBadge: {
    fontWeight: '700',
    alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 3,
  },
  savedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, marginTop: 4,
  },
  savedBadgeText: { fontStyle: 'italic' },

  // Detalhes expandido
  detailSection: {
    paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  statItem: {
    width: '47%', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  statValue: { fontWeight: '800' },
  statLabel: { marginTop: 2 },

  // Barra de genero
  genderBar: {
    flexDirection: 'row', borderRadius: 8, overflow: 'hidden',
    marginTop: 10, height: 28,
  },
  genderSegment: { justifyContent: 'center', alignItems: 'center' },
  genderText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Form
  label: { fontWeight: '700', marginBottom: 6 },
  input: {
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 12, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  pdfBtn: {
    marginTop: 10, backgroundColor: '#7c3aed', paddingVertical: 12, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  pdfBtnText: { color: '#fff', fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalBox: {
    borderRadius: 16, padding: 24,
    width: '100%', alignItems: 'center',
  },
  modalTitle: { fontWeight: '800', marginBottom: 8 },
  modalDesc: {
    textAlign: 'center',
    marginBottom: 20, lineHeight: 18,
  },
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
