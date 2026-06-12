import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedEnter from '../components/AnimatedEnter';
import { useAccessibility } from '../contexts/AccessibilityContext';

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
  const { activeColors: c, scale } = useAccessibility();
  const [aceitando, setAceitando] = useState(false);
  const [scrollado, setScrollado] = useState(false);

  async function handleAceitar() {
    setAceitando(true);
    try {
      if (onAceitar) {
        await onAceitar();
      }
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
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <AnimatedEnter index={0}>
      <View style={[styles.header, { backgroundColor: c.primary }]}>
        <Feather name="file-text" size={28} color="#fff" />
        <Text style={[styles.headerTitle, { fontSize: scale(22) }]}>Termos de Uso</Text>
        <Text style={[styles.headerSub, { fontSize: scale(13) }]}>Leia antes de continuar</Text>
      </View>
      </AnimatedEnter>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <AnimatedEnter index={1}>
        <Text style={[styles.termos, { color: c.textPrimary, fontSize: scale(14) }]}>{TERMOS_TEXTO}</Text>
        </AnimatedEnter>
        {!scrollado && (
          <View style={styles.scrollHint}>
            <Feather name="chevrons-down" size={16} color={c.textSecondary} />
            <Text style={[styles.scrollHintText, { color: c.textSecondary, fontSize: scale(12) }]}>Role até o fim para habilitar o aceite</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: c.white, borderTopColor: c.border }]}>
        <Pressable
          style={[
            styles.btnAceitar,
            { backgroundColor: scrollado ? c.primary : c.inactive },
          ]}
          onPress={handleAceitar}
          disabled={!scrollado || aceitando}
        >
          {aceitando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={[styles.btnAceitarText, { fontSize: scale(15) }]}>Li e aceito os Termos de Uso</Text>
            </>
          )}
        </Pressable>
        <Text style={[styles.footerNote, { color: c.textSecondary, fontSize: scale(11) }]}>
          Ao aceitar, você confirma que leu e compreendeu os termos acima.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: { fontWeight: '800', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.75)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 10 },
  termos: { lineHeight: 22 },
  scrollHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 20, paddingVertical: 10,
  },
  scrollHintText: { fontStyle: 'italic' },
  footer: {
    padding: 16, paddingBottom: 30,
    borderTopWidth: 1,
  },
  btnAceitar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 12,
  },
  btnAceitarText: { color: '#fff', fontWeight: '800' },
  footerNote: { textAlign: 'center', marginTop: 8 },
});
