import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import Toast from '../components/Toast';
import colors from '../theme/colors';
import { getIdosos } from '../services/idosoService';
import {
  pedirPermissao, cancelarTodas, agendarLembreteDiario,
  agendarAniversarios, salvarConfig, lerConfig, isSuportado, testarAgora,
} from '../services/notificacaoService';

export default function NotificacoesScreen() {
  const [suportado, setSuportado] = useState(true);
  const [lembreteDiarioAtivo, setLembreteDiarioAtivo] = useState(false);
  const [aniversariosAtivo, setAniversariosAtivo] = useState(false);
  const [hora, setHora] = useState('08');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  function showToast(message, type = 'info') {
    setToast({ visible: true, message, type });
  }

  useEffect(() => { init(); }, []);

  async function init() {
    const sup = await isSuportado();
    setSuportado(sup);
    const cfg = await lerConfig();
    setLembreteDiarioAtivo(cfg.lembreteDiarioAtivo);
    setAniversariosAtivo(cfg.aniversariosAtivo);
    setHora(String(cfg.horaLembrete || 8).padStart(2, '0'));
  }

  async function aplicar() {
    if (!suportado) {
      showToast('Notificações não disponíveis na web', 'warn');
      return;
    }
    const permitido = await pedirPermissao();
    if (!permitido) {
      showToast('Permissão de notificação negada', 'error');
      return;
    }

    await cancelarTodas();
    const h = parseInt(hora, 10) || 8;

    if (lembreteDiarioAtivo) {
      await agendarLembreteDiario(h, 0);
    }
    if (aniversariosAtivo) {
      try {
        const res = await getIdosos();
        const idososAtivos = (res.data || []).filter(i => !i.inativo && !i.falecido);
        await agendarAniversarios(idososAtivos);
      } catch {}
    }

    await salvarConfig({
      lembreteDiarioAtivo,
      aniversariosAtivo,
      horaLembrete: h,
    });
    showToast('Configurações aplicadas com sucesso!', 'success');
  }

  async function testar() {
    showToast('Notificação de teste disparada!', 'success');
    if (suportado) {
      const r = await testarAgora(
        'AssisConnect - Teste',
        'Se você recebeu essa, as notificações estão funcionando!'
      );
      if (!r.sucesso && r.motivo) {
        setTimeout(() => showToast(`Push nativa: ${r.motivo}`, 'warn'), 3000);
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader title="Notificações" />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {!suportado && (
          <View style={styles.alert}>
            <Feather name="alert-circle" size={16} color="#d97706" />
            <Text style={styles.alertText}>
              Notificações só funcionam no app mobile (não na web).
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Lembrete diário de presença</Text>
              <Text style={styles.sub}>Receba um lembrete todos os dias no horário escolhido.</Text>
            </View>
            <Switch
              value={lembreteDiarioAtivo}
              onValueChange={setLembreteDiarioAtivo}
              trackColor={{ false: '#ccc', true: colors.success }}
            />
          </View>
          {lembreteDiarioAtivo && (
            <View style={styles.horaRow}>
              <Text style={styles.label}>Horário (hora):</Text>
              <TextInput
                style={styles.input} value={hora}
                onChangeText={setHora}
                keyboardType="numeric" maxLength={2} placeholder="08"
              />
              <Text style={styles.label}>:00</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Avisar aniversários dos idosos</Text>
              <Text style={styles.sub}>Notificação no dia do aniversário de cada idoso.</Text>
            </View>
            <Switch
              value={aniversariosAtivo}
              onValueChange={setAniversariosAtivo}
              trackColor={{ false: '#ccc', true: colors.success }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btnAplicar} onPress={aplicar}>
          <Feather name="check-circle" size={16} color={colors.white} />
          <Text style={styles.btnAplicarTxt}>Aplicar configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDebug} onPress={testar}>
          <Feather name="zap" size={16} color={colors.primary} />
          <Text style={styles.btnDebugTxt}>Modo debug: testar notificação</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          O botão de teste dispara um toast in-app imediatamente e, se o app estiver rodando no celular,
          também agenda uma push nativa em 2 segundos.
        </Text>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 12,
  },
  alertText: { flex: 1, fontSize: 12, color: '#92400e' },
  section: {
    backgroundColor: colors.white, padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  horaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  input: {
    backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10,
    borderWidth: 1, borderColor: colors.border, fontSize: 16, width: 60, textAlign: 'center',
  },
  btnAplicar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10, marginTop: 6,
  },
  btnAplicarTxt: { color: colors.white, fontWeight: '700', fontSize: 14 },
  btnDebug: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary,
    paddingVertical: 12, borderRadius: 10, marginTop: 8,
  },
  btnDebugTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  footerNote: {
    fontSize: 11, color: colors.textSecondary, textAlign: 'center',
    marginTop: 12, fontStyle: 'italic',
  },
});
