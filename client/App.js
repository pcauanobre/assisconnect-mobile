// client/App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar'; // <<<

export default function App() {
  useEffect(() => {
    // some/most OEMs respeitam melhor o "sticky-immersive"
    NavigationBar.setVisibilityAsync('sticky-immersive'); // 'immersive' ou 'sticky-immersive'
    // Deixa a barra em overlay e revela com swipe
    NavigationBar.setBehaviorAsync('overlay-swipe');      // overlay-transient/overlay-swipe
    // (opcional) mesma cor do fundo do app ou transparente
    // NavigationBar.setBackgroundColorAsync('transparent');
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
