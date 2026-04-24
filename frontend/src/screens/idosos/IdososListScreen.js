import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Alert, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getIdosos, deleteIdoso } from '../../services/idosoService';
import IdosoCard from '../../components/IdosoCard';
import SearchBar from '../../components/SearchBar';
import FilterModal from '../../components/FilterModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import ScreenHeader from '../../components/ScreenHeader';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export default function IdososListScreen({ navigation }) {
  const { activeColors: c, scale } = useAccessibility();
  const [idosos, setIdosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ sexo: 'Todos', status: 'Todos', idadeMin: '', idadeMax: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getIdosos();
      setIdosos(res.data || []);
    } catch (e) {
      console.log('[IDOSOS] Erro:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function calcularIdade(dataNasc) {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

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

  function handleDelete(id, nome) {
    Alert.alert('Confirmar', `Deseja excluir ${nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteIdoso(id);
            setIdosos((prev) => prev.filter((i) => i.id !== id));
          } catch (e) {
            Alert.alert('Erro', 'Nao foi possivel excluir.');
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingOverlay />;

  const filtered = getFilteredList();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Idosos" />
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome..." />
        </View>
        <Pressable style={[styles.filterBtn, { backgroundColor: c.primary }]} onPress={() => setShowFilter(true)}>
          <Feather name="filter" size={20} color={c.white} />
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <IdosoCard
            idoso={item}
            onView={() => navigation.navigate('IdosoDetail', { id: item.id })}
            onEdit={() => navigation.navigate('IdosoForm', { id: item.id })}
            onDelete={() => handleDelete(item.id, item.nome)}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: scale(14) }]}>Nenhum idoso encontrado</Text>
        }
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('IdosoForm', {})}
      >
        <Feather name="plus" size={24} color={c.white} />
      </Pressable>

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFilters}
        initialFilters={filters}
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
  list: { paddingHorizontal: 8, paddingBottom: 80 },
  emptyText: {
    textAlign: 'center', marginTop: 40,
  },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
});
