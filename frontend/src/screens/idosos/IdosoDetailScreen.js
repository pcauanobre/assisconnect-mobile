import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getIdoso } from '../../services/idosoService';
import LoadingOverlay from '../../components/LoadingOverlay';
import colors from '../../theme/colors';

export default function IdosoDetailScreen({ route }) {
  const { id } = route.params;
  const [idoso, setIdoso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdoso();
  }, []);

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

  if (loading) return <LoadingOverlay />;
  if (!idoso) return <Text style={{ padding: 20 }}>Idoso nao encontrado.</Text>;

  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusColor = idoso.falecido ? colors.textSecondary : idoso.inativo ? '#F59E0B' : colors.success;

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
      {/* Photo & Status */}
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

      {/* Sections */}
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
