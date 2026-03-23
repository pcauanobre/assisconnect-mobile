import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IdososListScreen from '../screens/idosos/IdososListScreen';
import IdosoDetailScreen from '../screens/idosos/IdosoDetailScreen';
import IdosoFormScreen from '../screens/idosos/IdosoFormScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function IdososStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="IdososList"
        component={IdososListScreen}
        options={{ title: 'Idosos' }}
      />
      <Stack.Screen
        name="IdosoDetail"
        component={IdosoDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen
        name="IdosoForm"
        component={IdosoFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar Idoso' : 'Novo Idoso',
        })}
      />
    </Stack.Navigator>
  );
}
