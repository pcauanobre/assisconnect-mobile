// client/screens/Home/HomeScreen.js
import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../styles/colors";
import Appheader from "../../components/Appheader";
import idosoImg from "../../assets/idoso.jpeg"; // foto local do idoso

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
        phone: "+55 (85) 99888-7766",
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

// Card compacto de info
const InfoCard = ({ text, boldText, iconName, isButton, onPress, rightAccessory }) => (
  <TouchableOpacity
    style={styles.infoCard}
    disabled={!isButton && !onPress}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.infoCardContent}>
      {iconName && (
        <Feather name={iconName} size={18} color={colors.text} style={{ marginRight: 10 }} />
      )}
      <Text style={styles.infoCardText}>
        {text}
        {boldText && <Text style={styles.infoCardBold}>{boldText}</Text>}
      </Text>
    </View>
    {rightAccessory ?? (isButton ? <Feather name="chevron-right" size={22} color={colors.muted} /> : null)}
  </TouchableOpacity>
);

// Acordeão simples
const Accordion = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.text} />
      </TouchableOpacity>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </>
  );
};

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Modais
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [whatsOpen, setWhatsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const humorFaces = [
    { emoji: "😀", color: "#6EBE63" },
    { emoji: "😊", color: "#A5CE63" },
    { emoji: "😐", color: "#F0C24B" },
    { emoji: "☹️", color: "#E88B49" },
    { emoji: "😡", color: "#E84949" },
  ];

  // Carrega dados: na entrada da tela (sem mostrar animação de refresh)
  const loadData = useCallback(async () => {
    try {
      const data = await getDashboardDataAPI();
      setDashboardData(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as informações.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(); // carrega ao entrar, sem mexer em `refreshing`
  }, [loadData]);

  // Pull-to-refresh (mostra spinner só quando o usuário puxa)
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Botão “reload” ao lado da Última sinc.
  const manualReload = () => {
    setRefreshing(true);
    loadData();
  };

  const formattedDate =
    dashboardData?.date
      ?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      .replace(".", "") ?? "—";

  const lastSyncStr =
    dashboardData?.lastSync
      ? dashboardData.lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "—";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header com logo (na área segura) */}
      <Appheader styles={appHeaderStyles} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Topbar: esquerda = logout | direita = engrenagem */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => setLogoutOpen(true)} style={styles.iconBtn}>
            <Feather name="log-out" size={22} color={colors.text} />
          </TouchableOpacity>

        <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.iconBtn}>
            <Feather name="settings" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Perfil/mensagem (avatar com a foto local do idoso) */}
        <View style={styles.profileSection}>
          <Image source={idosoImg} style={styles.avatar} />
          <Text style={styles.greeting}>Olá, Família!</Text>
        </View>

        {/* Humor do dia */}
        <View style={styles.humorCard}>
          <Text style={styles.humorTitle}>Humor do Dia</Text>
          <View style={styles.humorRow}>
            {humorFaces.map((face, i) => {
              const isHappy = face.emoji === "😀"; // destaque na carinha feliz
              return (
                <View
                  key={i}
                  style={[
                    styles.humorCircle,
                    { backgroundColor: face.color },
                    isHappy && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                >
                  <Text style={styles.humorEmoji}>{face.emoji}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Infos resumidas */}
        <InfoCard iconName="calendar" text={formattedDate} />
        <InfoCard text="Presença: " boldText={dashboardData?.presence ?? "—"} />
        <InfoCard text="Responsável do Dia: " boldText={dashboardData?.responsibleStaff ?? "—"} />

        {/* “Última sinc.” + botão de reload ao lado */}
        <InfoCard
          text="Última sinc. às: "
          boldText={lastSyncStr}
          rightAccessory={
            <TouchableOpacity onPress={manualReload} style={styles.reloadBtn} accessibilityLabel="Recarregar dados">
              <Feather name="refresh-cw" size={16} color="#fff" />
            </TouchableOpacity>
          }
        />

        {/* Acordeões */}
        <Accordion title="Medicamentos do Dia">
          {(dashboardData?.medications ?? ["—"]).map((item, i) => (
            <Text key={i} style={styles.accordionText}>• {item}</Text>
          ))}
        </Accordion>

        <Accordion title="Alimentação do Dia">
          <Text style={styles.accordionText}>{dashboardData?.food ?? "—"}</Text>
        </Accordion>

        <Accordion title="Comentários do Dia">
          <Text style={styles.accordionText}>{dashboardData?.comments ?? "—"}</Text>
        </Accordion>

        {/* Botão principal */}
        <TouchableOpacity style={styles.mainButton} onPress={() => setVisitOpen(true)}>
          <Text style={styles.mainButtonText}>Agendar Visita</Text>
        </TouchableOpacity>

        {/* Ações rápidas */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.callButton} onPress={() => setCallOpen(true)}>
            <Feather name="phone" size={16} color="#fff" />
            <Text style={styles.callText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={() => setWhatsOpen(true)}>
            <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
            <Text style={styles.callText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/** ======================
       * MODAIS
       * ======================= */}

      {/* Modal: Configurações (sem “Sair”) */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Configurações</Text>
            <Text style={modalCardStyles.subtitle}>Ajustes da sua experiência.</Text>

            {[
              { icon: "bell", label: "Notificações" },
              { icon: "shield", label: "Privacidade" },
              { icon: "users", label: "Vincular outro idoso" },
              { icon: "moon", label: "Tema (claro/escuro)" },
              { icon: "info", label: "Sobre o AssisConnect" },
              { icon: "help-circle", label: "Ajuda" },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={modalCardStyles.rowItem}>
                <Feather name={item.icon} size={18} color={colors.text} />
                <Text style={modalCardStyles.rowText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={modalCardStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setSettingsOpen(false)}>
                <Text style={outlinedBtnSmall.text}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={primaryBtn.centered} onPress={() => setSettingsOpen(false)}>
                <Text style={primaryBtn.text}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Agendar Visita */}
      <Modal
        visible={visitOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setVisitOpen(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Agendar Visita</Text>
            <Text style={modalCardStyles.subtitle}>
              Em breve: escolha data/horário. Por ora, confirme o agendamento.
            </Text>

            <View style={modalCardStyles.rowItem}>
              <Feather name="calendar" size={18} color={colors.text} />
              <Text style={modalCardStyles.rowText}>Data sugerida: {formattedDate}</Text>
            </View>

            <View style={modalCardStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setVisitOpen(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={primaryBtn.centered}
                onPress={() => {
                  setVisitOpen(false);
                  Alert.alert("Agendamento", "Visita agendada com sucesso!");
                }}
              >
                <Text style={primaryBtn.text}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Ligar */}
      <Modal
        visible={callOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCallOpen(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Ligar agora?</Text>
            <Text style={modalCardStyles.subtitle}>Confirmar ligação para {dashboardData?.phone ?? "—"}.</Text>

            <View style={modalCardStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setCallOpen(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={primaryBtn.centered}
                onPress={() => {
                  setCallOpen(false);
                  Alert.alert("Telefone", `Iniciando ligação para ${dashboardData?.phone ?? "—"}...`);
                }}
              >
                <Text style={primaryBtn.text}>Ligar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: WhatsApp */}
      <Modal
        visible={whatsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWhatsOpen(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Abrir WhatsApp?</Text>
            <Text style={modalCardStyles.subtitle}>Vamos abrir uma conversa com {dashboardData?.phone ?? "—"}.</Text>

            <View style={modalCardStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setWhatsOpen(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={primaryBtn.centered}
                onPress={() => {
                  setWhatsOpen(false);
                  Alert.alert("WhatsApp", `Abrindo WhatsApp para ${dashboardData?.phone ?? "—"}...`);
                }}
              >
                <Text style={primaryBtn.text}>Abrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Sair (topo esquerdo) */}
      <Modal
        visible={logoutOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutOpen(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Sair do AssisConnect?</Text>
            <Text style={modalCardStyles.subtitle}>Você poderá entrar novamente a qualquer momento.</Text>

            <View style={modalCardStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setLogoutOpen(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={primaryBtn.centered}
                onPress={() => {
                  setLogoutOpen(false);
                  navigation?.replace?.("LoginCPF");
                }}
              >
                <Text style={primaryBtn.text}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/** =========================
 * Estilos
 * ========================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  // menos padding no fim pra tirar o espaço em branco
  scroll: { paddingHorizontal: 20, paddingBottom: 80 },

  topbar: {
    marginTop: 10,
    marginBottom: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: { padding: 6, borderRadius: 10 },

  profileSection: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#DCC6B6",
  },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.text },

  humorCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  humorTitle: { fontSize: 14, color: colors.muted, marginBottom: 14 },
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
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardText: { color: colors.text, fontSize: 15 },
  infoCardBold: { fontWeight: "bold" },
  infoCardContent: { flexDirection: "row", alignItems: "center" },

  reloadBtn: {
    backgroundColor: colors.primary, // #4E342E
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  accordionHeader: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  accordionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  accordionBody: {
    backgroundColor: "#FCF9F4",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: -8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accordionText: { color: colors.text, fontSize: 15, lineHeight: 22 },

  mainButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  callText: { color: "#fff", marginLeft: 6, fontWeight: "bold", fontSize: 15 },
});

/** Header (Appheader) */
const appHeaderStyles = StyleSheet.create({
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FAF7F2",
    borderBottomWidth: 1,
    borderBottomColor: "#E2D8CF",
  },
  appLogo: { width: 42, height: 42, marginRight: 10, resizeMode: "contain", borderRadius: 21 },
  appTitle: { fontSize: 20, fontWeight: "700", color: "#3A2C1F" },
});

/** Modais */
const overlayStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

const modalCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    width: "92%",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 6, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center", marginBottom: 12 },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  rowText: { marginLeft: 10, color: colors.text, fontWeight: "600" },
  actions: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", gap: 10 },
});

/** Botões usados nos modais */
const primaryBtn = StyleSheet.create({
  centered: {
    backgroundColor: colors.primary, // marrom oficial
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  text: { color: "#fff", fontWeight: "bold" },
});

const outlinedBtnSmall = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: { color: colors.primary, fontWeight: "bold" },
});
