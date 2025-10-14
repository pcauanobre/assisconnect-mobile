// client/navigation/AppNavigator.js
import React from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Telas
import LoginCPFScreen from "../screens/Login/LoginCPFScreen";
import LoginEmailScreen from "../screens/Login/LoginEmailScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import PerfilResponsavelScreen from "../screens/Perfil/PerfilResponsavelScreen";

// Navbar
import Navbar, { NAV_HEIGHT } from "../components/Navbar";

const Stack = createNativeStackNavigator();

// ====== FLAG e ALTURA DA BARRA PRETA ======
const BARRA_PRETA = true;        // <<<<< altere para false para esconder
const BLACK_BAR_HEIGHT = 50;           // ajuste se quiser mais/menos alto
// ==========================================

// 🔧 Duração do auto-login (ms)
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
    <View style={styles.center}>
      <ActivityIndicator />
    </View>
  );
}

/** Wrapper que injeta a Navbar fixa no rodapé + (opcional) barra preta abaixo */
function withNavbar(ScreenComponent) {
  return function WrappedScreen(props) {
    const extraBottom =
      Platform.OS === "android" && BARRA_PRETA ? BLACK_BAR_HEIGHT : 0;

    return (
      <View style={styles.screenWrap}>
        <View style={styles.content}>
          <ScreenComponent {...props} />
        </View>

        {/* Rodapé com altura calculada para incluir a barra preta (quando ativa) */}
        <View style={[styles.navWrap, { minHeight: NAV_HEIGHT + extraBottom }]}>
          <Navbar navigation={props.navigation} />

          {/* Barra preta opcional (só Android) */}
          {extraBottom > 0 && (
            <View style={{ height: BLACK_BAR_HEIGHT, backgroundColor: "#000" }} />
          )}
        </View>
      </View>
    );
  };
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="PerfilResponsavel" screenOptions={{ headerShown: false }}>
      {/* Sem Navbar */}
      <Stack.Screen name="AuthGate" component={AuthGate} />
      <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
      <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />

      {/* Com Navbar fixa (+ barra preta opcional abaixo) */}
      <Stack.Screen name="Home" component={withNavbar(HomeScreen)} />
      <Stack.Screen name="PerfilResponsavel" component={withNavbar(PerfilResponsavelScreen)} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  screenWrap: {
    flex: 1,
    backgroundColor: "#FFF6ED",
  },
  content: {
    flex: 1,
  },
  navWrap: {
    // height: NAV_HEIGHT, // ❌ não use altura fixa, pois precisamos somar a barra preta
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
    }),
  },
});
