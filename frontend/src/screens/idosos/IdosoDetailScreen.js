import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getIdoso, deleteIdoso } from '../../services/idosoService';
import { getRegistrosSaude } from '../../services/saudeService';
import { getMedicamentosByIdoso } from '../../services/medicamentoService';
import { getVisitasPorIdoso } from '../../services/visitaService';
import LoadingOverlay from '../../components/LoadingOverlay';
import Toast from '../../components/Toast';
import FeedbackDialog from '../../components/FeedbackDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import AnimatedEnter from '../../components/AnimatedEnter';
import useFeedback from '../../hooks/useFeedback';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { gerarPDFFichaIdoso } from '../../utils/pdfGenerator';
import { calcularIdade } from '../../utils/helpers';

export default function IdosoDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { activeColors: c, scale } = useAccessibility();
  const [idoso, setIdoso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (m, t = 'info') => setToast({ visible: true, message: m, type: t });
  const fb = useFeedback();
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

  function confirmarExcluir() {
    setConfirmandoExcluir(true);
  }

  async function executarExclusao() {
    try {
      await deleteIdoso(id);
      fb.success('Idoso excluído', `${idoso.nome} e todos os registros relacionados foram removidos.`, 1400);
      setTimeout(() => navigation.goBack(), 1500);
    } catch {
      fb.error('Falha ao excluir', 'Tente novamente em alguns instantes.');
    }
  }

  useFocusEffect(useCallback(() => { loadIdoso(); }, []));

  async function loadIdoso() {
    try {
      const res = await getIdoso(id);
      setIdoso(res.data);
    } catch {
      fb.error('Erro ao carregar', 'Não foi possível buscar os dados do idoso.');
    } finally { setLoading(false); }
  }

  async function exportarPDF() {
    try {
      setExportando(true);
      const [saudeRes, medsRes, visitasRes] = await Promise.allSettled([
        getRegistrosSaude(idoso.id),
        getMedicamentosByIdoso(idoso.id),
        getVisitasPorIdoso(idoso.id),
      ]);
      await gerarPDFFichaIdoso(
        idoso,
        saudeRes.status === 'fulfilled' ? (saudeRes.value?.data || []).slice(0, 5) : [],
        medsRes.status === 'fulfilled'   ? (medsRes.value?.data  || []).slice(0, 5) : [],
        visitasRes.status === 'fulfilled' ? (visitasRes.value?.data || []).slice(0, 5) : [],
        ({ type, title, message }) => {
          if (type === 'error') fb.error(title, message);
          else fb.success(title, message, 1600);
        }
      );
    } catch {
      fb.error('Falha ao gerar PDF', 'Não foi possível exportar a ficha.');
    } finally { setExportando(false); }
  }

  if (loading) return <LoadingOverlay />;
  if (!idoso) return <Text style={{ padding: 20 }}>Idoso não encontrado.</Text>;

  const statusLabel = idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo';
  const statusColor = idoso.falecido ? c.textSecondary : idoso.inativo ? '#F59E0B' : c.success;

  const quickActions = [
    { key: 'Medicamentos', icon: 'activity', label: 'Medicamentos', color: '#16a34a' },
    { key: 'Saude', icon: 'heart', label: 'Saúde', color: '#dc2626' },
    { key: 'Visitas', icon: 'users', label: 'Visitas', color: '#2563eb' },
    { key: 'HistoricoPresenca', icon: 'calendar', label: 'Presença', color: '#d97706' },
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
      title: 'Endereço e Contato',
      fields: [
        { label: 'Endereço', value: idoso.endereco },
        { label: 'Cidade', value: idoso.cidade },
        { label: 'Estado', value: idoso.estado },
        { label: 'CEP', value: idoso.cep },
        { label: 'Telefone', value: idoso.telefoneIdoso },
        { label: 'Responsável', value: idoso.responsavel },
        { label: 'Tel. Responsável', value: idoso.telefoneResponsavel },
      ],
    },
    {
      title: 'Saúde e Observações',
      fields: [
        { label: 'Doenças', value: idoso.doencas },
        { label: 'Alergias', value: idoso.alergias },
        { label: 'Plano de Saúde', value: idoso.planoSaude },
        { label: 'Deficiências', value: idoso.deficiencias },
        { label: 'Observações', value: idoso.observacoes },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AnimatedEnter index={0}>
      <View style={styles.photoSection}>
        {idoso.fotoUrl ? (
          <Image source={{ uri: idoso.fotoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: c.accent }]}>
            <Feather name="user" size={40} color={c.textSecondary} />
          </View>
        )}
        <Text style={[styles.name, { color: c.textPrimary }]}>{idoso.nome}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
      <View style={styles.quickActionsRow}>
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.quickAction}
            onPress={() => navigation.navigate(a.key, { idosoId: idoso.id, idosoNome: idoso.nome })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: a.color }]}>
              <Feather name={a.icon} size={18} color="#fff" />
            </View>
            <Text style={[styles.quickActionLabel, { color: c.textPrimary }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
      <TouchableOpacity style={[styles.pdfButton, { backgroundColor: c.primary }]} onPress={exportarPDF} disabled={exportando}>
        <Feather name="download" size={16} color="#fff" />
        <Text style={[styles.pdfButtonText, { fontSize: scale(13) }]}>{exportando ? 'Gerando PDF...' : 'Ficha Completa em PDF'}</Text>
      </TouchableOpacity>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
      <View style={styles.editDeleteRow}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: c.white, borderColor: c.border }]}
          onPress={() => navigation.navigate('IdosoForm', { id: idoso.id })}
        >
          <Feather name="edit-2" size={15} color={c.primary} />
          <Text style={[styles.editBtnText, { color: c.primary, fontSize: scale(13) }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: c.danger }]}
          onPress={confirmarExcluir}
        >
          <Feather name="trash-2" size={15} color={c.danger} />
          <Text style={[styles.deleteBtnText, { color: c.danger, fontSize: scale(13) }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
      </AnimatedEnter>

      {sections.map((section, si) => (
        <AnimatedEnter key={si} index={4 + si}>
          <View style={[styles.section, { backgroundColor: c.white }]}>
            <Text style={[styles.sectionTitle, { color: c.primary }]}>{section.title}</Text>
            {section.fields.map((field, fi) => (
              <View key={fi} style={[styles.fieldRow, { borderBottomColor: c.surface }]}>
                <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{field.label}</Text>
                <Text style={[styles.fieldValue, { color: c.textPrimary }]}>{field.value || '-'}</Text>
              </View>
            ))}
          </View>
        </AnimatedEnter>
      ))}
    </ScrollView>
    <Toast visible={toast.visible} message={toast.message} type={toast.type}
      onHide={() => setToast(t => ({ ...t, visible: false }))} />
    <FeedbackDialog
      visible={fb.visible}
      onClose={fb.close}
      type={fb.type}
      title={fb.title}
      message={fb.message}
      autoCloseMs={fb.autoCloseMs}
    />
    <ConfirmDialog
      visible={confirmandoExcluir}
      onClose={() => setConfirmandoExcluir(false)}
      onConfirm={executarExclusao}
      title="Excluir idoso?"
      message={`Esta ação não pode ser desfeita. ${idoso?.nome || ''} e todos os registros de saúde, medicamentos e visitas serão removidos.`}
      confirmLabel="Excluir"
      variant="danger"
      icon="trash-2"
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  photoSection: { alignItems: 'center', paddingVertical: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 10 },
  badge: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingBottom: 8 },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 11, marginTop: 6, fontWeight: '600' },
  pdfButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 12, marginBottom: 6, paddingVertical: 11, borderRadius: 10,
  },
  pdfButtonText: { color: '#fff', fontWeight: '700' },
  editDeleteRow: { flexDirection: 'row', gap: 8, marginHorizontal: 12, marginTop: 8 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  editBtnText: { fontWeight: '700' },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
  },
  deleteBtnText: { fontWeight: '700' },
  section: { marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 14, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  fieldLabel: { fontSize: 13, flex: 1 },
  fieldValue: { fontSize: 13, fontWeight: '600', flex: 1.5, textAlign: 'right' },
});
