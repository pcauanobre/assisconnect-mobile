import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
  TextInput, Image, RefreshControl, Modal, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAtividades, saveAtividade } from '../services/atividadeService';
import { getIdosos } from '../services/idosoService';
import SearchBar from '../components/SearchBar';
import colors from '../theme/colors';

export default function RegistroDiarioScreen() {
  const [atividades, setAtividades] = useState([]);
  const [idosos, setIdosos] = useState([]);
  const [selectedAtividade, setSelectedAtividade] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentes, setPresentes] = useState(new Set());
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAtivPicker, setShowAtivPicker] = useState(false);
  const [showNewAtiv, setShowNewAtiv] = useState(false);
  const [novaAtividade, setNovaAtividade] = useState('');
  const [showConsulta, setShowConsulta] = useState(false);
  const [consultaData, setConsultaData] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [ativRes, idososRes] = await Promise.allSettled([
        getAtividades(),
        getIdosos(),
      ]);
      if (ativRes.status === 'fulfilled') {
        const atividadesList = ativRes.value.data || [];
        setAtividades(atividadesList);
        const nomes = [...new Set(atividadesList.map((a) => a.nome))];
        if (nomes.length > 0 && !selectedAtividade) {
          setSelectedAtividade(nomes[0]);
        }
      }
      if (idososRes.status === 'fulfilled') {
        const idososList = (idososRes.value.data || []).filter((i) => !i.inativo && !i.falecido);
        setIdosos(idososList);
      }
    } catch (e) {
      console.log('[REGISTRO] Erro:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function togglePresente(nome) {
    setPresentes((prev) => {
      const next = new Set(prev);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  }

  async function handleSave() {
    if (!selectedAtividade) {
      Alert.alert('Atencao', 'Selecione uma atividade.');
      return;
    }
    if (presentes.size === 0) {
      Alert.alert('Atencao', 'Selecione pelo menos um idoso.');
      return;
    }

    const agora = new Date();
    const hora = agora.toTimeString().split(' ')[0];

    const presentesList = [...presentes].map((nome) => {
      const idoso = idosos.find((i) => i.nome === nome);
      return {
        nome,
        data: selectedDate,
        hora,
        fotoUrl: idoso?.fotoUrl || '',
      };
    });

    try {
      await saveAtividade({
        nome: selectedAtividade,
        dataRegistro: selectedDate,
        horaRegistro: hora,
        presentes: presentesList,
      });
      Alert.alert('Sucesso', 'Presencas registradas!');
      setPresentes(new Set());
      loadData();
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel salvar.');
    }
  }

  async function handleNovaAtividade() {
    if (!novaAtividade.trim()) return;
    try {
      await saveAtividade({
        nome: novaAtividade.trim(),
        dataRegistro: selectedDate,
        horaRegistro: new Date().toTimeString().split(' ')[0],
        presentes: [],
      });
      setSelectedAtividade(novaAtividade.trim());
      setNovaAtividade('');
      setShowNewAtiv(false);
      loadData();
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel criar atividade.');
    }
  }

  async function handleConsulta() {
    if (!selectedAtividade) {
      Alert.alert('Atencao', 'Selecione uma atividade.');
      return;
    }
    try {
      const res = await getAtividades({ data: selectedDate, nome: selectedAtividade });
      const data = res.data || [];
      const allPresentes = data.flatMap((a) => a.presentes || []);
      setConsultaData(allPresentes);
      setShowConsulta(true);
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel consultar.');
    }
  }

  const atividadeNomes = [...new Set(atividades.map((a) => a.nome))];

  const filteredIdosos = search.trim()
    ? idosos.filter((i) => i.nome?.toLowerCase().includes(search.toLowerCase()))
    : idosos;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Activity Picker */}
        <Text style={styles.label}>Atividade</Text>
        <Pressable style={styles.picker} onPress={() => setShowAtivPicker(true)}>
          <Text style={styles.pickerText}>{selectedAtividade || 'Selecione...'}</Text>
          <Feather name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={() => setShowNewAtiv(true)}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.actionBtnText}>Nova</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleConsulta}>
            <Feather name="search" size={16} color={colors.primary} />
            <Text style={styles.actionBtnText}>Consultar</Text>
          </Pressable>
        </View>

        {/* Date */}
        <Text style={styles.label}>Data</Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Search & Attendance */}
        <Text style={[styles.label, { marginTop: 16 }]}>Registro de Presenca</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar idoso..." />

        {filteredIdosos.map((idoso) => (
          <Pressable
            key={idoso.id}
            style={[styles.idosoRow, presentes.has(idoso.nome) && styles.idosoRowSelected]}
            onPress={() => togglePresente(idoso.nome)}
          >
            {idoso.fotoUrl ? (
              <Image source={{ uri: idoso.fotoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Feather name="user" size={16} color={colors.textSecondary} />
              </View>
            )}
            <Text style={styles.idosoName}>{idoso.nome}</Text>
            <View style={[styles.checkbox, presentes.has(idoso.nome) && styles.checkboxChecked]}>
              {presentes.has(idoso.nome) && <Feather name="check" size={14} color={colors.white} />}
            </View>
          </Pressable>
        ))}

        {/* Save */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Salvar Presencas ({presentes.size})</Text>
        </Pressable>
      </ScrollView>

      {/* Activity Picker Modal */}
      <Modal visible={showAtivPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Atividade</Text>
            {atividadeNomes.map((nome) => (
              <Pressable
                key={nome}
                style={[styles.modalOption, selectedAtividade === nome && styles.modalOptionActive]}
                onPress={() => { setSelectedAtividade(nome); setShowAtivPicker(false); }}
              >
                <Text style={[styles.modalOptionText, selectedAtividade === nome && { color: colors.white }]}>{nome}</Text>
              </Pressable>
            ))}
            {atividadeNomes.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma atividade cadastrada</Text>
            )}
            <Pressable onPress={() => setShowAtivPicker(false)}>
              <Text style={styles.cancelText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* New Activity Modal */}
      <Modal visible={showNewAtiv} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Atividade</Text>
            <TextInput
              value={novaAtividade}
              onChangeText={setNovaAtividade}
              placeholder="Nome da atividade"
              style={styles.input}
              placeholderTextColor={colors.textSecondary}
            />
            <Pressable style={[styles.saveBtn, { marginTop: 12 }]} onPress={handleNovaAtividade}>
              <Text style={styles.saveBtnText}>Criar</Text>
            </Pressable>
            <Pressable onPress={() => setShowNewAtiv(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Consulta Modal */}
      <Modal visible={showConsulta} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Presencas - {selectedAtividade}</Text>
            {consultaData.length > 0 ? (
              consultaData.map((p, i) => (
                <View key={i} style={styles.consultaRow}>
                  <Feather name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.consultaName}>{p.nome}</Text>
                  <Text style={styles.consultaTime}>{p.hora}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma presenca registrada</Text>
            )}
            <Pressable onPress={() => setShowConsulta(false)}>
              <Text style={styles.cancelText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, paddingBottom: 30 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 12, borderWidth: 1, borderColor: colors.border,
  },
  pickerText: { fontSize: 14, color: colors.textPrimary },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  actionBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14,
    color: colors.textPrimary,
  },
  idosoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.surface,
    borderRadius: 8, marginBottom: 2,
  },
  idosoRowSelected: { backgroundColor: '#EDE9E5' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarPlaceholder: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  idosoName: { flex: 1, fontSize: 14, color: colors.textPrimary },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  saveBtn: {
    marginTop: 20, backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 30, maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  modalOption: {
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10,
    marginBottom: 4, backgroundColor: colors.surfaceLight,
  },
  modalOptionActive: { backgroundColor: colors.primary },
  modalOptionText: { fontSize: 14, color: colors.textPrimary },
  consultaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  consultaName: { flex: 1, fontSize: 14, color: colors.textPrimary },
  consultaTime: { fontSize: 12, color: colors.textSecondary },
  emptyText: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: colors.textSecondary, fontSize: 14 },
});
