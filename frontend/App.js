import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { AccessibilityProvider, useAccessibility } from './src/contexts/AccessibilityContext';
import AppNavigator from './src/navigation/AppNavigator';

function ThemedStatusBar() {
  const { config } = useAccessibility();
  return <StatusBar style={config.darkMode ? 'light' : 'light'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <ThemedStatusBar />
          <AppNavigator />
        </AuthProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
