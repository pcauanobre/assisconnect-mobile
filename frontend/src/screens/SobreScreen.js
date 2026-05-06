import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility } from '../contexts/AccessibilityContext';

const EQUIPE = [
  { nome: 'Rodrigo Cabezas', papel: 'Estrutura e Dashboard' },
  { nome: 'Pedro Cauã', papel: 'Autenticação e Relatórios' },
  { nome: 'Lucas Rodrigues', papel: 'Cadastro de Idosos e Visitas' },
  { nome: 'Nicolas Silveira', papel: 'Interface Web e Acessibilidade' },
  { nome: 'Lucas Ximenes', papel: 'Cardápio e API' },
];

const FEATURES = [
  { icon: 'users', label: 'Cadastro e gestão de idosos' },
  { icon: 'coffee', label: 'Cardápio semanal' },
  { icon: 'clipboard', label: 'Registro diário de presença' },
  { icon: 'bar-chart-2', label: 'Relatórios mensais com estatísticas' },
  { icon: 'activity', label: 'Controle de medicamentos' },
  { icon: 'heart', label: 'Registro de saúde' },
  { icon: 'user-check', label: 'Controle de visitas' },
  { icon: 'file-text', label: 'Exportação em PDF' },
  { icon: 'bell', label: 'Notificações locais' },
];

export default function SobreScreen({ navigation }) {
  const { activeColors: c, scale } = useAccessibility();
  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <ScreenHeader title="Sobre o App" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.logoCircle, { backgroundColor: c.primary }]}>
            <Feather name="heart" size={36} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: c.primary }]}>AssisConnect</Text>
          <Text style={[styles.version, { color: c.textSecondary }]}>Versão 1.0</Text>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>
            Sistema de gestão para lares de idosos
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Sobre o projeto</Text>
          <Text style={[styles.text, { color: c.textPrimary }]}>
            O AssisConnect foi desenvolvido como projeto aplicado multiplataforma
            no curso de Tecnólogo em Análise e Desenvolvimento de Sistemas da
            Universidade de Fortaleza. O objetivo é digitalizar e humanizar o
            acompanhamento de idosos em lares de assistência social.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Funcionalidades</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Feather name={f.icon} size={16} color={c.primary} />
              <Text style={[styles.featureText, { color: c.textPrimary }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Equipe</Text>
          {EQUIPE.map((m, i) => (
            <View key={i} style={[styles.memberRow, { borderBottomColor: c.surface }]}>
              <View style={[styles.avatar, { backgroundColor: c.accent }]}>
                <Feather name="user" size={16} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: c.textPrimary }]}>{m.nome}</Text>
                <Text style={[styles.memberRole, { color: c.textSecondary }]}>{m.papel}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: c.white }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Tecnologias</Text>
          <View style={styles.techRow}>
            {['React Native', 'Expo', 'Spring Boot', 'Java 17', 'MySQL / H2', 'Thymeleaf'].map((t) => (
              <View key={t} style={[styles.techChip, { backgroundColor: c.accent }]}>
                <Text style={[styles.techText, { color: c.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.footer, { color: c.textSecondary }]}>
          UNIFOR — N393 Projeto Aplicado Multiplataforma — 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 16 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  appName: { fontSize: 26, fontWeight: '800', marginTop: 10 },
  version: { fontSize: 12, marginTop: 2 },
  tagline: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  section: { borderRadius: 12, padding: 14, marginTop: 12, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  text: { fontSize: 13, lineHeight: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  featureText: { fontSize: 13 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 14, fontWeight: '700' },
  memberRole: { fontSize: 11, marginTop: 2 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  techText: { fontSize: 11, fontWeight: '700' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});
