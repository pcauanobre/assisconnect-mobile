import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import PerfilResponsavelScreen from '../screens/Perfil/PerfilResponsavelScreen';

const Stack = createNativeStackNavigator();

export default function PrivateNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PerfilResponsavel" component={PerfilResponsavelScreen} />
    </Stack.Navigator>
  );
}
