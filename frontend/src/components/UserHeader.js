import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useDebug } from '../contexts/DebugContext';
import BottomSheet from './BottomSheet';
import Toast from './Toast';
import { testarAgora, pedirPermissao } from '../services/notificacaoService';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function UserHeader() {
  const { user } = useAuth();
  const { activeColors: c, scale } = useAccessibility();
  const { debugMode, disableDebug } = useDebug();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [debugModal, setDebugModal] = useState(false);
  const [debugResult, setDebugResult] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  async function testarPush() {
    setDebugResult('Enviando...');
    const r = await testarAgora('AssisConnect', 'Notificação de teste! 🔔');
    setDebugResult(r.sucesso ? '✓ Notificação disparada!' : `✗ ${r.motivo}`);
  }

  async function solicitarPermissao() {
    setDebugResult('Solicitando permissão...');
    const ok = await pedirPermissao();
    setDebugResult(ok
      ? '✓ Permissão concedida! Clique em "Enviar" para testar.'
      : '✗ Permissão negada. No Chrome: cadeado na barra de endereço → Notificações → Permitir');
  }

  function testarToast(tipo) {
    setDebugModal(false);
    setToast({ visible: true, message: `Toast de ${tipo} funcionando!`, type: tipo });
  }

  function desativarDebug() {
    setDebugModal(false);
    disableDebug();
  }

  return (
    <>
      <View style={[styles.header, { height: 72 + insets.top, paddingTop: insets.top, backgroundColor: c.primary }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerGreet, { fontSize: scale(12) }]}>{saudacao()},</Text>
          <Text style={[styles.headerName, { fontSize: scale(17) }]} numberOfLines={1}>
            {user?.nome || user?.usuario || 'Funcionário'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {debugMode && (
            <Pressable onPress={() => { setDebugResult(''); setDebugModal(true); }} style={styles.headerBtn}>
              <Feather name="zap" size={20} color="#fff" />
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={[styles.headerAvatarBtn, { borderColor: 'rgba(255,255,255,0.4)' }]}
          >
            {user?.fotoUrl ? (
              <Image source={{ uri: user.fotoUrl }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                <Feather name="user" size={24} color="#fff" />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <BottomSheet visible={debugModal} onClose={() => setDebugModal(false)}>
        <View style={[styles.debugModal, { backgroundColor: c.white }]}>
          <View style={styles.debugHeader}>
            <Feather name="zap" size={20} color={c.primary} />
            <Text style={[styles.debugTitle, { color: c.textPrimary }]}>Modo Debug</Text>
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

          <Pressable style={[styles.debugBtn, { backgroundColor: '#6b7280', marginTop: 16 }]} onPress={desativarDebug}>
            <Feather name="power" size={16} color="#fff" />
            <Text style={styles.debugBtnText}>Desativar modo debug</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerGreet: { color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerName: { fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarBtn: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 24 },
  headerAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  debugModal: { borderRadius: 20, padding: 20 },
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
