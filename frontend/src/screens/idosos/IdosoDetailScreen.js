import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getIdoso } from '../../services/idosoService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';
import { gerarPDFFichaIdoso } from '../../utils/pdfGenerator';

export default function IdosoDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [idoso, setIdoso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useFocusEffect(useCallback(() => { loadIdoso(); }, []));

  async function loadIdoso() {
    try {
      const res = await getIdoso(id);
      setIdoso(res.data);
    } catch (e) {
      console.log('[IDOSO_DETAIL] Erro:', e);
    } finally {
      setLoading(false);
    }
  }

  function calcularIdade(dataNasc) {
    if (!dataNasc) return '?';
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  async function exportarPDF() {
    try {
      setExportando(true);
      await gerarPDFFichaIdoso(idoso);
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel gerar o PDF.');
    } finally {
      setExportando(false);
    }
  }

  if (loading) return <LoadingOverlay />;
  if (!idoso) return <Text style={{ padding: 20 }}>Idoso nao encontrado.</Text>;

  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusColor = idoso.falecido ? colors.textSecondary : idoso.inativo ? '#F59E0B' : colors.success;

  const quickActions = [
    { key: 'Medicamentos', icon: 'activity', label: 'Medicamentos', color: '#16a34a' },
    { key: 'Saude', icon: 'heart', label: 'Saude', color: '#dc2626' },
    { key: 'Visitas', icon: 'users', label: 'Visitas', color: '#2563eb' },
    { key: 'HistoricoPresenca', icon: 'calendar', label: 'Presenca', color: '#d97706' },
  ];

  const sections = [
    {
      title: 'Dados Pessoais',
      fields: [
        { label: 'Nome', value: idoso.nome },
        { label: 'Sexo', value: idoso.sexo },
        { label: 'Data de Nascimento', value: idoso.dataNascimento },
        { label: 'Idade', value: `${calcularIdade(idoso.dataNascimento)} anos` },
        { label: 'Estado Civil', value: idoso.estadoCivil },
        { label: 'RG', value: idoso.rg },
        { label: 'CPF', value: idoso.cpf },
      ],
    },
    {
      title: 'Endereco e Contato',
      fields: [
        { label: 'Endereco', value: idoso.endereco },
        { label: 'Cidade', value: idoso.cidade },
        { label: 'Estado', value: idoso.estado },
        { label: 'CEP', value: idoso.cep },
        { label: 'Telefone', value: idoso.telefoneIdoso },
        { label: 'Responsavel', value: idoso.responsavel },
        { label: 'Tel. Responsavel', value: idoso.telefoneResponsavel },
      ],
    },
    {
      title: 'Saude e Observacoes',
      fields: [
        { label: 'Doencas', value: idoso.doencas },
        { label: 'Alergias', value: idoso.alergias },
        { label: 'Plano de Saude', value: idoso.planoSaude },
        { label: 'Deficiencias', value: idoso.deficiencias },
        { label: 'Observacoes', value: idoso.observacoes },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.photoSection}>
        {idoso.fotoUrl ? (
          <Image source={{ uri: idoso.fotoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Feather name="user" size={40} color={colors.textSecondary} />
          </View>
        )}
        <Text style={styles.name}>{idoso.nome}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.quickActionsRow}>
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate(a.key, { idosoId: idoso.id, idosoNome: idoso.nome })
            }
          >
            <View style={[styles.quickActionIcon, { backgroundColor: a.color }]}>
              <Feather name={a.icon} size={18} color={colors.white} />
            </View>
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.pdfButton}
        onPress={exportarPDF}
        disabled={exportando}
      >
        <Feather name="file-text" size={16} color={colors.white} />
        <Text style={styles.pdfButtonText}>
          {exportando ? 'Gerando PDF...' : 'Ficha Completa em PDF'}
        </Text>
      </TouchableOpacity>

      {sections.map((section, si) => (
        <View key={si} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.fields.map((field, fi) => (
            <View key={fi} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Text style={styles.fieldValue}>{field.value || '-'}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: 30 },
  photoSection: { alignItems: 'center', paddingVertical: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: 10 },
  badge: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, color: colors.white, fontWeight: '700' },
  quickActionsRow: {
    flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingBottom: 8,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, color: colors.textPrimary, marginTop: 6, fontWeight: '600' },
  pdfButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, marginHorizontal: 12, marginBottom: 6,
    paddingVertical: 11, borderRadius: 10,
  },
  pdfButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  section: {
    backgroundColor: colors.white, marginHorizontal: 12, marginTop: 12,
    borderRadius: 12, padding: 14, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.surface,
  },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  fieldValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', flex: 1.5, textAlign: 'right' },
});
