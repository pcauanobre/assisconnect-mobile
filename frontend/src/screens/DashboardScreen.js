import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Image, Animated, Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getIdososCount, getAniversariantesDoMes } from '../services/idosoService';
import { getCardapioHoje } from '../services/cardapioService';
import { getAtividadesHoje, getDiasComRegistro } from '../services/atividadeService';
import { getUsuariosCount } from '../services/usuarioService';
import { getIdososSemVisita } from '../services/visitaService';
import StatCard from '../components/StatCard';
import AnimatedEnter from '../components/AnimatedEnter';
import { calcularIdade } from '../utils/helpers';

export default function DashboardScreen({ navigation }) {
  const { activeColors: c, config, scale } = useAccessibility();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ idosos: 0, aniversarios: 0, atividades: 0, colaboradores: 0 });
  const [menuHoje, setMenuHoje] = useState(null);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [atividadesHoje, setAtividadesHoje] = useState([]);
  const [semVisita, setSemVisita] = useState([]);
  const [diasRegistrados, setDiasRegistrados] = useState(0);
  const [totalDiasMes, setTotalDiasMes] = useState(0);

  const alertWarnBg = config.darkMode ? 'rgba(217,119,6,0.15)' : '#fef3c7';
  const alertInfoBg = config.darkMode ? 'rgba(37,99,235,0.15)' : '#dbeafe';
  const alertOkBg   = config.darkMode ? 'rgba(22,163,74,0.15)'  : '#dcfce7';

  const loadData = useCallback(async () => {
    try {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth() + 1;
      const mm = String(mes).padStart(2, '0');
      const diasNoMes = new Date(ano, mes, 0).getDate();
      const inicio = `${ano}-${mm}-01`;
      const fim = `${ano}-${mm}-${String(diasNoMes).padStart(2, '0')}`;

      const [idososRes, anivRes, menuRes, ativRes, usersRes, semVisRes, diasRes] =
        await Promise.allSettled([
          getIdososCount(), getAniversariantesDoMes(), getCardapioHoje(),
          getAtividadesHoje(), getUsuariosCount(), getIdososSemVisita(30),
          getDiasComRegistro(inicio, fim),
        ]);

      const idososCount = idososRes.status === 'fulfilled' ? idososRes.value.data : 0;
      const anivData    = anivRes.status  === 'fulfilled' ? anivRes.value.data  : [];
      const menuData    = menuRes.status  === 'fulfilled' ? menuRes.value.data  : null;
      const ativData    = ativRes.status  === 'fulfilled' ? ativRes.value.data  : [];
      const usersCount  = usersRes.status === 'fulfilled' ? usersRes.value.data : 0;
      const semVisData  = semVisRes.status === 'fulfilled' ? semVisRes.value.data : [];
      const registrados = diasRes.status === 'fulfilled' ? (diasRes.value.data ?? 0) : 0;

      setStats({ idosos: idososCount, aniversarios: anivData.length, atividades: ativData.length, colaboradores: usersCount });
      setMenuHoje(menuData);
      setAniversariantes(anivData);
      setAtividadesHoje(ativData);
      setSemVisita(semVisData);
      setDiasRegistrados(registrados);
      setTotalDiasMes(diasNoMes);
    } catch {
      // ignora — UI mostra valores 0 / vazios
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const progresso = totalDiasMes > 0 ? (diasRegistrados / totalDiasMes) * 100 : 0;

  // Animação da barra de progresso
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progresso,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progresso, progressAnim]);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {/* Stats */}
        <AnimatedEnter index={0}>
          <View style={styles.statsRow}>
            <StatCard icon="users"     label="Total Idosos"    value={stats.idosos}       color={c.primary} />
            <StatCard icon="gift"      label="Aniversários"    value={stats.aniversarios}  color="#d97706" />
          </View>
        </AnimatedEnter>
        <AnimatedEnter index={1}>
          <View style={styles.statsRow}>
            <StatCard icon="clipboard" label="Atividades Hoje" value={stats.atividades}   color="#16a34a" />
            <StatCard icon="briefcase" label="Colaboradores"   value={stats.colaboradores} color="#2563eb" />
          </View>
        </AnimatedEnter>

        {/* Alertas */}
        <AnimatedEnter index={2}>
        <View style={[styles.section, { backgroundColor: c.white }]}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={15} color={c.primary} />
            <Text style={[styles.sectionTitle, { color: c.textPrimary, fontSize: scale(14) }]}>Alertas</Text>
          </View>

          {semVisita.length > 0 && (
            <View style={[styles.alertItem, { backgroundColor: alertWarnBg, borderLeftColor: '#d97706' }]}>
              <Feather name="user-x" size={15} color="#d97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: c.textPrimary, fontSize: scale(13) }]}>
                  {semVisita.length} idoso(s) sem visita há 30+ dias
                </Text>
                <Text style={[styles.alertSub, { color: c.textSecondary, fontSize: scale(11) }]}>
                  {semVisita.slice(0, 3).map(v => v.nome).join(', ')}{semVisita.length > 3 ? '...' : ''}
                </Text>
              </View>
            </View>
          )}

          {stats.aniversarios > 0 && (
            <View style={[styles.alertItem, { backgroundColor: alertInfoBg, borderLeftColor: '#2563eb' }]}>
              <Feather name="gift" size={15} color="#2563eb" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: c.textPrimary, fontSize: scale(13) }]}>
                  {stats.aniversarios} aniversariante(s) neste mês
                </Text>
                <Text style={[styles.alertSub, { color: c.textSecondary, fontSize: scale(11) }]}>Confira a lista abaixo</Text>
              </View>
            </View>
          )}

          <View style={[styles.alertItem, { backgroundColor: alertOkBg, borderLeftColor: '#16a34a' }]}>
            <Feather name="calendar" size={15} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: c.textPrimary, fontSize: scale(13) }]}>
                {diasRegistrados} de {totalDiasMes} dias registrados
              </Text>
              <View style={[styles.progressBar, { backgroundColor: c.border }]}>
                <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: '#16a34a' }]} />
              </View>
              <Text style={[styles.alertSub, { color: c.textSecondary, fontSize: scale(11) }]}>{Math.round(progresso)}% do mês</Text>
            </View>
          </View>

          {semVisita.length === 0 && stats.aniversarios === 0 && (
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(12) }]}>Nenhum alerta no momento</Text>
          )}
        </View>
        </AnimatedEnter>

        {/* Menu do Dia */}
        <AnimatedEnter index={3}>
        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary, fontSize: scale(14) }]}>Menu do Dia</Text>
          {menuHoje ? (
            <View style={{ gap: 10 }}>
              {menuHoje.cafe && (
                <View style={styles.menuRow}>
                  <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                    <Feather name="coffee" size={14} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Café da Manhã</Text>
                    <Text style={[styles.menuText, { color: c.textPrimary, fontSize: scale(13) }]}>{menuHoje.cafe.prato} · {menuHoje.cafe.calorias} kcal</Text>
                  </View>
                </View>
              )}
              {menuHoje.almoco && (
                <View style={styles.menuRow}>
                  <View style={[styles.menuIcon, { backgroundColor: '#dcfce7' }]}>
                    <Feather name="sun" size={14} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Almoço</Text>
                    <Text style={[styles.menuText, { color: c.textPrimary, fontSize: scale(13) }]}>{menuHoje.almoco.prato} · {menuHoje.almoco.calorias} kcal</Text>
                  </View>
                </View>
              )}
              {menuHoje.jantar && (
                <View style={styles.menuRow}>
                  <View style={[styles.menuIcon, { backgroundColor: '#dbeafe' }]}>
                    <Feather name="moon" size={14} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, { color: c.textSecondary, fontSize: scale(11) }]}>Jantar</Text>
                    <Text style={[styles.menuText, { color: c.textPrimary, fontSize: scale(13) }]}>{menuHoje.jantar.prato} · {menuHoje.jantar.calorias} kcal</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(12) }]}>Nenhum cardápio cadastrado para hoje</Text>
          )}
        </View>
        </AnimatedEnter>

        {/* Aniversariantes */}
        <AnimatedEnter index={4}>
        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary, fontSize: scale(14) }]}>Aniversariantes do Mês</Text>
          {aniversariantes.length > 0 ? aniversariantes.map((item, i) => (
            <View key={item.id ?? `aniv-${i}`} style={[styles.listItem, { borderBottomColor: c.surface }]}>
              {item.fotoUrl ? (
                <Image source={{ uri: item.fotoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: c.surface }]}>
                  <Feather name="user" size={16} color={c.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, { color: c.textPrimary, fontSize: scale(13) }]}>{item.nome}</Text>
                <Text style={[styles.listSub, { color: c.textSecondary, fontSize: scale(11) }]}>
                  {item.dataNascimento ? `${calcularIdade(item.dataNascimento)} anos` : ''}
                </Text>
              </View>
              <Feather name="gift" size={16} color="#d97706" />
            </View>
          )) : (
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(12) }]}>Nenhum aniversariante neste mês</Text>
          )}
        </View>
        </AnimatedEnter>

        {/* Atividades */}
        <AnimatedEnter index={5}>
        <View style={[styles.section, { backgroundColor: c.white, marginBottom: 30 }]}>
          <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary, marginBottom: 0, fontSize: scale(14) }]}>Atividades de Hoje</Text>
            <Pressable onPress={() => navigation.navigate('Atividades')}>
              <Text style={[styles.linkText, { color: c.primary, fontSize: scale(12) }]}>Ver todas</Text>
            </Pressable>
          </View>
          {atividadesHoje.length > 0 ? atividadesHoje.map((item, i) => (
            <View key={item.id ?? `ativ-${i}`} style={[styles.listItem, { borderBottomColor: c.surface }]}>
              <View style={[styles.activityDot, { backgroundColor: c.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, { color: c.textPrimary, fontSize: scale(13) }]}>{item.nome}</Text>
                <Text style={[styles.listSub, { color: c.textSecondary, fontSize: scale(11) }]}>
                  {item.horaRegistro} · {item.presentes?.length || 0} presentes
                </Text>
              </View>
            </View>
          )) : (
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(12) }]}>Nenhuma atividade registrada hoje</Text>
          )}
        </View>
        </AnimatedEnter>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', paddingHorizontal: 8, marginTop: 8 },
  section: { marginHorizontal: 12, marginTop: 14, borderRadius: 14, padding: 14, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  alertItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10,
    borderLeftWidth: 3, marginBottom: 8,
  },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertSub: { fontSize: 11, marginTop: 2 },
  progressBar: { height: 6, borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  menuText: { fontSize: 13, fontWeight: '600', marginTop: 1 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, gap: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  listName: { fontSize: 14, fontWeight: '600' },
  listSub: { fontSize: 12, marginTop: 1 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  linkText: { fontSize: 12, fontWeight: '700' },
});
