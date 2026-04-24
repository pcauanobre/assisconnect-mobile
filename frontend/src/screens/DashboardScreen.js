import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getIdososCount, getAniversariantesDoMes } from '../services/idosoService';
import { getCardapioHoje } from '../services/cardapioService';
import { getAtividades, getAtividadesHoje } from '../services/atividadeService';
import { getUsuariosCount } from '../services/usuarioService';
import { getIdososSemVisita } from '../services/visitaService';
import { testarAgora } from '../services/notificacaoService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';
import colors from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ idosos: 0, aniversarios: 0, atividades: 0, colaboradores: 0 });
  const [menuHoje, setMenuHoje] = useState(null);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [atividadesHoje, setAtividadesHoje] = useState([]);
  const [semVisita, setSemVisita] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  async function dispararDebug() {
    const r = await testarAgora('AssisConnect Debug', 'Notificacao de teste disparada!');
    setToast({
      visible: true,
      message: r.sucesso ? 'Notificacao enviada em 2s!' : `Falha: ${r.motivo}`,
      type: r.sucesso ? 'success' : 'error',
    });
  }
  const [diasRegistrados, setDiasRegistrados] = useState(0);
  const [totalDiasMes, setTotalDiasMes] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth() + 1;
      const diaAtual = hoje.getDate();
      const diasNoMes = new Date(ano, mes, 0).getDate();

      const [idososRes, anivRes, menuRes, ativRes, usersRes, semVisRes] = await Promise.allSettled([
        getIdososCount(),
        getAniversariantesDoMes(),
        getCardapioHoje(),
        getAtividadesHoje(),
        getUsuariosCount(),
        getIdososSemVisita(30),
      ]);

      const idososCount = idososRes.status === 'fulfilled' ? idososRes.value.data : 0;
      const anivData = anivRes.status === 'fulfilled' ? anivRes.value.data : [];
      const menuData = menuRes.status === 'fulfilled' ? menuRes.value.data : null;
      const ativData = ativRes.status === 'fulfilled' ? ativRes.value.data : [];
      const usersCount = usersRes.status === 'fulfilled' ? usersRes.value.data : 0;
      const semVisData = semVisRes.status === 'fulfilled' ? semVisRes.value.data : [];

      // Calcula dias com registro de atividade no mes atual
      let registrados = 0;
      for (let d = 1; d <= diaAtual; d++) {
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        try {
          const res = await getAtividades({ data: dataStr });
          if ((res.data || []).length > 0) registrados++;
        } catch {}
      }

      setStats({
        idosos: idososCount,
        aniversarios: anivData.length,
        atividades: ativData.length,
        colaboradores: usersCount,
      });
      setMenuHoje(menuData);
      setAniversariantes(anivData);
      setAtividadesHoje(ativData);
      setSemVisita(semVisData);
      setDiasRegistrados(registrados);
      setTotalDiasMes(diasNoMes);
    } catch (e) {
      console.log('[DASHBOARD] Erro ao carregar dados:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function calcularIdade(dataNasc) {
    if (!dataNasc) return '';
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={[styles.header, { height: 56 + insets.top, paddingTop: insets.top }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Inicio</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={dispararDebug} style={styles.headerBtn}>
            <Feather name="zap" size={20} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.headerBtn}>
            <Feather name="user" size={20} color={colors.white} />
          </Pressable>
          <Pressable onPress={logout} style={styles.headerBtn}>
            <Feather name="log-out" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatCard icon="users" label="Total Idosos" value={stats.idosos} color="#8B5E3C" />
        <StatCard icon="gift" label="Aniversarios" value={stats.aniversarios} color="#A0522D" />
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="clipboard" label="Atividades Hoje" value={stats.atividades} color="#6B4226" />
        <StatCard icon="briefcase" label="Colaboradores" value={stats.colaboradores} color="#4E3620" />
      </View>

      {/* Alertas */}
      <View style={styles.section}>
        <View style={styles.alertHeader}>
          <Feather name="bell" size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>Alertas</Text>
        </View>

        {semVisita.length > 0 && (
          <View style={[styles.alertItem, styles.alertWarn]}>
            <Feather name="user-x" size={16} color="#d97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {semVisita.length} idoso(s) sem visita ha 30+ dias
              </Text>
              <Text style={styles.alertSub}>
                {semVisita.slice(0, 3).map(v => v.nome).join(', ')}
                {semVisita.length > 3 ? '...' : ''}
              </Text>
            </View>
          </View>
        )}

        {stats.aniversarios > 0 && (
          <View style={[styles.alertItem, styles.alertInfo]}>
            <Feather name="gift" size={16} color="#2563eb" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {stats.aniversarios} aniversariante(s) neste mes
              </Text>
              <Text style={styles.alertSub}>Confira a lista abaixo</Text>
            </View>
          </View>
        )}

        <View style={[styles.alertItem, styles.alertProgress]}>
          <Feather name="calendar" size={16} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {diasRegistrados} de {totalDiasMes} dias registrados
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${totalDiasMes > 0 ? (diasRegistrados / totalDiasMes) * 100 : 0}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {semVisita.length === 0 && stats.aniversarios === 0 && (
          <Text style={styles.emptyText}>Nenhum alerta no momento</Text>
        )}
      </View>

      {/* Menu do Dia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu do Dia</Text>
        {menuHoje ? (
          <View style={styles.menuCard}>
            {menuHoje.cafe && (
              <View style={styles.menuRow}>
                <Feather name="coffee" size={16} color={colors.primary} />
                <Text style={styles.menuLabel}>Cafe:</Text>
                <Text style={styles.menuText}>{menuHoje.cafe.prato} ({menuHoje.cafe.calorias} kcal)</Text>
              </View>
            )}
            {menuHoje.almoco && (
              <View style={styles.menuRow}>
                <Feather name="sun" size={16} color={colors.primary} />
                <Text style={styles.menuLabel}>Almoco:</Text>
                <Text style={styles.menuText}>{menuHoje.almoco.prato} ({menuHoje.almoco.calorias} kcal)</Text>
              </View>
            )}
            {menuHoje.jantar && (
              <View style={styles.menuRow}>
                <Feather name="moon" size={16} color={colors.primary} />
                <Text style={styles.menuLabel}>Jantar:</Text>
                <Text style={styles.menuText}>{menuHoje.jantar.prato} ({menuHoje.jantar.calorias} kcal)</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum cardapio cadastrado para hoje</Text>
        )}
      </View>

      {/* Aniversariantes do Mes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aniversariantes do Mes</Text>
        {aniversariantes.length > 0 ? (
          aniversariantes.map((item, i) => (
            <View key={i} style={styles.listItem}>
              {item.fotoUrl ? (
                <Image source={{ uri: item.fotoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={16} color={colors.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{item.nome}</Text>
                <Text style={styles.listSub}>
                  {item.dataNascimento ? `${calcularIdade(item.dataNascimento)} anos` : ''}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum aniversariante neste mes</Text>
        )}
      </View>

      {/* Atividades de Hoje */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividades de Hoje</Text>
          <Pressable onPress={() => navigation.navigate('Atividades')}>
            <Text style={styles.linkText}>Ver todas</Text>
          </Pressable>
        </View>
        {atividadesHoje.length > 0 ? (
          atividadesHoje.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Feather name="activity" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.listName}>{item.nome}</Text>
                <Text style={styles.listSub}>
                  {item.horaRegistro} - {item.presentes?.length || 0} presentes
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma atividade registrada hoje</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 8, marginTop: 8 },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10,
  },
  menuCard: { gap: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuLabel: { fontWeight: '700', color: colors.textPrimary, fontSize: 13 },
  menuText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.surface, gap: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  listName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  listSub: { fontSize: 12, color: colors.textSecondary },
  emptyText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  alertItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 6,
  },
  alertWarn: { backgroundColor: '#fef3c7' },
  alertInfo: { backgroundColor: '#dbeafe' },
  alertProgress: { backgroundColor: '#dcfce7' },
  alertTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  alertSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  progressBar: {
    height: 6, backgroundColor: colors.white, borderRadius: 3, marginTop: 6, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  linkText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
