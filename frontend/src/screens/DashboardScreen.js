import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getIdososCount, getAniversariantesDoMes } from '../services/idosoService';
import { getCardapioHoje } from '../services/cardapioService';
import { getAtividadesHoje } from '../services/atividadeService';
import { getUsuariosCount } from '../services/usuarioService';
import StatCard from '../components/StatCard';
import colors from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ idosos: 0, aniversarios: 0, atividades: 0, colaboradores: 0 });
  const [menuHoje, setMenuHoje] = useState(null);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [atividadesHoje, setAtividadesHoje] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [idososRes, anivRes, menuRes, ativRes, usersRes] = await Promise.allSettled([
        getIdososCount(),
        getAniversariantesDoMes(),
        getCardapioHoje(),
        getAtividadesHoje(),
        getUsuariosCount(),
      ]);

      const idososCount = idososRes.status === 'fulfilled' ? idososRes.value.data : 0;
      const anivData = anivRes.status === 'fulfilled' ? anivRes.value.data : [];
      const menuData = menuRes.status === 'fulfilled' ? menuRes.value.data : null;
      const ativData = ativRes.status === 'fulfilled' ? ativRes.value.data : [];
      const usersCount = usersRes.status === 'fulfilled' ? usersRes.value.data : 0;

      setStats({
        idosos: idososCount,
        aniversarios: anivData.length,
        atividades: ativData.length,
        colaboradores: usersCount,
      });
      setMenuHoje(menuData);
      setAniversariantes(anivData);
      setAtividadesHoje(ativData);
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel de Administracao</Text>
          <Text style={styles.headerSub}>Bem-vindo, {user?.nome || user?.usuario || 'Usuario'}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.headerBtn}>
            <Feather name="user" size={20} color={colors.white} />
          </Pressable>
          <Pressable onPress={logout} style={styles.headerBtn}>
            <Feather name="log-out" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatCard icon="users" label="Total Idosos" value={stats.idosos} color="#8B5E3C" />
        <StatCard icon="gift" label="Aniversarios" value={stats.aniversarios} color="#A0522D" />
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="clipboard" label="Atividades Hoje" value={stats.atividades} color="#6B4226" />
        <StatCard icon="briefcase" label="Colaboradores" value={stats.colaboradores} color="#4E3620" />
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
        <Text style={styles.sectionTitle}>Atividades de Hoje</Text>
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
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 13, color: colors.accent, marginTop: 2 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
});
