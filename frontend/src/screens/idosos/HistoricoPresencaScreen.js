import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAtividades } from '../../services/atividadeService';
import LoadingOverlay from '../../components/LoadingOverlay';
import MonthYearPicker from '../../components/MonthYearPicker';
import { useAccessibility } from '../../contexts/AccessibilityContext';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function HistoricoPresencaScreen({ route }) {
  const { idosoId, idosoNome } = route.params;
  const { activeColors: c, scale } = useAccessibility();
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
    <ScrollView
        showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: c.surface }]} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={[styles.header, { backgroundColor: c.white, borderBottomColor: c.border }]}>
        <Text style={[styles.subtitle, { color: c.textPrimary, fontSize: scale(15) }]}>{idosoNome}</Text>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.arrow}>
            <Feather name="chevron-left" size={20} color={c.primary} />
          </TouchableOpacity>
          <MonthYearPicker
            mes={mes}
            ano={ano}
            onChange={(m, a) => { setMes(m); setAno(a); }}
          />
          <TouchableOpacity onPress={() => mudarMes(1)} style={styles.arrow}>
            <Feather name="chevron-right" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: c.white }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.primary, fontSize: scale(22) }]}>{presentes}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Presenças</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.danger, fontSize: scale(22) }]}>{totalComAtv - presentes}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Faltas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.success, fontSize: scale(22) }]}>{pct}%</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Presença</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Legend color={c.success} label="Presente" textColor={c.textSecondary} fontSize={scale(11)} />
        <Legend color={c.danger}  label="Ausente"  textColor={c.textSecondary} fontSize={scale(11)} />
        <Legend color={c.border}  label="Sem atividade" textColor={c.textSecondary} fontSize={scale(11)} />
      </View>

      <View style={styles.calendar}>
        {DIAS_SEMANA.map((ds) => (
          <View key={ds} style={styles.weekLabel}>
            <Text style={[styles.weekLabelText, { color: c.textSecondary, fontSize: scale(11) }]}>{ds}</Text>
          </View>
        ))}
        {Array.from({ length: new Date(ano, mes - 1, 1).getDay() }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.day} />
        ))}
        {dias.map((d) => (
          <View
            key={d.dia}
            style={[
              styles.day,
              { backgroundColor: c.white },
              d.status === 'presente' && { backgroundColor: c.success },
              d.status === 'ausente' && { backgroundColor: c.danger },
              d.status === 'sem-atividade' && { backgroundColor: c.border },
            ]}
          >
            <Text style={[
              styles.dayText,
              { color: c.textPrimary, fontSize: scale(13) },
              (d.status === 'presente' || d.status === 'ausente') && { color: '#fff' },
            ]}>{d.dia}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Legend({ color, label, textColor, fontSize }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: textColor, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 14, borderBottomWidth: 1 },
  subtitle: { fontWeight: '700' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 14 },
  arrow: { padding: 6 },
  statsCard: {
    flexDirection: 'row', margin: 12, padding: 14,
    borderRadius: 12, elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '800' },
  statLabel: { marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: {},
  calendar: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6,
  },
  weekLabel: {
    width: 40, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  weekLabelText: { fontWeight: '700' },
  day: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontWeight: '700' },
});
