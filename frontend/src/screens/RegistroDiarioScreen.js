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
import DateInput from '../components/DateInput';
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

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

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
      Alert.alert('Atenção', 'Selecione uma atividade.');
      return;
    }
    if (presentes.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um idoso.');
      return;
    }

    const agora = new Date();
    const hora = agora.toTimeString().split(' ')[0];
    const presentesList = [...presentes].map((nome) => {
      const idoso = idosos.find((i) => i.nome === nome);
      return { nome, data: selectedDate, hora, fotoUrl: idoso?.fotoUrl || '' };
    });

    try {
      await saveAtividade({
        nome: selectedAtividade,
        dataRegistro: selectedDate,
        horaRegistro: hora,
        presentes: presentesList,
      });
      Alert.alert('Sucesso', 'Presenças registradas!');
      setPresentes(new Set());
      loadData();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.');
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
      Alert.alert('Erro', 'Não foi possível criar atividade.');
    }
  }

  async function handleConsulta() {
    if (!selectedAtividade) {
      Alert.alert('Atenção', 'Selecione uma atividade.');
      return;
    }
    try {
      const res = await getAtividades({ data: selectedDate, nome: selectedAtividade });
      const data = res.data || [];
      const allPresentes = data.flatMap((a) => a.presentes || []);
      setConsultaData(allPresentes);
      setShowConsulta(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível consultar.');
    }
  }

  const atividadeNomes = [...new Set(atividades.map((a) => a.nome))];
  const filteredIdosos = search.trim()
    ? idosos.filter((i) => i.nome?.toLowerCase().includes(search.toLowerCase()))
    : idosos;

  const totalPresentes = presentes.size;
  const totalIdosos = filteredIdosos.length;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Registro Diário" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {/* Cabeçalho de contexto */}
        <View style={[styles.contextCard, { backgroundColor: c.primary }]}>
          <View style={styles.contextRow}>
            <View style={styles.contextItem}>
              <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contextLabel}>Data</Text>
              <DateInput
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', paddingVertical: 4 }}
              />
            </View>
            <View style={styles.contextDivider} />
            <View style={styles.contextItem}>
              <Feather name="users" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contextLabel}>Presentes</Text>
              <Text style={styles.contextValue}>{totalPresentes} / {totalIdosos}</Text>
            </View>
          </View>
        </View>

        {/* Seletor de Atividade */}
        <View style={[styles.card, { backgroundColor: c.white, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.primary, fontSize: scale(13) }]}>
            <Feather name="activity" size={13} /> ATIVIDADE
          </Text>
          <Pressable
            style={[styles.picker, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => setShowAtivPicker(true)}
          >
            <Text style={[styles.pickerText, { color: selectedAtividade ? c.textPrimary : c.textSecondary, fontSize: scale(14) }]}>
              {selectedAtividade || 'Selecione uma atividade...'}
            </Text>
            <Feather name="chevron-down" size={18} color={c.textSecondary} />
          </Pressable>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]} onPress={() => setShowNewAtiv(true)}>
              <Feather name="plus-circle" size={14} color={c.primary} />
              <Text style={[styles.actionBtnText, { color: c.primary, fontSize: scale(12) }]}>Nova atividade</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]} onPress={handleConsulta}>
              <Feather name="eye" size={14} color={c.primary} />
              <Text style={[styles.actionBtnText, { color: c.primary, fontSize: scale(12) }]}>Consultar registro</Text>
            </Pressable>
          </View>
        </View>

        {/* Lista de presença */}
        <View style={[styles.card, { backgroundColor: c.white, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.primary, fontSize: scale(13) }]}>
            <Feather name="check-square" size={13} /> REGISTRO DE PRESENÇA
          </Text>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar idoso..." />

          {filteredIdosos.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={32} color={c.border} />
              <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(13) }]}>
                Nenhum idoso encontrado
              </Text>
            </View>
          ) : (
            filteredIdosos.map((idoso) => {
              const marcado = presentes.has(idoso.nome);
              return (
                <Pressable
                  key={idoso.id}
                  style={[
                    styles.idosoRow,
                    { borderColor: c.border },
                    marcado && { backgroundColor: c.surface, borderColor: c.primary },
                  ]}
                  onPress={() => togglePresente(idoso.nome)}
                >
                  {idoso.fotoUrl ? (
                    <Image source={{ uri: idoso.fotoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: marcado ? c.primary : c.surface }]}>
                      <Feather name="user" size={16} color={marcado ? '#fff' : c.textSecondary} />
                    </View>
                  )}
                  <Text style={[styles.idosoName, { color: c.textPrimary, fontSize: scale(14), fontWeight: marcado ? '700' : '400' }]}>
                    {idoso.nome}
                  </Text>
                  {marcado ? (
                    <View style={[styles.badge, { backgroundColor: c.primary }]}>
                      <Feather name="check" size={13} color="#fff" />
                      <Text style={[styles.badgeText, { fontSize: scale(11) }]}>Presente</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]}>
                      <Text style={[styles.badgeTextInactive, { fontSize: scale(11), color: c.textSecondary }]}>Ausente</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Botão salvar */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: totalPresentes > 0 ? c.primary : c.border },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleSave}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={[styles.saveBtnText, { fontSize: scale(16) }]}>
            Salvar Presenças {totalPresentes > 0 ? `(${totalPresentes})` : ''}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Modal: selecionar atividade */}
      <Modal visible={showAtivPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Selecionar Atividade</Text>
              <Pressable onPress={() => setShowAtivPicker(false)}>
                <Feather name="x" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            {atividadeNomes.map((nome) => (
              <Pressable
                key={nome}
                style={[
                  styles.modalOption,
                  { backgroundColor: c.surface },
                  selectedAtividade === nome && { backgroundColor: c.primary },
                ]}
                onPress={() => { setSelectedAtividade(nome); setShowAtivPicker(false); }}
              >
                <Feather
                  name={selectedAtividade === nome ? 'check-circle' : 'circle'}
                  size={16}
                  color={selectedAtividade === nome ? '#fff' : c.textSecondary}
                />
                <Text style={[
                  styles.modalOptionText,
                  { color: c.textPrimary, fontSize: scale(14) },
                  selectedAtividade === nome && { color: '#fff', fontWeight: '700' },
                ]}>{nome}</Text>
              </Pressable>
            ))}
            {atividadeNomes.length === 0 && (
              <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(14), textAlign: 'center', padding: 20 }]}>
                Nenhuma atividade cadastrada
              </Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: nova atividade */}
      <Modal visible={showNewAtiv} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Nova Atividade</Text>
              <Pressable onPress={() => setShowNewAtiv(false)}>
                <Feather name="x" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={novaAtividade}
              onChangeText={setNovaAtividade}
              placeholder="Nome da atividade"
              style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
              placeholderTextColor={c.textSecondary}
              autoFocus
            />
            <Pressable style={[styles.saveBtn, { marginTop: 12, backgroundColor: c.primary }]} onPress={handleNovaAtividade}>
              <Text style={[styles.saveBtnText, { fontSize: scale(15) }]}>Criar atividade</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal: consulta */}
      <Modal visible={showConsulta} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>
                Presenças — {selectedAtividade}
              </Text>
              <Pressable onPress={() => setShowConsulta(false)}>
                <Feather name="x" size={22} color={c.textSecondary} />
              </Pressable>
            </View>
            {consultaData.length > 0 ? (
              consultaData.map((p, i) => (
                <View key={i} style={[styles.consultaRow, { borderBottomColor: c.surface }]}>
                  <View style={[styles.consultaDot, { backgroundColor: c.success }]} />
                  <Text style={[styles.consultaName, { color: c.textPrimary, fontSize: scale(14) }]}>{p.nome}</Text>
                  <Text style={[styles.consultaTime, { color: c.textSecondary, fontSize: scale(12) }]}>{p.hora}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="user-x" size={32} color={c.border} />
                <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(13) }]}>Nenhuma presença registrada</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 30, gap: 10 },

  contextCard: {
    borderRadius: 14, padding: 16, marginBottom: 2,
  },
  contextRow: { flexDirection: 'row', alignItems: 'center' },
  contextItem: { flex: 1, alignItems: 'center', gap: 4 },
  contextDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  contextLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase' },
  contextValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  contextDateInput: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },

  card: {
    borderRadius: 14, padding: 14, borderWidth: 1, gap: 10,
  },
  cardTitle: { fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },

  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1,
  },
  pickerText: {},
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  actionBtnText: { fontWeight: '600' },

  idosoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 10, borderRadius: 10, borderWidth: 1,
    marginBottom: 6, gap: 10,
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  idosoName: { flex: 1 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  badgeText: { color: '#fff', fontWeight: '700' },
  badgeTextInactive: {},

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14,
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: {},

  input: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 34, maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  modalTitle: { fontWeight: '800' },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 4,
  },
  modalOptionText: {},

  consultaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  consultaDot: { width: 10, height: 10, borderRadius: 5 },
  consultaName: { flex: 1 },
  consultaTime: {},
});
