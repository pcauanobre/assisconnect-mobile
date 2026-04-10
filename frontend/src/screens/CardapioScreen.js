import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCardapio } from '../services/cardapioService';
import MealEditModal from '../components/MealEditModal';
import LoadingOverlay from '../components/LoadingOverlay';
import ScreenHeader from '../components/ScreenHeader';
import colors from '../theme/colors';

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];
const TIPO_LABELS = { cafe: 'Cafe', almoco: 'Almoco', jantar: 'Jantar' };
const TIPO_ICONS = { cafe: 'coffee', almoco: 'sun', jantar: 'moon' };

export default function CardapioScreen() {
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
    <View style={styles.container}>
      <ScreenHeader title="Cardapio" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {DIAS.map((dia) => {
          const meals = cardapio[dia] || {};
          return (
            <View key={dia} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dia}</Text>
                <Pressable onPress={() => setEditDia(dia)} style={styles.editBtn}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </Pressable>
              </View>

              {['cafe', 'almoco', 'jantar'].map((tipo) => (
                <View key={tipo} style={styles.mealRow}>
                  <Feather name={TIPO_ICONS[tipo]} size={16} color={colors.primary} style={styles.mealIcon} />
                  <Text style={styles.mealType}>{TIPO_LABELS[tipo]}</Text>
                  <Text style={styles.mealName} numberOfLines={1}>
                    {meals[tipo]?.prato || '-'}
                  </Text>
                  <Text style={styles.mealCal}>
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
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 12, paddingBottom: 20 },
  dayCard: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.surface, paddingBottom: 6,
  },
  dayTitle: { fontSize: 16, fontWeight: '800', color: colors.primary },
  editBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  mealIcon: { marginRight: 6 },
  mealType: { width: 55, fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  mealName: { flex: 1, fontSize: 13, color: colors.textSecondary },
  mealCal: { fontSize: 11, color: colors.textSecondary, marginLeft: 4 },
});
