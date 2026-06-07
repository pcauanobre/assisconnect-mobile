import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getIdosos, deleteIdoso } from '../../services/idosoService';
import IdosoCard from '../../components/IdosoCard';
import SearchBar from '../../components/SearchBar';
import FilterModal from '../../components/FilterModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import FAB from '../../components/FAB';
import AnimatedEnter from '../../components/AnimatedEnter';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackDialog from '../../components/FeedbackDialog';
import useFeedback from '../../hooks/useFeedback';
import Toast from '../../components/Toast';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { calcularIdade } from '../../utils/helpers';

export default function IdososListScreen({ navigation }) {
  const { activeColors: c } = useAccessibility();
  const [idosos, setIdosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ sexo: 'Todos', status: 'Todos', idadeMin: '', idadeMax: '' });
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, nome }
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const fb = useFeedback();

  const showToast = (message, type = 'info') => setToast({ visible: true, message, type });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getIdosos();
      const list = res.data || [];
      list.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      setIdosos(list);
    } catch {
      // silenciosamente; UI mostra estado vazio
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function getFilteredList() {
    let list = [...idosos];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((i) => i.nome?.toLowerCase().includes(s));
    }

    if (filters.sexo !== 'Todos') {
      list = list.filter((i) => i.sexo === filters.sexo);
    }

    if (filters.status !== 'Todos') {
      if (filters.status === 'Ativo') list = list.filter((i) => !i.inativo && !i.falecido);
      else if (filters.status === 'Inativo') list = list.filter((i) => i.inativo && !i.falecido);
      else if (filters.status === 'Falecido') list = list.filter((i) => i.falecido);
    }

    if (filters.idadeMin) {
      list = list.filter((i) => calcularIdade(i.dataNascimento) >= parseInt(filters.idadeMin));
    }
    if (filters.idadeMax) {
      list = list.filter((i) => calcularIdade(i.dataNascimento) <= parseInt(filters.idadeMax));
    }

    return list;
  }

  async function executarExclusao(id, nome) {
    try {
      await deleteIdoso(id);
      setIdosos((prev) => prev.filter((i) => i.id !== id));
      fb.success('Idoso excluído', `${nome} foi removido(a) do sistema.`, 1300);
    } catch {
      fb.error('Não foi possível excluir', 'Tente novamente em alguns instantes.');
    }
  }

  function handleDelete(id, nome) {
    setConfirmTarget({ id, nome });
  }

  if (loading) return <LoadingOverlay />;

  const filtered = getFilteredList();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Idosos" />
      <AnimatedEnter index={0}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome..." />
          </View>
          <Pressable style={[styles.filterBtn, { backgroundColor: c.primary }]} onPress={() => setShowFilter(true)}>
            <Feather name="filter" size={20} color={c.white} />
          </Pressable>
        </View>
      </AnimatedEnter>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <IdosoCard
            idoso={item}
            index={index}
            onView={() => navigation.navigate('IdosoDetail', { id: item.id })}
            onEdit={() => navigation.navigate('IdosoForm', { id: item.id })}
            onDelete={() => handleDelete(item.id, item.nome)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="Nenhum idoso encontrado"
            subtitle={search || filters.sexo !== 'Todos' ? 'Tente ajustar os filtros' : 'Cadastre o primeiro idoso pelo botão +'}
          />
        }
      />

      <FAB onPress={() => navigation.navigate('IdosoForm', {})} accessibilityLabel="Cadastrar novo idoso" />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFilters}
        initialFilters={filters}
      />

      <ConfirmDialog
        visible={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && executarExclusao(confirmTarget.id, confirmTarget.nome)}
        title="Excluir idoso?"
        message={confirmTarget
          ? `Esta ação não pode ser desfeita. ${confirmTarget.nome} e todos os seus registros de saúde, medicamentos e visitas serão removidos.`
          : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        icon="trash-2"
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
      <FeedbackDialog
        visible={fb.visible}
        onClose={fb.close}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        autoCloseMs={fb.autoCloseMs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 12, gap: 8,
  },
  filterBtn: {
    width: 42, height: 42, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  list: { paddingHorizontal: 8, paddingBottom: 80, flexGrow: 1 },
});
