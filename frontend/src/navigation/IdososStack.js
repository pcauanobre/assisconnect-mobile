import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IdososListScreen from '../screens/idosos/IdososListScreen';
import IdosoDetailScreen from '../screens/idosos/IdosoDetailScreen';
import IdosoFormScreen from '../screens/idosos/IdosoFormScreen';
import MedicamentosScreen from '../screens/idosos/MedicamentosScreen';
import SaudeScreen from '../screens/idosos/SaudeScreen';
import VisitasScreen from '../screens/idosos/VisitasScreen';
import HistoricoPresencaScreen from '../screens/idosos/HistoricoPresencaScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function IdososStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary, height: 56 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen
        name="IdososList"
        component={IdososListScreen}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="Medicamentos"
        component={MedicamentosScreen}
        options={{ title: 'Medicamentos' }}
      />
      <Stack.Screen
        name="Saude"
        component={SaudeScreen}
        options={{ title: 'Saude' }}
      />
      <Stack.Screen
        name="Visitas"
        component={VisitasScreen}
        options={{ title: 'Visitas' }}
      />
      <Stack.Screen
        name="HistoricoPresenca"
        component={HistoricoPresencaScreen}
        options={{ title: 'Historico de Presenca' }}
      />
    </Stack.Navigator>
  );
}
