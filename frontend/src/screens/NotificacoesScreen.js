import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import Toast from '../components/Toast';
import FeedbackDialog from '../components/FeedbackDialog';
import useFeedback from '../hooks/useFeedback';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getIdosos } from '../services/idosoService';
import {
  pedirPermissao, cancelarTodas, agendarLembreteDiario,
  agendarAniversarios, salvarConfig, lerConfig, isSuportado,
} from '../services/notificacaoService';

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export default function NotificacoesScreen() {
  const navigation = useNavigation();
  const { activeColors: c, scale } = useAccessibility();
  const [suportado, setSuportado] = useState(true);
  const [lembreteDiarioAtivo, setLembreteDiarioAtivo] = useState(false);
  const [aniversariosAtivo, setAniversariosAtivo] = useState(false);
  const [hora, setHora] = useState('08');
  const [minuto, setMinuto] = useState('00');
  const [pendente, setPendente] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const fb = useFeedback();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  function showToast(message, type = 'info') {
    setToast({ visible: true, message, type });
  }

  useEffect(() => { init(); }, []);

  // Pulsa o botão Aplicar quando há mudanças pendentes
  useEffect(() => {
    if (pendente) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pendente]);

  async function init() {
    const sup = await isSuportado();
    setSuportado(sup);
    const cfg = await lerConfig();
    setLembreteDiarioAtivo(cfg.lembreteDiarioAtivo);
    setAniversariosAtivo(cfg.aniversariosAtivo);
    setHora(String(cfg.horaLembrete ?? 8).padStart(2, '0'));
    setMinuto(String(cfg.minutoLembrete ?? 0).padStart(2, '0'));
  }

  function toggle(setter, value) {
    setter(value);
    setPendente(true);
  }

  function selecionarHora(h) {
    setHora(h);
    setPendente(true);
  }

  function selecionarMinuto(m) {
    setMinuto(m);
    setPendente(true);
  }

  async function aplicar() {
    try {
      setAplicando(true);
      const permitido = await pedirPermissao();
      if (!permitido) {
        fb.error(
          'Permissão negada',
          'Habilite as notificações nas configurações do dispositivo para receber lembretes.',
        );
        return;
      }

      await cancelarTodas();
      const h = parseInt(hora, 10) || 8;
      const m = parseInt(minuto, 10) || 0;

      if (lembreteDiarioAtivo) {
        await agendarLembreteDiario(h, m);
      }

      if (aniversariosAtivo) {
        try {
          const res = await getIdosos();
          const ativos = (res.data || []).filter(i => !i.inativo && !i.falecido);
          const count = await agendarAniversarios(ativos);
          if (count > 0) showToast(`${count} aniversário(s) agendado(s)!`, 'info');
        } catch {}
      }

      await salvarConfig({ lembreteDiarioAtivo, aniversariosAtivo, horaLembrete: h, minutoLembrete: m });
      setPendente(false);
      fb.success('Configurações aplicadas!', 'Suas preferências de notificação foram salvas.', 1500);
    } finally {
      setAplicando(false);
    }
  }

  const ativoCount = [lembreteDiarioAtivo, aniversariosAtivo].filter(Boolean).length;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Notificações" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status geral */}
        <View style={[styles.statusCard, { backgroundColor: ativoCount > 0 ? c.primary : c.white, borderColor: c.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: ativoCount > 0 ? 'rgba(255,255,255,0.2)' : c.surface }]}>
            <Feather name={ativoCount > 0 ? 'bell' : 'bell-off'} size={20} color={ativoCount > 0 ? '#fff' : c.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: ativoCount > 0 ? '#fff' : c.textPrimary }]}>
              {ativoCount > 0 ? `${ativoCount} notificação${ativoCount > 1 ? 'ões' : ''} ativa${ativoCount > 1 ? 's' : ''}` : 'Nenhuma notificação ativa'}
            </Text>
            <Text style={[styles.statusSub, { color: ativoCount > 0 ? 'rgba(255,255,255,0.8)' : c.textSecondary }]}>
              {Platform.OS === 'web' ? 'Usando notificações do navegador' : 'Usando notificações nativas'}
            </Text>
          </View>
          {pendente && (
            <View style={[styles.pendenteBadge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.pendenteBadgeText}>Não salvo</Text>
            </View>
          )}
        </View>

        {/* Lembrete diário */}
        <View style={[styles.card, { backgroundColor: c.white, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: lembreteDiarioAtivo ? c.primary : c.surface }]}>
              <Feather name="clock" size={16} color={lembreteDiarioAtivo ? '#fff' : c.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Lembrete diário de presença</Text>
              <Text style={[styles.cardSub, { color: c.textSecondary }]}>Lembrete para registrar presenças todos os dias</Text>
            </View>
            <Switch
              value={lembreteDiarioAtivo}
              onValueChange={v => toggle(setLembreteDiarioAtivo, v)}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor="#fff"
            />
          </View>

          {lembreteDiarioAtivo && (
            <View style={[styles.horaSection, { borderTopColor: c.border }]}>
              <Text style={[styles.horaLabel, { color: c.textSecondary }]}>HORÁRIO DO LEMBRETE</Text>
              <View style={styles.horaPickers}>
                {/* Horas */}
                <View style={styles.pickerGroup}>
                  <Text style={[styles.pickerLabel, { color: c.textSecondary }]}>Hora</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {HORAS.map(h => (
                      <Pressable
                        key={h}
                        style={[styles.chip, { borderColor: c.border, backgroundColor: hora === h ? c.primary : c.surface }]}
                        onPress={() => selecionarHora(h)}
                      >
                        <Text style={[styles.chipText, { color: hora === h ? '#fff' : c.textPrimary }]}>{h}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                {/* Minutos */}
                <View style={styles.pickerGroup}>
                  <Text style={[styles.pickerLabel, { color: c.textSecondary }]}>Minuto</Text>
                  <View style={styles.minuteRow}>
                    {MINUTOS.map(m => (
                      <Pressable
                        key={m}
                        style={[styles.chip, { borderColor: c.border, backgroundColor: minuto === m ? c.primary : c.surface }]}
                        onPress={() => selecionarMinuto(m)}
                      >
                        <Text style={[styles.chipText, { color: minuto === m ? '#fff' : c.textPrimary }]}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
              <View style={[styles.horaSummary, { backgroundColor: c.surface }]}>
                <Feather name="clock" size={14} color={c.primary} />
                <Text style={[styles.horaSummaryText, { color: c.textPrimary }]}>
                  Todos os dias às <Text style={{ fontWeight: '800', color: c.primary }}>{hora}:{minuto}</Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Aniversários */}
        <View style={[styles.card, { backgroundColor: c.white, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: aniversariosAtivo ? c.primary : c.surface }]}>
              <Feather name="gift" size={16} color={aniversariosAtivo ? '#fff' : c.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Aniversários dos idosos</Text>
              <Text style={[styles.cardSub, { color: c.textSecondary }]}>Notificação às 9h no dia do aniversário de cada idoso</Text>
            </View>
            <Switch
              value={aniversariosAtivo}
              onValueChange={v => toggle(setAniversariosAtivo, v)}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Botão Aplicar */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={[styles.btnAplicar, { backgroundColor: pendente ? c.primary : c.primaryDark, opacity: aplicando ? 0.7 : 1 }]}
            onPress={aplicar}
            disabled={aplicando}
          >
            <Feather name={aplicando ? 'loader' : 'check-circle'} size={16} color="#fff" />
            <Text style={styles.btnAplicarTxt}>
              {aplicando ? 'Aplicando...' : pendente ? 'Salvar e aplicar' : 'Aplicar configurações'}
            </Text>
          </Pressable>
        </Animated.View>

        <View style={[styles.infoBox, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Feather name="info" size={13} color={c.textSecondary} />
          <Text style={[styles.infoText, { color: c.textSecondary }]}>
            Os lembretes só funcionam com o app aberto.
          </Text>
        </View>

      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
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
  content: { padding: 14, gap: 10, paddingBottom: 32 },
  // Status card
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  statusIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 14, fontWeight: '700' },
  statusSub: { fontSize: 11, marginTop: 2 },
  pendenteBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pendenteBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  // Cards
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  cardIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSub: { fontSize: 11, marginTop: 2 },
  // Hora picker
  horaSection: { borderTopWidth: 1, padding: 14, gap: 10 },
  horaLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  horaPickers: { gap: 12 },
  pickerGroup: { gap: 6 },
  pickerLabel: { fontSize: 11, fontWeight: '600' },
  chipScroll: { flexGrow: 0 },
  minuteRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, marginRight: 6,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  horaSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 10, borderRadius: 8, marginTop: 4,
  },
  horaSummaryText: { fontSize: 13 },
  // Botões
  btnAplicar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 12,
  },
  btnAplicarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnDebug: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 12, borderWidth: 1.5,
  },
  btnDebugTxt: { fontWeight: '700', fontSize: 14 },
  // Info
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 2,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
