import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Platform, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";

export const NAV_HEIGHT = 60;

const COLORS = {
  brown: "#3A1F0F",
  text: "#4b2e1e",
  bg: "#FFFFFF",
  surface: "#FFF6ED",
  stroke: "#EDE9E4",
};

const TABS = [
  { key: "Home", label: "Home", icon: "home-outline", route: "Home" },
  { key: "Atividades", label: "Atividades", icon: "add-circle-outline", route: "Atividades" },
  { key: "Perfil", label: "Perfil", icon: "person-outline", route: "PerfilResponsavel" },
];

export default function Navbar({ navigation }) {
  const { index, routes } = useNavigationState((s) => s);
  const current = routes?.[index]?.name;
  const [menuOpen, setMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isActive = (key) => {
    if (key === "Perfil") return current === "PerfilResponsavel" || current === "Idoso";
    return current === key;
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const handleTabPress = (tab) => {
    if (tab.key === "Perfil") {
      setMenuOpen((v) => !v);
      return;
    }
    setMenuOpen(false);
    navigation.navigate(tab.route);
  };

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: COLORS.surface }}>
      <View style={styles.barWrap}>
        <View style={styles.barCard}>
          {TABS.map((tab, i) => {
            const active = isActive(tab.key);
            const activeStyle =
              i === 0
                ? styles.itemActive1
                : i === 1
                ? styles.itemActive2
                : i === 2
                ? styles.itemActive3
                : null;

            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab)}
                style={[styles.item, active && activeStyle]}
              >
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={active ? COLORS.bg : COLORS.text}
                  style={styles.icon}
                />
                <Text style={[styles.label, { color: active ? COLORS.bg : COLORS.text }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {menuOpen && (
          <Animated.View
            style={[styles.popoverWrap, { bottom: NAV_HEIGHT + 8, opacity: fadeAnim }]}
          >
            <View style={styles.popover}>
              <Pressable
                style={styles.popItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate("Idoso");
                }}
              >
                <Ionicons name="person-outline" size={22} color={COLORS.text} />
                <Text style={styles.popText}>Idoso</Text>
              </Pressable>

              <Pressable
                style={styles.popItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate("PerfilResponsavel");
                }}
              >
                <Ionicons name="person-outline" size={22} color={COLORS.text} />
                <Text style={styles.popText}>Meu Perfil</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    backgroundColor: COLORS.surface,
  },
  barCard: {
    height: NAV_HEIGHT,
    backgroundColor: COLORS.bg,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: COLORS.stroke,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },

  // 🔥 cada ativo separado pra brincar à vontade
  itemActive1: {
    backgroundColor: COLORS.brown,
    // exemplo: borda arredondada esquerda
  },
  itemActive2: {
    backgroundColor: COLORS.brown,
    // exemplo: borda sem canto (meio)
  },
  itemActive3: {
    backgroundColor: COLORS.brown,
  },

  icon: { marginBottom: 2 },
  label: { fontSize: 13, fontWeight: "600" },

  popoverWrap: { position: "absolute", right: 12 },
  popover: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    minWidth: 220,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 10 },
    }),
  },
  popItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  popText: { marginLeft: 10, fontSize: 16, color: COLORS.text, fontWeight: "600" },
});
