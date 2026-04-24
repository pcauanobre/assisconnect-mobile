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
      showToast('Notificacoes nao disponiveis na web', 'warn');
      return;
    }
    const permitido = await pedirPermissao();
    if (!permitido) {
      showToast('Permissao de notificacao negada', 'error');
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
    showToast('Configuracoes aplicadas com sucesso!', 'success');
  }

  async function testar() {
    // Sempre mostra o toast (funciona em qualquer plataforma)
    showToast('Notificacao de teste disparada!', 'success');
    // Se o sistema suportar, tambem dispara uma push de verdade
    if (suportado) {
      const r = await testarAgora(
        'AssisConnect - Teste',
        'Se voce recebeu essa, as notificacoes estao funcionando!'
      );
      if (!r.sucesso && r.motivo) {
        setTimeout(() => showToast(`Push nativa: ${r.motivo}`, 'warn'), 3000);
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader title="Notificacoes" />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {!suportado && (
          <View style={styles.alert}>
            <Feather name="alert-circle" size={16} color="#d97706" />
            <Text style={styles.alertText}>
              Notificacoes so funcionam no app mobile (nao na web).
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Lembrete diario de presenca</Text>
              <Text style={styles.sub}>Receba um lembrete todos os dias no horario escolhido.</Text>
            </View>
            <Switch
              value={lembreteDiarioAtivo}
              onValueChange={setLembreteDiarioAtivo}
              trackColor={{ false: '#ccc', true: colors.success }}
            />
          </View>
          {lembreteDiarioAtivo && (
            <View style={styles.horaRow}>
              <Text style={styles.label}>Horario (hora):</Text>
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
              <Text style={styles.label}>Avisar aniversarios dos idosos</Text>
              <Text style={styles.sub}>Notificacao no dia do aniversario de cada idoso.</Text>
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
          <Text style={styles.btnAplicarTxt}>Aplicar configuracoes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDebug} onPress={testar}>
          <Feather name="zap" size={16} color={colors.primary} />
          <Text style={styles.btnDebugTxt}>Modo debug: testar notificacao</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          O botao de teste dispara um toast in-app imediatamente e, se o app estiver rodando no celular,
          tambem agenda uma push nativa em 2 segundos.
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
