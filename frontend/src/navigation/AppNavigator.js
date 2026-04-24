import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/ProfileScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import AcessibilidadeScreen from '../screens/AcessibilidadeScreen';
import SobreScreen from '../screens/SobreScreen';
import AtividadesScreen from '../screens/AtividadesScreen';
import colors from '../theme/colors';

const RootStack = createNativeStackNavigator();

const defaultHeader = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' },
};

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <RootStack.Navigator>
          <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <RootStack.Screen name="Profile" component={ProfileScreen}
            options={{ title: 'Meu Perfil', ...defaultHeader }} />
          <RootStack.Screen name="Notificacoes" component={NotificacoesScreen}
            options={{ headerShown: false }} />
          <RootStack.Screen name="Acessibilidade" component={AcessibilidadeScreen}
            options={{ headerShown: false }} />
          <RootStack.Screen name="Sobre" component={SobreScreen}
            options={{ headerShown: false }} />
          <RootStack.Screen name="Atividades" component={AtividadesScreen}
            options={{ headerShown: false }} />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
