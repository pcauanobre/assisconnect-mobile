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
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function RegistroDiarioScreen() {
  const { activeColors: c, scale } = useAccessibility();
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
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Registro Diario" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {/* Activity Picker */}
        <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(14) }]}>Atividade</Text>
        <Pressable style={[styles.picker, { backgroundColor: c.white, borderColor: c.border }]} onPress={() => setShowAtivPicker(true)}>
          <Text style={[styles.pickerText, { color: c.textPrimary, fontSize: scale(14) }]}>{selectedAtividade || 'Selecione...'}</Text>
          <Feather name="chevron-down" size={18} color={c.textSecondary} />
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: c.white, borderColor: c.border }]} onPress={() => setShowNewAtiv(true)}>
            <Feather name="plus" size={16} color={c.primary} />
            <Text style={[styles.actionBtnText, { color: c.primary, fontSize: scale(13) }]}>Nova</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: c.white, borderColor: c.border }]} onPress={handleConsulta}>
            <Feather name="search" size={16} color={c.primary} />
            <Text style={[styles.actionBtnText, { color: c.primary, fontSize: scale(13) }]}>Consultar</Text>
          </Pressable>
        </View>

        {/* Date */}
        <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(14) }]}>Data</Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={c.textSecondary}
        />

        {/* Search & Attendance */}
        <Text style={[styles.label, { marginTop: 16, color: c.textPrimary, fontSize: scale(14) }]}>Registro de Presenca</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar idoso..." />

        {filteredIdosos.map((idoso) => (
          <Pressable
            key={idoso.id}
            style={[
              styles.idosoRow,
              { borderBottomColor: c.surface },
              presentes.has(idoso.nome) && { backgroundColor: '#EDE9E5' },
            ]}
            onPress={() => togglePresente(idoso.nome)}
          >
            {idoso.fotoUrl ? (
              <Image source={{ uri: idoso.fotoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: c.surface }]}>
                <Feather name="user" size={16} color={c.textSecondary} />
              </View>
            )}
            <Text style={[styles.idosoName, { color: c.textPrimary, fontSize: scale(14) }]}>{idoso.nome}</Text>
            <View style={[
              styles.checkbox,
              { borderColor: c.border },
              presentes.has(idoso.nome) && { backgroundColor: c.primary, borderColor: c.primary },
            ]}>
              {presentes.has(idoso.nome) && <Feather name="check" size={14} color={c.white} />}
            </View>
          </Pressable>
        ))}

        {/* Save */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: c.primary }, pressed && { opacity: 0.8 }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnText, { fontSize: scale(16) }]}>Salvar Presencas ({presentes.size})</Text>
        </Pressable>
      </ScrollView>

      {/* Activity Picker Modal */}
      <Modal visible={showAtivPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(18) }]}>Selecionar Atividade</Text>
            {atividadeNomes.map((nome) => (
              <Pressable
                key={nome}
                style={[
                  styles.modalOption,
                  { backgroundColor: c.surfaceLight },
                  selectedAtividade === nome && { backgroundColor: c.primary },
                ]}
                onPress={() => { setSelectedAtividade(nome); setShowAtivPicker(false); }}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: c.textPrimary, fontSize: scale(14) },
                  selectedAtividade === nome && { color: c.white },
                ]}>{nome}</Text>
              </Pressable>
            ))}
            {atividadeNomes.length === 0 && (
              <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(14) }]}>Nenhuma atividade cadastrada</Text>
            )}
            <Pressable onPress={() => setShowAtivPicker(false)}>
              <Text style={[styles.cancelText, { color: c.textSecondary, fontSize: scale(14) }]}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* New Activity Modal */}
      <Modal visible={showNewAtiv} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(18) }]}>Nova Atividade</Text>
            <TextInput
              value={novaAtividade}
              onChangeText={setNovaAtividade}
              placeholder="Nome da atividade"
              style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
              placeholderTextColor={c.textSecondary}
            />
            <Pressable style={[styles.saveBtn, { marginTop: 12, backgroundColor: c.primary }]} onPress={handleNovaAtividade}>
              <Text style={[styles.saveBtnText, { fontSize: scale(16) }]}>Criar</Text>
            </Pressable>
            <Pressable onPress={() => setShowNewAtiv(false)}>
              <Text style={[styles.cancelText, { color: c.textSecondary, fontSize: scale(14) }]}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Consulta Modal */}
      <Modal visible={showConsulta} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(18) }]}>Presencas - {selectedAtividade}</Text>
            {consultaData.length > 0 ? (
              consultaData.map((p, i) => (
                <View key={i} style={styles.consultaRow}>
                  <Feather name="check-circle" size={16} color={c.success} />
                  <Text style={[styles.consultaName, { color: c.textPrimary, fontSize: scale(14) }]}>{p.nome}</Text>
                  <Text style={[styles.consultaTime, { color: c.textSecondary, fontSize: scale(12) }]}>{p.hora}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(14) }]}>Nenhuma presenca registrada</Text>
            )}
            <Pressable onPress={() => setShowConsulta(false)}>
              <Text style={[styles.cancelText, { color: c.textSecondary, fontSize: scale(14) }]}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 30 },
  label: { fontWeight: '700', marginBottom: 6 },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 12, borderWidth: 1,
  },
  pickerText: {},
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: { fontWeight: '600' },
  input: {
    borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1,
  },
  idosoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 10, borderBottomWidth: 1,
    borderRadius: 8, marginBottom: 2,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  idosoName: { flex: 1 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    marginTop: 20, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 30, maxHeight: '70%',
  },
  modalTitle: { fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  modalOption: {
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionText: {},
  consultaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  consultaName: { flex: 1 },
  consultaTime: {},
  emptyText: { textAlign: 'center', paddingVertical: 16 },
  cancelText: { textAlign: 'center', marginTop: 12 },
});
