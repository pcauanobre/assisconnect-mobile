import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
  TextInput, Image, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAtividades, saveAtividade } from '../services/atividadeService';
import { getIdosos } from '../services/idosoService';
import SearchBar from '../components/SearchBar';
import ScreenHeader from '../components/ScreenHeader';
import DateInput from '../components/DateInput';
import BottomSheet from '../components/BottomSheet';
import Toast from '../components/Toast';
import { useAccessibility } from '../contexts/AccessibilityContext';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDateLabel(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS[dt.getDay()]}, ${String(d).padStart(2, '0')} ${MESES_CURTOS[m - 1]}`;
}

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

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  function showToast(message, isError = false) {
    setToast({ visible: true, message, type: isError ? 'error' : 'success' });
  }

  // useRef para evitar closure stale no loadData
  const selectedAtividadeRef = useRef(selectedAtividade);
  selectedAtividadeRef.current = selectedAtividade;

  const loadData = useCallback(async () => {
    try {
      const [ativRes, idososRes] = await Promise.allSettled([
        getAtividades(),
        getIdosos(),
      ]);
      if (ativRes.status === 'fulfilled') {
        const list = ativRes.value.data || [];
        setAtividades(list);
        const nomes = [...new Set(list.map((a) => a.nome))];
        if (nomes.length > 0 && !selectedAtividadeRef.current) {
          setSelectedAtividade(nomes[0]);
        }
      }
      if (idososRes.status === 'fulfilled') {
        const list = (idososRes.value.data || []).filter((i) => !i.inativo && !i.falecido);
        setIdosos(list);
      }
    } catch (e) {
      console.log('[REGISTRO] Erro:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Atualiza presenças ao trocar data ou atividade
  const loadPresencas = useCallback(async (data, atividade) => {
    if (!data || !atividade) { setPresentes(new Set()); return; }
    try {
      const res = await getAtividades({ data, nome: atividade });
      const registros = res.data || [];
      const nomes = new Set(
        registros.flatMap((r) => (r.presentes || []).map((p) => p.nome))
      );
      setPresentes(nomes);
    } catch {
      setPresentes(new Set());
    }
  }, []);

  useEffect(() => {
    loadPresencas(selectedDate, selectedAtividade);
  }, [selectedDate, selectedAtividade, loadPresencas]);

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
      showToast('Selecione uma atividade.', true);
      return;
    }
    if (presentes.size === 0) {
      showToast('Selecione pelo menos um idoso.', true);
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
      showToast(`${presentesList.length} presença(s) registrada(s)!`);
      loadData();
      loadPresencas(selectedDate, selectedAtividade);
    } catch {
      showToast('Não foi possível salvar.', true);
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
    } catch {
      Alert.alert('Erro', 'Não foi possível criar atividade.');
    }
  }

  async function handleConsulta() {
    if (!selectedAtividade) {
      showToast('Selecione uma atividade.', true);
      return;
    }
    try {
      const res = await getAtividades({ data: selectedDate, nome: selectedAtividade });
      const data = res.data || [];
      const allPresentes = data.flatMap((a) => a.presentes || []);
      setConsultaData(allPresentes);
      setShowConsulta(true);
    } catch {
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
        contentContainerStyle={[styles.content, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {/* Cabeçalho de contexto */}
        <View style={[styles.contextCard, { backgroundColor: c.primary }]}>
          <View style={styles.contextRow}>

            {/* Data com ícone de calendário */}
            <View style={styles.contextItem}>
              <DateInput
                value={selectedDate}
                onChange={setSelectedDate}
                iconOnly
                iconColor="rgba(255,255,255,0.9)"
                iconSize={22}
              />
              <View style={styles.contextTextBlock}>
                <Text style={[styles.contextLabel, { fontSize: scale(10) }]}>Data</Text>
                <Text style={[styles.contextDateText, { fontSize: scale(14) }]}>{formatDateLabel(selectedDate)}</Text>
              </View>
            </View>

            <View style={styles.contextDivider} />

            {/* Presentes */}
            <View style={styles.contextItem}>
              <Feather name="users" size={20} color="rgba(255,255,255,0.9)" />
              <View style={styles.contextTextBlock}>
                <Text style={[styles.contextLabel, { fontSize: scale(10) }]}>Presentes</Text>
                <Text style={[styles.contextValue, { fontSize: scale(20) }]}>{totalPresentes} / {totalIdosos}</Text>
              </View>
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
      </ScrollView>

      {/* FAB — Salvar */}
      <Pressable
        style={[
          styles.fab,
          { backgroundColor: totalPresentes > 0 ? c.primary : c.inactive },
        ]}
        onPress={handleSave}
      >
        <Feather name="check" size={24} color="#fff" />
        {totalPresentes > 0 && (
          <View style={[styles.fabBadge, { backgroundColor: '#e5302a', borderColor: c.surface }]}>
            <Text style={styles.fabBadgeText}>{totalPresentes}</Text>
          </View>
        )}
      </Pressable>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* Modal: selecionar atividade */}
      <BottomSheet visible={showAtivPicker} onClose={() => setShowAtivPicker(false)}>
        <View style={[styles.modalContent, { backgroundColor: c.white }]}>
          <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Selecionar Atividade</Text>
            <Pressable onPress={() => setShowAtivPicker(false)} hitSlop={8}>
              <Feather name="x" size={20} color={c.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
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
      </BottomSheet>

      {/* Modal: nova atividade */}
      <BottomSheet visible={showNewAtiv} onClose={() => setShowNewAtiv(false)}>
        <View style={[styles.modalContent, { backgroundColor: c.white }]}>
          <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>Nova Atividade</Text>
            <Pressable onPress={() => setShowNewAtiv(false)} hitSlop={8}>
              <Feather name="x" size={20} color={c.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <TextInput
              value={novaAtividade}
              onChangeText={setNovaAtividade}
              placeholder="Nome da atividade"
              style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
              placeholderTextColor={c.textSecondary}
              autoFocus
            />
          </View>
          <View style={[styles.modalFooter, { borderTopColor: c.border }]}>
            <Pressable style={[styles.modalSaveBtn, { backgroundColor: c.primary }]} onPress={handleNovaAtividade}>
              <Text style={[styles.modalSaveBtnText, { fontSize: scale(15) }]}>Criar atividade</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      {/* Modal: consulta */}
      <BottomSheet visible={showConsulta} onClose={() => setShowConsulta(false)}>
        <View style={[styles.modalContent, { backgroundColor: c.white }]}>
          <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary, fontSize: scale(17) }]}>
              Presenças — {selectedAtividade}
            </Text>
            <Pressable onPress={() => setShowConsulta(false)} hitSlop={8}>
              <Feather name="x" size={20} color={c.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            {consultaData.length > 0 ? (
              consultaData.map((p, i) => (
                <View key={i} style={[styles.consultaRow, { borderBottomColor: c.border }]}>
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
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, gap: 10 },

  contextCard: {
    borderRadius: 14, padding: 16, marginBottom: 2,
  },
  contextRow: { flexDirection: 'row', alignItems: 'center' },
  contextItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  contextDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  contextTextBlock: { gap: 2 },
  contextLabel: { fontSize: 10, color: 'rgba(255,255,255,0.95)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  contextValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  contextDateText: { fontSize: 14, fontWeight: '700', color: '#fff' },

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

  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: {},

  input: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
  },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  fabBadge: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2,
  },
  fabBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderRadius: 20 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  modalTitle: { fontWeight: '800', fontSize: 17 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 4,
  },
  modalOptionText: {},
  modalFooter: {
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  modalSaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12,
  },
  modalSaveBtnText: { color: '#fff', fontWeight: '800' },

  consultaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  consultaDot: { width: 10, height: 10, borderRadius: 5 },
  consultaName: { flex: 1 },
  consultaTime: {},
});
