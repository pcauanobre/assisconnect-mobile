import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCardapio } from '../services/cardapioService';
import MealEditModal from '../components/MealEditModal';
import LoadingOverlay from '../components/LoadingOverlay';
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility } from '../contexts/AccessibilityContext';

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
const TIPO_LABELS = { cafe: 'Cafe', almoco: 'Almoco', jantar: 'Jantar' };
const TIPO_ICONS = { cafe: 'coffee', almoco: 'sun', jantar: 'moon' };

export default function CardapioScreen() {
  const { activeColors: c, scale } = useAccessibility();
  const [cardapio, setCardapio] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editDia, setEditDia] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await getCardapio();
      const items = res.data || [];
      const mapped = {};
      DIAS.forEach((dia) => { mapped[dia] = {}; });
      items.forEach((item) => {
        if (!mapped[item.dia]) mapped[item.dia] = {};
        mapped[item.dia][item.tipo] = item;
      });
      setCardapio(mapped);
    } catch (e) {
      console.log('[CARDAPIO] Erro:', e);
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

  if (loading) return <LoadingOverlay />;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScreenHeader title="Cardapio" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.primary]} />}
      >
        {DIAS.map((dia) => {
          const meals = cardapio[dia] || {};
          return (
            <View key={dia} style={[styles.dayCard, { backgroundColor: c.white }]}>
              <View style={[styles.dayHeader, { borderBottomColor: c.surface }]}>
                <Text style={[styles.dayTitle, { color: c.primary, fontSize: scale(16) }]}>{dia}</Text>
                <Pressable onPress={() => setEditDia(dia)} style={[styles.editBtn, { backgroundColor: c.surface }]}>
                  <Feather name="edit-2" size={16} color={c.primary} />
                </Pressable>
              </View>

              {['cafe', 'almoco', 'jantar'].map((tipo) => (
                <View key={tipo} style={styles.mealRow}>
                  <Feather name={TIPO_ICONS[tipo]} size={16} color={c.primary} style={styles.mealIcon} />
                  <Text style={[styles.mealType, { color: c.textPrimary, fontSize: scale(12) }]}>{TIPO_LABELS[tipo]}</Text>
                  <Text style={[styles.mealName, { color: c.textSecondary, fontSize: scale(13) }]} numberOfLines={1}>
                    {meals[tipo]?.prato || '-'}
                  </Text>
                  <Text style={[styles.mealCal, { color: c.textSecondary, fontSize: scale(11) }]}>
                    {meals[tipo]?.calorias ? `${meals[tipo].calorias} kcal` : ''}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <MealEditModal
        visible={!!editDia}
        onClose={() => setEditDia(null)}
        dia={editDia}
        meals={editDia ? cardapio[editDia] : null}
        onSaved={() => { setEditDia(null); loadData(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 20 },
  dayCard: {
    borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, borderBottomWidth: 1, paddingBottom: 6,
  },
  dayTitle: { fontWeight: '800' },
  editBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  mealIcon: { marginRight: 6 },
  mealType: { width: 55, fontWeight: '700' },
  mealName: { flex: 1 },
  mealCal: { marginLeft: 4 },
});
