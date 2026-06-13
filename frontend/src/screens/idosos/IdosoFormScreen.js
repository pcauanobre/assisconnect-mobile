import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Image, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getIdoso, createIdoso, updateIdoso, deleteIdoso } from '../../services/idosoService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import DateInput from '../../components/DateInput';
import Toast from '../../components/Toast';
import FeedbackDialog from '../../components/FeedbackDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import AnimatedEnter from '../../components/AnimatedEnter';
import useFeedback from '../../hooks/useFeedback';

const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro'];
const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'];

export default function IdosoFormScreen({ route, navigation }) {
  const editId = route.params?.id;
  const isEdit = !!editId;
  const { activeColors: c, scale } = useAccessibility();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });
  const fb = useFeedback();
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);
  const [foto, setFoto] = useState('');
  const [form, setForm] = useState({
    nome: '', sexo: 'Masculino', dataNascimento: '', estadoCivil: 'Solteiro(a)',
    rg: '', cpf: '', endereco: '', cidade: '', estado: '', cep: '',
    telefoneIdoso: '', responsavel: '', telefoneResponsavel: '',
    doencas: '', alergias: '', planoSaude: '', deficiencias: '', observacoes: '',
    inativo: false, falecido: false,
  });

  useEffect(() => { if (isEdit) loadIdoso(); }, []);

  async function loadIdoso() {
    try {
      const res = await getIdoso(editId);
      const d = res.data;
      setForm({
        nome: d.nome || '', sexo: d.sexo || 'Masculino', dataNascimento: d.dataNascimento || '',
        estadoCivil: d.estadoCivil || 'Solteiro(a)', rg: d.rg || '', cpf: d.cpf || '',
        endereco: d.endereco || '', cidade: d.cidade || '', estado: d.estado || '', cep: d.cep || '',
        telefoneIdoso: d.telefoneIdoso || '', responsavel: d.responsavel || '',
        telefoneResponsavel: d.telefoneResponsavel || '', doencas: d.doencas || '',
        alergias: d.alergias || '', planoSaude: d.planoSaude || '',
        deficiencias: d.deficiencias || '', observacoes: d.observacoes || '',
        inativo: d.inativo || false, falecido: d.falecido || false,
      });
      setFoto(d.fotoUrl || '');
    } catch {
      fb.error('Erro ao carregar', 'Não foi possível buscar os dados do idoso.');
    } finally { setLoading(false); }
  }

  function updateField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'falecido' && value) next.inativo = true;
      return next;
    });
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
    if (!result.canceled && result.assets[0].base64) setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
  }

  async function handleSave() {
    if (!form.nome.trim()) { showToast('O nome é obrigatório.', 'warn'); return; }
    
    if (form.dataNascimento) {
      const parts = form.dataNascimento.split('-');
      const birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
      let age = new Date().getFullYear() - birthDate.getFullYear();
      const m = new Date().getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 30) {
        showToast('O idoso deve ter pelo menos 30 anos de idade.', 'warn');
        return;
      }
    }
    try {
      setSaving(true);
      const payload = { ...form, fotoUrl: foto || '', dataCriacao: isEdit ? undefined : new Date().toISOString().split('T')[0] };
      if (isEdit) await updateIdoso(editId, payload);
      else await createIdoso(payload);
      fb.success(
        isEdit ? 'Idoso atualizado!' : 'Idoso cadastrado!',
        isEdit ? 'As alterações foram salvas.' : `${form.nome} foi adicionado(a) ao sistema.`,
        1500,
      );
      setTimeout(() => navigation.goBack(), 1600);
    } catch {
      fb.error('Não foi possível salvar', 'Verifique os dados e tente novamente.');
    } finally { setSaving(false); }
  }

  function confirmarExcluir() {
    setConfirmandoExcluir(true);
  }

  async function executarExclusao() {
    try {
      await deleteIdoso(editId);
      fb.success('Idoso excluído', `${form.nome} foi removido(a) do sistema.`, 1300);
      setTimeout(() => navigation.goBack(), 1400);
    } catch {
      fb.error('Falha ao excluir', 'Tente novamente em alguns instantes.');
    }
  }

  const inputStyle = { backgroundColor: c.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: c.border, fontSize: 14, color: c.textPrimary };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.surface }}><ActivityIndicator size="large" color={c.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AnimatedEnter index={0}>
      <Pressable onPress={pickImage} style={styles.photoContainer}>
        {foto ? <Image source={{ uri: foto }} style={styles.photo} /> : (
          <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: c.accent }]}>
            <Feather name="camera" size={28} color={c.textSecondary} />
          </View>
        )}
        <Text style={[styles.photoLabel, { color: c.textSecondary, fontSize: scale(12) }]}>Selecionar foto</Text>
      </Pressable>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
      <Text style={[styles.sectionTitle, { color: c.primary, fontSize: scale(16) }]}>Dados Pessoais</Text>

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Nome *</Text>
      <TextInput value={form.nome} onChangeText={(v) => updateField('nome', v)} style={inputStyle} placeholder="Nome completo" placeholderTextColor={c.textSecondary} />

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Sexo</Text>
      <View style={styles.chipRow}>
        {SEXO_OPTIONS.map((opt) => (
          <Pressable key={opt}
            style={[styles.chip, { borderColor: c.border, backgroundColor: c.surfaceLight }, form.sexo === opt && { backgroundColor: c.primary, borderColor: c.primary }]}
            onPress={() => updateField('sexo', opt)}>
            <Text style={[styles.chipText, { color: c.textPrimary }, form.sexo === opt && { color: '#fff', fontWeight: '700' }]}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Data de Nascimento</Text>
      <DateInput value={form.dataNascimento} onChange={(v) => updateField('dataNascimento', v)} />

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Estado Civil</Text>
      <View style={styles.chipRow}>
        {ESTADO_CIVIL_OPTIONS.map((opt) => (
          <Pressable key={opt}
            style={[styles.chip, { borderColor: c.border, backgroundColor: c.surfaceLight }, form.estadoCivil === opt && { backgroundColor: c.primary, borderColor: c.primary }]}
            onPress={() => updateField('estadoCivil', opt)}>
            <Text style={[styles.chipText, { color: c.textPrimary }, form.estadoCivil === opt && { color: '#fff', fontWeight: '700' }]}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>RG</Text>
          <TextInput value={form.rg} onChangeText={(v) => updateField('rg', v)} style={inputStyle} placeholderTextColor={c.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>CPF</Text>
          <TextInput value={form.cpf} onChangeText={(v) => updateField('cpf', v)} style={inputStyle} placeholderTextColor={c.textSecondary} />
        </View>
      </View>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
      <Text style={[styles.sectionTitle, { color: c.primary, marginTop: 20, fontSize: scale(16) }]}>Endereço e Contato</Text>

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Endereço</Text>
      <TextInput value={form.endereco} onChangeText={(v) => updateField('endereco', v)} style={inputStyle} placeholderTextColor={c.textSecondary} />

      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Cidade</Text>
          <TextInput value={form.cidade} onChangeText={(v) => updateField('cidade', v)} style={inputStyle} placeholderTextColor={c.textSecondary} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Estado</Text>
          <TextInput value={form.estado} onChangeText={(v) => updateField('estado', v)} style={inputStyle} maxLength={2} placeholderTextColor={c.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>CEP</Text>
          <TextInput value={form.cep} onChangeText={(v) => updateField('cep', v)} style={inputStyle} keyboardType="number-pad" placeholderTextColor={c.textSecondary} />
        </View>
      </View>

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Telefone do Idoso</Text>
      <TextInput value={form.telefoneIdoso} onChangeText={(v) => updateField('telefoneIdoso', v)} style={inputStyle} keyboardType="phone-pad" placeholderTextColor={c.textSecondary} />

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Responsável</Text>
      <TextInput value={form.responsavel} onChangeText={(v) => updateField('responsavel', v)} style={inputStyle} placeholderTextColor={c.textSecondary} />

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>Tel. Responsável</Text>
      <TextInput value={form.telefoneResponsavel} onChangeText={(v) => updateField('telefoneResponsavel', v)} style={inputStyle} keyboardType="phone-pad" placeholderTextColor={c.textSecondary} />
      </AnimatedEnter>

      <AnimatedEnter index={3}>
      <Text style={[styles.sectionTitle, { color: c.primary, marginTop: 20, fontSize: scale(16) }]}>Saúde e Observações</Text>

      {[
        { key: 'doencas', label: 'Doenças' },
        { key: 'alergias', label: 'Alergias' },
        { key: 'planoSaude', label: 'Plano de Saúde' },
        { key: 'deficiencias', label: 'Deficiências' },
        { key: 'observacoes', label: 'Observações' },
      ].map(({ key, label }) => (
        <View key={key}>
          <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(13) }]}>{label}</Text>
          <TextInput value={form[key]} onChangeText={(v) => updateField(key, v)}
            style={[inputStyle, key !== 'planoSaude' && { minHeight: 60, textAlignVertical: 'top' }]}
            multiline={key !== 'planoSaude'} placeholderTextColor={c.textSecondary} />
        </View>
      ))}
      </AnimatedEnter>

      <AnimatedEnter index={4}>
      {isEdit && (
        <View style={styles.switchSection}>
          {[
            { key: 'inativo', label: 'Inativo', color: c.primary },
            { key: 'falecido', label: 'Falecido', color: c.danger },
          ].map(({ key, label, color }) => (
            <View key={key} style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: c.textPrimary, fontSize: scale(14) }]}>{label}</Text>
              <Switch value={form[key]} onValueChange={(v) => updateField(key, v)} trackColor={{ true: color }} />
            </View>
          ))}
        </View>
      )}

      <Pressable style={({ pressed }) => [styles.saveBtn, { backgroundColor: c.primary }, pressed && { opacity: 0.8 }]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.saveBtnText, { fontSize: scale(16) }]}>{isEdit ? 'Salvar Alterações' : 'Cadastrar'}</Text>}
      </Pressable>

      {isEdit && (
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, { borderColor: c.danger }, pressed && { opacity: 0.7 }]}
          onPress={confirmarExcluir}
        >
          <Feather name="trash-2" size={16} color={c.danger} />
          <Text style={[styles.deleteBtnText, { color: c.danger, fontSize: scale(14) }]}>Excluir Idoso</Text>
        </Pressable>
      )}
      </AnimatedEnter>
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
      message={`Esta ação não pode ser desfeita. ${form.nome} e todos os seus registros (saúde, medicamentos, visitas) serão removidos.`}
      confirmLabel="Excluir"
      variant="danger"
      icon="trash-2"
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  photoContainer: { alignItems: 'center', marginBottom: 16 },
  photo: { width: 80, height: 80, borderRadius: 40 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoLabel: { marginTop: 6, fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 4, marginTop: 10 },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1 },
  chipText: { fontSize: 12 },
  switchSection: { marginTop: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 14, fontWeight: '600' },
  saveBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  deleteBtn: {
    marginTop: 12, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    borderWidth: 1.5,
  },
  deleteBtnText: { fontWeight: '700', fontSize: 14 },
});
