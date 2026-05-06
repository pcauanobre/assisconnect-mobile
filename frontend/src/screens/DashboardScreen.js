import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, Image,
} from 'react-native';
import BottomSheet from '../components/BottomSheet';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getIdososCount, getAniversariantesDoMes } from '../services/idosoService';
import { getCardapioHoje } from '../services/cardapioService';
import { getAtividades, getAtividadesHoje } from '../services/atividadeService';
import { getUsuariosCount } from '../services/usuarioService';
import { getIdososSemVisita } from '../services/visitaService';
import { testarAgora, pedirPermissao, isSuportado } from '../services/notificacaoService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { activeColors: c, config, scale } = useAccessibility();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ idosos: 0, aniversarios: 0, atividades: 0, colaboradores: 0 });
  const [menuHoje, setMenuHoje] = useState(null);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [atividadesHoje, setAtividadesHoje] = useState([]);
  const [semVisita, setSemVisita] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [debugModal, setDebugModal] = useState(false);
  const [debugResult, setDebugResult] = useState('');
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
      const diaAtual = hoje.getDate();
      const diasNoMes = new Date(ano, mes, 0).getDate();

      const [idososRes, anivRes, menuRes, ativRes, usersRes, semVisRes] = await Promise.allSettled([
        getIdososCount(), getAniversariantesDoMes(), getCardapioHoje(),
        getAtividadesHoje(), getUsuariosCount(), getIdososSemVisita(30),
      ]);

      const idososCount = idososRes.status === 'fulfilled' ? idososRes.value.data : 0;
      const anivData    = anivRes.status  === 'fulfilled' ? anivRes.value.data  : [];
      const menuData    = menuRes.status  === 'fulfilled' ? menuRes.value.data  : null;
      const ativData    = ativRes.status  === 'fulfilled' ? ativRes.value.data  : [];
      const usersCount  = usersRes.status === 'fulfilled' ? usersRes.value.data : 0;
      const semVisData  = semVisRes.status === 'fulfilled' ? semVisRes.value.data : [];

      let registrados = 0;
      for (let d = 1; d <= diaAtual; d++) {
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        try {
          const res = await getAtividades({ data: dataStr });
          if ((res.data || []).length > 0) registrados++;
        } catch {}
      }

      setStats({ idosos: idososCount, aniversarios: anivData.length, atividades: ativData.length, colaboradores: usersCount });
      setMenuHoje(menuData);
      setAniversariantes(anivData);
      setAtividadesHoje(ativData);
      setSemVisita(semVisData);
      setDiasRegistrados(registrados);
      setTotalDiasMes(diasNoMes);
    } catch (e) {
      console.log('[DASHBOARD] Erro:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

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

  async function testarPush() {
    setDebugResult('Enviando...');
    const r = await testarAgora('AssisConnect', 'Notificação de teste! 🔔');
    setDebugResult(r.sucesso ? '✓ Notificação disparada!' : `✗ ${r.motivo}`);
  }

  async function solicitarPermissao() {
    setDebugResult('Solicitando permissão...');
    const ok = await pedirPermissao();
    if (ok) {
      setDebugResult('✓ Permissão concedida! Clique em "Enviar" para testar.');
    } else {
      setDebugResult('✗ Permissão negada. No Chrome: cadeado na barra de endereço → Notificações → Permitir');
    }
  }

  function testarToast(tipo) {
    setDebugModal(false);
    setToast({ visible: true, message: `Toast de ${tipo} funcionando!`, type: tipo });
  }

  const progresso = totalDiasMes > 0 ? (diasRegistrados / totalDiasMes) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      {/* Header */}
      <View style={[styles.header, { height: 64 + insets.top, paddingTop: insets.top, backgroundColor: c.primary }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerGreet, { fontSize: scale(12) }]}>{saudacao()},</Text>
          <Text style={[styles.headerName, { fontSize: scale(17) }]} numberOfLines={1}>{user?.nome || user?.usuario || 'Funcionário'}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => { setDebugResult(''); setDebugModal(true); }} style={styles.headerBtn}>
            <Feather name="zap" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.headerBtn}>
            <Feather name="user" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={logout} style={styles.headerBtn}>
            <Feather name="log-out" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="users"     label="Total Idosos"    value={stats.idosos}       color={c.primary} />
          <StatCard icon="gift"      label="Aniversários"    value={stats.aniversarios}  color="#d97706" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="clipboard" label="Atividades Hoje" value={stats.atividades}   color="#16a34a" />
          <StatCard icon="briefcase" label="Colaboradores"   value={stats.colaboradores} color="#2563eb" />
        </View>

        {/* Alertas */}
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
                <View style={[styles.progressFill, { width: `${progresso}%`, backgroundColor: '#16a34a' }]} />
              </View>
              <Text style={[styles.alertSub, { color: c.textSecondary, fontSize: scale(11) }]}>{Math.round(progresso)}% do mês</Text>
            </View>
          </View>

          {semVisita.length === 0 && stats.aniversarios === 0 && (
            <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(12) }]}>Nenhum alerta no momento</Text>
          )}
        </View>

        {/* Menu do Dia */}
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

        {/* Aniversariantes */}
        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary, fontSize: scale(14) }]}>Aniversariantes do Mês</Text>
          {aniversariantes.length > 0 ? aniversariantes.map((item, i) => (
            <View key={i} style={[styles.listItem, { borderBottomColor: c.surface }]}>
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

        {/* Atividades */}
        <View style={[styles.section, { backgroundColor: c.white, marginBottom: 30 }]}>
          <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary, marginBottom: 0, fontSize: scale(14) }]}>Atividades de Hoje</Text>
            <Pressable onPress={() => navigation.navigate('Atividades')}>
              <Text style={[styles.linkText, { color: c.primary, fontSize: scale(12) }]}>Ver todas</Text>
            </Pressable>
          </View>
          {atividadesHoje.length > 0 ? atividadesHoje.map((item, i) => (
            <View key={i} style={[styles.listItem, { borderBottomColor: c.surface }]}>
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
      </ScrollView>

      {/* Modal de debug */}
      <BottomSheet visible={debugModal} onClose={() => setDebugModal(false)}>
          <View style={[styles.debugModal, { backgroundColor: c.white }]}>
            <View style={styles.debugHeader}>
              <Feather name="zap" size={20} color={c.primary} />
              <Text style={[styles.debugTitle, { color: c.textPrimary }]}>Teste de Notificações</Text>
              <Pressable onPress={() => setDebugModal(false)}>
                <Feather name="x" size={22} color={c.textSecondary} />
              </Pressable>
            </View>

            {debugResult ? (
              <View style={[styles.debugResult, { backgroundColor: c.surface }]}>
                <Text style={[styles.debugResultText, { color: c.textPrimary }]}>{debugResult}</Text>
              </View>
            ) : null}

            <Text style={[styles.debugSectionLabel, { color: c.textSecondary }]}>NOTIFICAÇÃO PUSH</Text>
            <Pressable style={[styles.debugBtn, { backgroundColor: c.primary }]} onPress={solicitarPermissao}>
              <Feather name="shield" size={16} color="#fff" />
              <Text style={styles.debugBtnText}>Solicitar permissão</Text>
            </Pressable>
            <Pressable style={[styles.debugBtn, { backgroundColor: c.primaryDark }]} onPress={testarPush}>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.debugBtnText}>Enviar push (2s)</Text>
            </Pressable>

            <Text style={[styles.debugSectionLabel, { color: c.textSecondary, marginTop: 16 }]}>TOAST IN-APP</Text>
            <View style={styles.debugToastRow}>
              {[
                { tipo: 'success', label: 'Sucesso', color: '#16a34a' },
                { tipo: 'error',   label: 'Erro',    color: '#dc2626' },
                { tipo: 'warn',    label: 'Aviso',   color: '#d97706' },
                { tipo: 'info',    label: 'Info',    color: c.primary },
              ].map(({ tipo, label, color }) => (
                <Pressable key={tipo} style={[styles.debugToastBtn, { backgroundColor: color }]} onPress={() => testarToast(tipo)}>
                  <Text style={styles.debugToastBtnText}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerGreet: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerName: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  debugModal: { borderRadius: 20, padding: 20 },
  handle: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  debugHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  debugTitle: { flex: 1, fontSize: 17, fontWeight: '800' },
  debugResult: { padding: 12, borderRadius: 10, marginBottom: 14 },
  debugResultText: { fontSize: 13, fontWeight: '600' },
  debugSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  debugBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12, marginBottom: 8,
  },
  debugBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  debugToastRow: { flexDirection: 'row', gap: 8 },
  debugToastBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  debugToastBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
