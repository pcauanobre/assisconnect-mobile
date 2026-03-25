import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
  Alert, ActivityIndicator, Image, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getIdoso, createIdoso, updateIdoso } from '../../services/idosoService';
import colors from '../../theme/colors';

const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro'];
const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viuvo(a)', 'Outro'];

export default function IdosoFormScreen({ route, navigation }) {
  const editId = route.params?.id;
  const isEdit = !!editId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [foto, setFoto] = useState('');
  const [form, setForm] = useState({
    nome: '', sexo: 'Masculino', dataNascimento: '', estadoCivil: 'Solteiro(a)',
    rg: '', cpf: '', endereco: '', cidade: '', estado: '', cep: '',
    telefoneIdoso: '', responsavel: '', telefoneResponsavel: '',
    doencas: '', alergias: '', planoSaude: '', deficiencias: '', observacoes: '',
    inativo: false, falecido: false,
  });

  useEffect(() => {
    if (isEdit) loadIdoso();
  }, []);

  async function loadIdoso() {
    try {
      const res = await getIdoso(editId);
      const d = res.data;
      setForm({
        nome: d.nome || '', sexo: d.sexo || 'Masculino',
        dataNascimento: d.dataNascimento || '', estadoCivil: d.estadoCivil || 'Solteiro(a)',
        rg: d.rg || '', cpf: d.cpf || '', endereco: d.endereco || '',
        cidade: d.cidade || '', estado: d.estado || '', cep: d.cep || '',
        telefoneIdoso: d.telefoneIdoso || '', responsavel: d.responsavel || '',
        telefoneResponsavel: d.telefoneResponsavel || '', doencas: d.doencas || '',
        alergias: d.alergias || '', planoSaude: d.planoSaude || '',
        deficiencias: d.deficiencias || '', observacoes: d.observacoes || '',
        inativo: d.inativo || false, falecido: d.falecido || false,
      });
      setFoto(d.fotoUrl || '');
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'falecido' && value) next.inativo = true;
      return next;
    });
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      Alert.alert('Atencao', 'O nome e obrigatorio.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        fotoUrl: foto || '',
        dataCriacao: isEdit ? undefined : new Date().toISOString().split('T')[0],
      };

      if (isEdit) {
        await updateIdoso(editId, payload);
      } else {
        await createIdoso(payload);
      }

      Alert.alert('Sucesso', isEdit ? 'Idoso atualizado!' : 'Idoso cadastrado!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Photo */}
      <Pressable onPress={pickImage} style={styles.photoContainer}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Feather name="camera" size={28} color={colors.textSecondary} />
          </View>
        )}
        <Text style={styles.photoLabel}>Selecionar foto</Text>
      </Pressable>

      {/* Dados Pessoais */}
      <Text style={styles.sectionTitle}>Dados Pessoais</Text>

      <Text style={styles.label}>Nome *</Text>
      <TextInput value={form.nome} onChangeText={(v) => updateField('nome', v)} style={styles.input} placeholderTextColor={colors.textSecondary} placeholder="Nome completo" />

      <Text style={styles.label}>Sexo</Text>
      <View style={styles.chipRow}>
        {SEXO_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.chip, form.sexo === opt && styles.chipActive]}
            onPress={() => updateField('sexo', opt)}
          >
            <Text style={[styles.chipText, form.sexo === opt && styles.chipTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput value={form.dataNascimento} onChangeText={(v) => updateField('dataNascimento', v)} style={styles.input} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Estado Civil</Text>
      <View style={styles.chipRow}>
        {ESTADO_CIVIL_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.chip, form.estadoCivil === opt && styles.chipActive]}
            onPress={() => updateField('estadoCivil', opt)}
          >
            <Text style={[styles.chipText, form.estadoCivil === opt && styles.chipTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>RG</Text>
          <TextInput value={form.rg} onChangeText={(v) => updateField('rg', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CPF</Text>
          <TextInput value={form.cpf} onChangeText={(v) => updateField('cpf', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />
        </View>
      </View>

      {/* Endereco */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Endereco e Contato</Text>

      <Text style={styles.label}>Endereco</Text>
      <TextInput value={form.endereco} onChangeText={(v) => updateField('endereco', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />

      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput value={form.cidade} onChangeText={(v) => updateField('cidade', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Estado</Text>
          <TextInput value={form.estado} onChangeText={(v) => updateField('estado', v)} style={styles.input} maxLength={2} placeholderTextColor={colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CEP</Text>
          <TextInput value={form.cep} onChangeText={(v) => updateField('cep', v)} style={styles.input} keyboardType="number-pad" placeholderTextColor={colors.textSecondary} />
        </View>
      </View>

      <Text style={styles.label}>Telefone do Idoso</Text>
      <TextInput value={form.telefoneIdoso} onChangeText={(v) => updateField('telefoneIdoso', v)} style={styles.input} keyboardType="phone-pad" placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Responsavel</Text>
      <TextInput value={form.responsavel} onChangeText={(v) => updateField('responsavel', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Tel. Responsavel</Text>
      <TextInput value={form.telefoneResponsavel} onChangeText={(v) => updateField('telefoneResponsavel', v)} style={styles.input} keyboardType="phone-pad" placeholderTextColor={colors.textSecondary} />

      {/* Saude */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Saude e Observacoes</Text>

      <Text style={styles.label}>Doencas</Text>
      <TextInput value={form.doencas} onChangeText={(v) => updateField('doencas', v)} style={[styles.input, styles.multiline]} multiline placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Alergias</Text>
      <TextInput value={form.alergias} onChangeText={(v) => updateField('alergias', v)} style={[styles.input, styles.multiline]} multiline placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Plano de Saude</Text>
      <TextInput value={form.planoSaude} onChangeText={(v) => updateField('planoSaude', v)} style={styles.input} placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Deficiencias</Text>
      <TextInput value={form.deficiencias} onChangeText={(v) => updateField('deficiencias', v)} style={[styles.input, styles.multiline]} multiline placeholderTextColor={colors.textSecondary} />

      <Text style={styles.label}>Observacoes</Text>
      <TextInput value={form.observacoes} onChangeText={(v) => updateField('observacoes', v)} style={[styles.input, styles.multiline]} multiline placeholderTextColor={colors.textSecondary} />

      {/* Status (edit only) */}
      {isEdit && (
        <View style={styles.switchSection}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Inativo</Text>
            <Switch
              value={form.inativo}
              onValueChange={(v) => updateField('inativo', v)}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Falecido</Text>
            <Switch
              value={form.falecido}
              onValueChange={(v) => updateField('falecido', v)}
              trackColor={{ true: colors.danger }}
            />
          </View>
        </View>
      )}

      {/* Save */}
      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>{isEdit ? 'Salvar Alteracoes' : 'Cadastrar'}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, paddingBottom: 40 },
  photoContainer: { alignItems: 'center', marginBottom: 16 },
  photo: { width: 80, height: 80, borderRadius: 40 },
  photoPlaceholder: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { marginTop: 6, fontSize: 12, color: colors.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border,
    fontSize: 14, color: colors.textPrimary,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textPrimary },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  switchSection: { marginTop: 20 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  saveBtn: {
    marginTop: 24, backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
