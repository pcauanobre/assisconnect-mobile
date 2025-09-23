import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginCPFScreen from '../screens/Login/LoginCPFScreen';
import LoginSmsScreen from '../screens/Login/LoginSmsScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="LoginCPF" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
      <Stack.Screen name="LoginSms" component={LoginSmsScreen} />
    </Stack.Navigator>
  );
}
