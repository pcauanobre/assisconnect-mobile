import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginCPFScreen from '../screens/Login/LoginCPFScreen';
import LoginSmsScreen from '../screens/Login/LoginSmsScreen';
import HomeScreen from '../screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="LoginCPF" screenOptions={{headerShown:false}}>
      <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
      <Stack.Screen name="LoginSms" component={LoginSmsScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
