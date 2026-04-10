import React from 'react';
import { View, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import IdososStack from './IdososStack';
import CardapioScreen from '../screens/CardapioScreen';
import RegistroDiarioScreen from '../screens/RegistroDiarioScreen';
import RelatorioMensalScreen from '../screens/RelatorioMensalScreen';
import colors from '../theme/colors';

const Tab = createMaterialTopTabNavigator();

const TAB_ICONS = {
  Idosos: 'users',
  Cardapio: 'coffee',
  Dashboard: 'home',
  Registro: 'clipboard',
  Relatorios: 'bar-chart-2',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  // Padding extra pra barra de navegacao do Android nao sobrepor o menu
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Tab.Navigator
        initialRouteName="Dashboard"
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => (
            <Feather name={TAB_ICONS[route.name]} size={22} color={color} />
          ),
          tabBarShowIcon: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
          tabBarIndicatorStyle: { backgroundColor: colors.accent, height: 3, borderRadius: 2 },
          tabBarStyle: {
            backgroundColor: colors.primary,
            paddingBottom: bottomPadding,
            paddingTop: 4,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'none',
            marginTop: -2,
          },
          swipeEnabled: true,
          lazy: true,
        })}
      >
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
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false, title: 'Inicio' }}
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
    </View>
  );
}
