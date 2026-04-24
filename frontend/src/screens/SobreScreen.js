import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import colors from '../theme/colors';

const EQUIPE = [
  { nome: 'Rodrigo Cabezas', papel: 'Estrutura e Dashboard' },
  { nome: 'Pedro Caua', papel: 'Autenticacao e Relatorios' },
  { nome: 'Lucas Rodrigues', papel: 'Cadastro de Idosos e Visitas' },
  { nome: 'Nicolas Silveira', papel: 'Interface Web e Acessibilidade' },
  { nome: 'Lucas Ximenes', papel: 'Cardapio e API' },
];

export default function SobreScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader title="Sobre o App" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Feather name="heart" size={36} color={colors.white} />
          </View>
          <Text style={styles.appName}>AssisConnect</Text>
          <Text style={styles.version}>Versao 1.0</Text>
          <Text style={styles.tagline}>
            Sistema de gestao para lares de idosos
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o projeto</Text>
          <Text style={styles.text}>
            O AssisConnect foi desenvolvido como projeto aplicado multiplataforma
            no curso de Tecnologo em Analise e Desenvolvimento de Sistemas da
            Universidade de Fortaleza. O objetivo e digitalizar e humanizar o
            acompanhamento de idosos em lares de assistencia social.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          {[
            { icon: 'users', label: 'Cadastro e gestao de idosos' },
            { icon: 'coffee', label: 'Cardapio semanal' },
            { icon: 'clipboard', label: 'Registro diario de presenca' },
            { icon: 'bar-chart-2', label: 'Relatorios mensais com estatisticas' },
            { icon: 'activity', label: 'Controle de medicamentos' },
            { icon: 'heart', label: 'Registro de saude' },
            { icon: 'user-check', label: 'Controle de visitas' },
            { icon: 'file-text', label: 'Exportacao em PDF' },
            { icon: 'bell', label: 'Notificacoes locais' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Feather name={f.icon} size={16} color={colors.primary} />
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipe</Text>
          {EQUIPE.map((m, i) => (
            <View key={i} style={styles.memberRow}>
              <View style={styles.avatar}>
                <Feather name="user" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.nome}</Text>
                <Text style={styles.memberRole}>{m.papel}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tecnologias</Text>
          <View style={styles.techRow}>
            {['React Native', 'Expo', 'Spring Boot', 'Java 17', 'MySQL / H2', 'Thymeleaf'].map((t) => (
              <View key={t} style={styles.techChip}>
                <Text style={styles.techText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          UNIFOR — N393 Projeto Aplicado Multiplataforma — 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 16 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  appName: { fontSize: 26, fontWeight: '800', color: colors.primary, marginTop: 10 },
  version: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  section: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14, marginTop: 12, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  text: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  featureText: { fontSize: 13, color: colors.textPrimary },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.surface,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  memberName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  memberRole: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techChip: {
    backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  techText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  footer: {
    fontSize: 11, color: colors.textSecondary, textAlign: 'center',
    marginTop: 16, fontStyle: 'italic',
  },
});
