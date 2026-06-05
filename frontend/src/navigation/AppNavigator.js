import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/ProfileScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import AcessibilidadeScreen from '../screens/AcessibilidadeScreen';
import SobreScreen from '../screens/SobreScreen';
import AtividadesScreen from '../screens/AtividadesScreen';
import TermosUsoScreen, { TERMOS_KEY } from '../screens/TermosUsoScreen';
import { useAccessibility } from '../contexts/AccessibilityContext';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { activeColors: c } = useAccessibility();
  const [termosAceitos, setTermosAceitos] = useState(null);

  const defaultHeader = {
    headerStyle: { backgroundColor: c.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '700' },
  };

  useEffect(() => {
    if (user) {
      AsyncStorage.getItem(TERMOS_KEY).then((val) => {
        setTermosAceitos(val === 'true');
      });
    } else {
      setTermosAceitos(null);
    }
  }, [user]);

  if (isLoading || (user && termosAceitos === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!user ? (
          <RootStack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        ) : !termosAceitos ? (
          <RootStack.Screen 
            name="Termos" 
            options={{ headerShown: false }}
          >
            {() => <TermosUsoScreen onAceitar={() => setTermosAceitos(true)} />}
          </RootStack.Screen>
        ) : (
          <>
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
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
