import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getEstatisticas, getRelatorio, saveRelatorio } from '../services/relatorioService';
import { getCountByMonth } from '../services/idosoService';
import colors from '../theme/colors';

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function RelatorioMensalScreen() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [expandedMonth, setExpandedMonth] = useState(null);
  const [stats, setStats] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qtdPorMes, setQtdPorMes] = useState({});

  async function loadMonthCounts() {
    const counts = {};
    const promises = [];
    for (let m = 1; m <= mesAtual; m++) {
      promises.push(
        getCountByMonth(anoAtual, m)
          .then((res) => { counts[m] = res.data?.quantidade || res.data || 0; })
          .catch(() => { counts[m] = 0; })
      );
    }
    await Promise.all(promises);
    setQtdPorMes(counts);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadMonthCounts();
    setRefreshing(false);
  }

  React.useEffect(() => {
    loadMonthCounts();
  }, []);

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
      const [statsRes, relRes] = await Promise.allSettled([
        getEstatisticas(mes, anoAtual),
        getRelatorio(mes, anoAtual),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (relRes.status === 'fulfilled' && relRes.value.data) {
        setRelatorio(relRes.value.data);
        setObservacoes(relRes.value.data.observacoes || '');
      } else {
        setObservacoes('');
      }
    } catch (e) {
      console.log('[RELATORIO] Erro:', e);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSave(mes) {
    try {
      setSaving(true);
      await saveRelatorio({
        mes,
        ano: anoAtual,
        quantidadeIdosos: stats?.quantidadeIdosos || 0,
        observacoes,
      });
      Alert.alert('Sucesso', 'Relatorio salvo!');
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar o relatorio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {MESES.slice(0, mesAtual).map((nomeMes, index) => {
        const mes = index + 1;
        const isExpanded = expandedMonth === mes;
        const isCurrentMonth = mes === mesAtual;

        return (
          <View key={mes} style={styles.monthCard}>
            <Pressable style={styles.monthHeader} onPress={() => handleExpand(mes)}>
              <View>
                <Text style={styles.monthTitle}>{nomeMes} {anoAtual}</Text>
                <Text style={styles.monthSub}>
                  {qtdPorMes[mes] !== undefined ? `${qtdPorMes[mes]} idosos` : '...'}
                </Text>
              </View>
              <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </Pressable>

            {isExpanded && (
              <View style={styles.detailSection}>
                {loadingDetail ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 20 }} />
                ) : (
                  <>
                    {stats && (
                      <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{stats.quantidadeIdosos}</Text>
                          <Text style={styles.statLabel}>Idosos</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{stats.mediaIdade?.toFixed(1)}</Text>
                          <Text style={styles.statLabel}>Media Idade</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{stats.percentualFeminino?.toFixed(0)}%</Text>
                          <Text style={styles.statLabel}>Feminino</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{stats.percentualMasculino?.toFixed(0)}%</Text>
                          <Text style={styles.statLabel}>Masculino</Text>
                        </View>
                      </View>
                    )}

                    <Text style={[styles.label, { marginTop: 12 }]}>Observacoes</Text>
                    <TextInput
                      value={observacoes}
                      onChangeText={setObservacoes}
                      multiline
                      style={[styles.input, styles.multiline]}
                      placeholder="Observacoes do mes..."
                      placeholderTextColor={colors.textSecondary}
                      editable={isCurrentMonth}
                    />

                    {isCurrentMonth && (
                      <Pressable
                        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
                        onPress={() => handleSave(mes)}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.saveBtnText}>Confirmar Relatorio</Text>
                        )}
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 12, paddingBottom: 30 },
  monthCard: {
    backgroundColor: colors.white, borderRadius: 12, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  monthSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  detailSection: {
    paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8,
  },
  statItem: {
    width: '47%', backgroundColor: colors.surfaceLight, borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 12, backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
