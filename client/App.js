// client/App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('sticky-immersive');
    NavigationBar.setBehaviorAsync('overlay-swipe');
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
