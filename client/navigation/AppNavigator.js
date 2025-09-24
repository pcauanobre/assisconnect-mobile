// client/navigation/AppNavigator.js
import React from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginCPFScreen from "../screens/Login/LoginCPFScreen";
import LoginEmailScreen from "../screens/Login/LoginEmailScreen";
import HomeScreen from "../screens/Home/HomeScreen";

const Stack = createNativeStackNavigator();

// 🔧 Trocar aqui: duração do auto-login (ms)
const SESSION_DURATION = 30 * 1000; // 30s

function AuthGate({ navigation }) {
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("session");
        const data = raw ? JSON.parse(raw) : null;
        const valid =
          data?.loggedIn === true &&
          typeof data?.timestamp === "number" &&
          Date.now() - data.timestamp < SESSION_DURATION;

        if (!isMounted) return;
        if (valid) navigation.replace("Home");
        else navigation.replace("LoginCPF");
      } catch {
        if (!isMounted) return;
        navigation.replace("LoginCPF");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="AuthGate" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthGate" component={AuthGate} />
      <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
      <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
