import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';

export const TERMOS_KEY = '@assisconnect_termos_aceitos';

const TERMOS_TEXTO = `
1. ACEITAÇÃO DOS TERMOS

Ao utilizar o AssisConnect, você concorda com estes Termos de Uso. Caso não concorde, não prossiga com o uso do aplicativo.

2. USO DO APLICATIVO

O AssisConnect é um sistema de gestão de lares de idosos, destinado exclusivamente a funcionários e administradores autorizados pela instituição. O acesso é pessoal e intransferível.

3. DADOS E PRIVACIDADE

Os dados inseridos no sistema — incluindo informações de idosos, registros de saúde, presença e visitas — são de responsabilidade da instituição. O aplicativo não compartilha dados com terceiros sem autorização.

4. RESPONSABILIDADES DO USUÁRIO

O usuário se compromete a:
• Manter sigilo das credenciais de acesso;
• Utilizar o sistema apenas para fins institucionais;
• Registrar informações verídicas e precisas;
• Comunicar imediatamente qualquer uso não autorizado.

5. SEGURANÇA

As informações são transmitidas de forma segura entre o aplicativo e o servidor da instituição. Recomendamos o uso em redes confiáveis.

6. ATUALIZAÇÕES

Estes termos podem ser atualizados. Em caso de alterações relevantes, o usuário será notificado no próximo acesso.

7. CONTATO

Em caso de dúvidas, entre em contato com o administrador do sistema da sua instituição.
`.trim();

export default function TermosUsoScreen({ onAceitar }) {
  const [aceitando, setAceitando] = useState(false);
  const [scrollado, setScrollado] = useState(false);

  async function handleAceitar() {
    setAceitando(true);
    try {
      await AsyncStorage.setItem(TERMOS_KEY, 'true');
      onAceitar();
    } finally {
      setAceitando(false);
    }
  }

  function handleScroll({ nativeEvent }) {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const chegouAoFim = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (chegouAoFim) setScrollado(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="file-text" size={28} color={colors.white} />
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <Text style={styles.headerSub}>Leia antes de continuar</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.termos}>{TERMOS_TEXTO}</Text>
        {!scrollado && (
          <View style={styles.scrollHint}>
            <Feather name="chevrons-down" size={16} color={colors.textSecondary} />
            <Text style={styles.scrollHintText}>Role até o fim para habilitar o aceite</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.btnAceitar,
            !scrollado && styles.btnDesabilitado,
          ]}
          onPress={handleAceitar}
          disabled={!scrollado || aceitando}
        >
          {aceitando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.btnAceitarText}>Li e aceito os Termos de Uso</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.footerNote}>
          Ao aceitar, você confirma que leu e compreendeu os termos acima.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 10 },
  termos: {
    fontSize: 14, color: colors.textPrimary, lineHeight: 22,
  },
  scrollHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 20, paddingVertical: 10,
  },
  scrollHintText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  footer: {
    padding: 16, paddingBottom: 30,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  btnAceitar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary,
    paddingVertical: 15, borderRadius: 12,
  },
  btnDesabilitado: { backgroundColor: colors.inactive },
  btnAceitarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  footerNote: {
    fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 8,
  },
});
