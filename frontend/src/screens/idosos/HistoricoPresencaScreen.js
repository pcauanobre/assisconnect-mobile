import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAtividades } from '../../services/atividadeService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function HistoricoPresencaScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [dias, setDias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, [mes, ano]);

  async function carregar() {
    try {
      setLoading(true);
      const diasMes = new Date(ano, mes, 0).getDate();
      const resultados = [];
      for (let d = 1; d <= diasMes; d++) {
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        try {
          const res = await getAtividades({ data: dataStr });
          const atividades = res.data || [];
          if (atividades.length === 0) {
            resultados.push({ dia: d, status: 'sem-atividade' });
          } else {
            const presente = atividades.some(a =>
              (a.presentes || []).some(p => String(p.nome).toLowerCase() === String(idosoNome).toLowerCase())
            );
            resultados.push({ dia: d, status: presente ? 'presente' : 'ausente' });
          }
        } catch {
          resultados.push({ dia: d, status: 'sem-atividade' });
        }
      }
      setDias(resultados);
    } finally { setLoading(false); }
  }

  function mudarMes(delta) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 1) { novoMes = 12; novoAno--; }
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    setMes(novoMes);
    setAno(novoAno);
  }

  const comAtividade = dias.filter(d => d.status !== 'sem-atividade');
  const presentes = dias.filter(d => d.status === 'presente').length;
  const totalComAtv = comAtividade.length;
  const pct = totalComAtv > 0 ? Math.round((presentes / totalComAtv) * 100) : 0;

  if (loading) return <LoadingOverlay />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{idosoNome}</Text>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.arrow}>
            <Feather name="chevron-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MESES[mes - 1]} / {ano}</Text>
          <TouchableOpacity onPress={() => mudarMes(1)} style={styles.arrow}>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{presentes}</Text>
          <Text style={styles.statLabel}>Presencas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.danger }]}>{totalComAtv - presentes}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>{pct}%</Text>
          <Text style={styles.statLabel}>Presenca</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Legend color={colors.success} label="Presente" />
        <Legend color={colors.danger} label="Ausente" />
        <Legend color={colors.border} label="Sem atividade" />
      </View>

      <View style={styles.calendar}>
        {dias.map((d) => (
          <View
            key={d.dia}
            style={[
              styles.day,
              d.status === 'presente' && { backgroundColor: colors.success },
              d.status === 'ausente' && { backgroundColor: colors.danger },
              d.status === 'sem-atividade' && { backgroundColor: colors.border },
            ]}
          >
            <Text style={[
              styles.dayText,
              (d.status === 'presente' || d.status === 'ausente') && { color: colors.white },
            ]}>{d.dia}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Legend({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.white, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  subtitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 14 },
  arrow: { padding: 6 },
  monthTitle: { fontSize: 16, fontWeight: '800', color: colors.primary },
  statsCard: {
    flexDirection: 'row', backgroundColor: colors.white, margin: 12, padding: 14,
    borderRadius: 12, elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 11, color: colors.textSecondary },
  calendar: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 12, gap: 6,
  },
  day: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
});
