import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import IdososStack from './IdososStack';
import CardapioScreen from '../screens/CardapioScreen';
import RegistroDiarioScreen from '../screens/RegistroDiarioScreen';
import RelatorioMensalScreen from '../screens/RelatorioMensalScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: 'home',
  Idosos: 'users',
  Cardapio: 'coffee',
  Registro: 'clipboard',
  Relatorios: 'bar-chart-2',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false, title: 'Inicio' }}
      />
      <Tab.Screen
        name="Idosos"
        component={IdososStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Cardapio"
        component={CardapioScreen}
        options={{ title: 'Cardapio' }}
      />
      <Tab.Screen
        name="Registro"
        component={RegistroDiarioScreen}
        options={{ title: 'Registro' }}
      />
      <Tab.Screen
        name="Relatorios"
        component={RelatorioMensalScreen}
        options={{ title: 'Relatorios' }}
      />
    </Tab.Navigator>
  );
}
