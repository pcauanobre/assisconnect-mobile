// client/screens/Home/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const colors = {
  background: "#FDF5E6", 
  card: "#FFFFFF",
  textDark: "#3D1F0C",
  mutedText: "#3D1F0C",
  accent: "#3D1F0C",
  border: "#3D1F0C",
  button: "#3D1F0C",
};

// --- Mock do banco de dados ---
const getDashboardDataAPI = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        humor: 2,
        date: new Date("2025-02-04T12:00:00"),
        presence: "Confirmada",
        responsibleStaff: "Marina",
        lastSync: new Date(),
        medications: [
          "Losartana 50mg - 08:00",
          "Atenolol 25mg - 12:00",
          "Vitamina D - 13:00",
        ],
        food: "Almoçou bem, comeu toda a refeição, incluindo a sobremesa.",
        comments:
          "Participou ativamente da aula de zumba e interagiu com os colegas.",
      });
    }, 1000);
  });
};

const InfoCard = ({ text, boldText, iconName, isButton, onPress }) => (
  <TouchableOpacity
    style={styles.infoCard}
    disabled={!isButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.infoCardContent}>
      {iconName && (
        <Feather
          name={iconName}
          size={18}
          color={colors.textDark}
          style={{ marginRight: 10 }}
        />
      )}
      <Text style={styles.infoCardText}>
        {text}
        {boldText && <Text style={styles.infoCardBold}>{boldText}</Text>}
      </Text>
    </View>
    {isButton && (
      <Feather name="chevron-right" size={22} color={colors.mutedText} />
    )}
  </TouchableOpacity>
);

const Accordion = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textDark}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </>
  );
};

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const humorFaces = [
    { emoji: "😀", color: "#6EBE63" },
    { emoji: "😊", color: "#A5CE63" },
    { emoji: "😐", color: "#F0C24B" },
    { emoji: "☹️", color: "#E88B49" },
    { emoji: "😡", color: "#E84949" },
  ];

  const loadData = useCallback(async () => {
    try {
      const data = await getDashboardDataAPI();
      setDashboardData(data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar as informações.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
      </SafeAreaView>
    );
  }

  const formattedDate = dashboardData.date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(".", "");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <Feather name="log-out" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://img.freepik.com/fotos-gratis/homem-idoso-sorrindo-isolado-em-um-fundo-branco_53876-103859.jpg",
            }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Olá, Família!</Text>
        </View>

        <View style={styles.humorCard}>
          <Text style={styles.humorTitle}>Humor do Dia</Text>
          <View style={styles.humorRow}>
            {humorFaces.map((face, i) => (
              <View
                key={i}
                style={[styles.humorCircle, { backgroundColor: face.color }]}
              >
                <Text style={styles.humorEmoji}>{face.emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        <InfoCard iconName="calendar" text={formattedDate} />
        <InfoCard text="Presença: " boldText={dashboardData.presence} />
        <InfoCard text="Responsável do Dia: " boldText={dashboardData.responsibleStaff} />
        <InfoCard text="Última sinc. às: " boldText={dashboardData.lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} />
        <InfoCard iconName="settings" text="Configurações" isButton />

        <Accordion title="Medicamentos do Dia">
          {dashboardData.medications.map((item, i) => (
            <Text key={i} style={styles.accordionText}>• {item}</Text>
          ))}
        </Accordion>

        <Accordion title="Alimentação do Dia">
          <Text style={styles.accordionText}>{dashboardData.food}</Text>
        </Accordion>

        <Accordion title="Comentários do Dia">
          <Text style={styles.accordionText}>{dashboardData.comments}</Text>
        </Accordion>

        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>Agendar Visita</Text>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.callButton}>
            <Feather name="phone" size={16} color="#fff" />
            <Text style={styles.callText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
            <Text style={styles.callText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navActive}>
          <Feather name="home" size={22} color={colors.accent} />
          <Text style={styles.navActiveText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="plus-circle" size={22} color={colors.mutedText} />
          <Text style={styles.navText}>Atividades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={22} color={colors.mutedText} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  header: { marginVertical: 10 },
  profileSection: { alignItems: "center", marginTop: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.textDark },

  humorCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  humorTitle: { fontSize: 14, color: colors.mutedText, marginBottom: 14 },
  humorRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  humorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  humorEmoji: { fontSize: 22 },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  infoCardText: { color: colors.textDark, fontSize: 15 },
  infoCardBold: { fontWeight: "bold" },
  infoCardContent: { flexDirection: "row", alignItems: "center" },

  accordionHeader: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  accordionTitle: { color: colors.textDark, fontSize: 15, fontWeight: "600" },
  accordionBody: {
    backgroundColor: "#FFF9F1",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: -8,
    marginBottom: 10,
  },
  accordionText: { color: colors.textDark, fontSize: 15, lineHeight: 22 },

  mainButton: {
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  callText: { color: "#fff", marginLeft: 6, fontWeight: "bold", fontSize: 15 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, color: colors.mutedText, marginTop: 3 },
  navActive: { alignItems: "center", borderTopWidth: 3, borderTopColor: colors.accent, paddingTop: 4 },
  navActiveText: { fontSize: 12, color: colors.accent, fontWeight: "700", marginTop: 3 },
});
