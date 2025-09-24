import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginCPFScreen from '../screens/Login/LoginCPFScreen';

const Stack = createNativeStackNavigator();

export default function PublicNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
    </Stack.Navigator>
  );
}
