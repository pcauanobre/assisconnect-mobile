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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import colors from "../../styles/colors";
import Appheader from "../../components/Appheader";
import idosoImg from "../../assets/idoso.jpeg";

// 🔗 Firestore
import { db } from "../../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// ===== Helpers =====
const todayISO = () => new Date().toISOString().slice(0, 10);
const tsToDate = (v) => (v?.toDate ? v.toDate() : v instanceof Date ? v : null);
const addDaysISO = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Locale PT-BR para o calendário
LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ],
  monthNamesShort: ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],
  dayNames: ["domingo","segunda","terça","quarta","quinta","sexta","sábado"],
  dayNamesShort: ["dom","seg","ter","qua","qui","sex","sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

// Emojis de humor (5 → 😀 ... 1 → 😡)
const humorFaces = [
  { emoji: "😀", color: "#6EBE63" }, // 5
  { emoji: "😊", color: "#A5CE63" }, // 4
  { emoji: "😐", color: "#F0C24B" }, // 3
  { emoji: "☹️", color: "#E88B49" }, // 2
  { emoji: "😡", color: "#E84949" }, // 1
];

// ❤️ marrom unificado
const BROWN = "#3A1F0F";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Data selecionada (padrão: hoje)
  const [dateISO, setDateISO] = useState(todayISO());
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // Flag para indicar ausência de rotina
  const [noRoutine, setNoRoutine] = useState(false);

  // Modais extras
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [whatsOpen, setWhatsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const loadData = useCallback(async (forcedISO) => {
    try {
      const useISO = forcedISO ?? dateISO;
      const raw = await AsyncStorage.getItem("session");
      const session = raw ? JSON.parse(raw) : null;
      const cpf = session?.cpf;
      if (!cpf) {
        Alert.alert("Sessão inválida", "Entre novamente para carregar seus dados.");
        navigation?.replace?.("LoginCPF");
        return;
      }

      // pessoaIdosa/{cpf}
      const pessoaRef = doc(db, "pessoaIdosa", String(cpf));
      const pessoaSnap = await getDoc(pessoaRef);
      if (!pessoaSnap.exists()) {
        Alert.alert("Atenção", "Cadastro não encontrado.");
        return;
      }
      const pessoa = pessoaSnap.data() || {};
      const photoUrl = pessoa?.fotoUrl || null;

      // pessoaIdosa/{cpf}/dias/{YYYY-MM-DD}
      const diaRef = doc(db, `pessoaIdosa/${cpf}/dias/${useISO}`);
      const diaSnap = await getDoc(diaRef);

      if (!diaSnap.exists()) {
        // Sem registro para a data → não abre modal, apenas marca ausência e mostra placeholders
        setNoRoutine(true);
        setDashboardData({
          date: new Date(`${useISO}T12:00:00`),
          humorLevel: 3,
          presence: "-----------",
          responsibleStaff: "-----------",
          lastSync: null,
          phone: "-----------",
          medications: ["-----------"],
          food: "-----------",
          comments: "-----------",
          photoUrl,
        });
        return;
      }

      const dia = diaSnap.data() || {};
      const medications =
        (dia.medicamentosDia || [])
          .map((m) => {
            const nome = (m?.nome || "").trim();
            const dose = (m?.dose || "").trim();
            const horario = (m?.horario || "").trim();
            const left = [nome, dose].filter(Boolean).join(" ");
            return [left, horario].filter(Boolean).join(" - ");
          }) || [];

      const food = dia.alimentacao || "-----------";
      const comments = dia.comentarios || "-----------";
      const phone = pessoa?.contato?.telefone || "-----------";
      const presence = dia.presenca || "-----------";
      const responsibleStaff = dia.responsavelDoDia || "-----------";
      const lastSync = tsToDate(dia.ultimaSync) || null;
      const humorLevel = Math.min(5, Math.max(1, Number(dia.humorNivel || 3)));

      setNoRoutine(false);
      setDashboardData({
        humorLevel,
        date: new Date(`${useISO}T12:00:00`),
        presence,
        responsibleStaff,
        lastSync,
        phone,
        medications: medications.length ? medications : ["-----------"],
        food,
        comments,
        photoUrl,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível carregar as informações.");
    } finally {
      setRefreshing(false);
    }
  }, [dateISO, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  // índice visual do humor
  const selectedIdx = 5 - (dashboardData?.humorLevel ?? 3);

  // escolher data no calendário
  const selectDate = (iso) => {
    setDateISO(iso);
    setDateModalOpen(false);
    setRefreshing(true);
    loadData(iso);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Appheader styles={appHeaderStyles} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra de topo */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => setLogoutOpen(true)} style={styles.iconBtn}>
            <Feather name="log-out" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.iconBtn}>
            <Feather name="settings" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Seletor de Data (sem setas) */}
        <View style={styles.dateRowColumn}>
          <TouchableOpacity
            style={styles.dateIconOnly}
            onPress={() => setDateModalOpen(true)}
            accessibilityLabel="Escolher data"
          >
            <Feather name="calendar" size={18} color={BROWN} />
          </TouchableOpacity>
          {noRoutine && (
            <Text style={styles.noRoutineCaption}>Não há rotina para esta data</Text>
          )}
          {/* Mostra a data formatada atual abaixo (opcional) */}
          <Text style={styles.currentDateText}>{formattedDate}</Text>
        </View>


        {/* Perfil */}
        <View style={styles.profileSection}>
          <Image
            source={dashboardData?.photoUrl ? { uri: dashboardData.photoUrl } : idosoImg}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Olá, Família!</Text>
        </View>

        {/* Humor */}
        <View style={styles.humorCard}>
          <Text style={styles.humorTitle}>Humor do Dia</Text>
          <View style={styles.humorRow}>
            {humorFaces.map((face, i) => {
              const isSelected = i === selectedIdx;
              return (
                <View key={i} style={styles.humorItem}>
                  {isSelected && <View pointerEvents="none" style={styles.humorRing} />}
                  <View style={[styles.humorCircle, { backgroundColor: face.color }]}>
                    <Text style={styles.humorEmoji}>{face.emoji}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Infos */}
        <InfoCard text="Presença: " boldText={dashboardData?.presence ?? "-----------"} />
        <InfoCard text="Responsável do Dia: " boldText={dashboardData?.responsibleStaff ?? "-----------"} />

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
          {(dashboardData?.medications ?? ["-----------"]).map((item, i) => (
            <Text key={i} style={styles.accordionText}>• {item}</Text>
          ))}
        </Accordion>

        <Accordion title="Alimentação do Dia">
          <Text style={styles.accordionText}>{dashboardData?.food ?? "-----------"}</Text>
        </Accordion>

        <Accordion title="Comentários do Dia">
          <Text style={styles.accordionText}>{dashboardData?.comments ?? "-----------"}</Text>
        </Accordion>

        {/* Botões */}
        <TouchableOpacity style={styles.mainButton} onPress={() => setVisitOpen(true)}>
          <Text style={styles.mainButtonText}>Agendar Visita</Text>
        </TouchableOpacity>

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

      {/* === Modal: Calendário === */}
      <Modal visible={dateModalOpen} transparent animationType="fade" onRequestClose={() => setDateModalOpen(false)}>
        <View style={overlayStyles.overlay}>
          <View style={modalCardStyles.card}>
            <Text style={modalCardStyles.title}>Escolher Data</Text>
            <Text style={modalCardStyles.subtitle}>Toque em uma data no calendário</Text>

            <Calendar
              initialDate={dateISO}
              onDayPress={(day) => selectDate(day.dateString)}
              markedDates={{
                [dateISO]: { selected: true, selectedColor: BROWN, selectedTextColor: "#fff" },
              }}
              theme={{
                textDayFontWeight: "600",
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
                arrowColor: BROWN,
                monthTextColor: BROWN,
                selectedDayBackgroundColor: BROWN,
              }}
              style={calendarStyles.calendar}
            />

            <View style={modalCardStyles.actions}>
              <TouchableOpacity
                style={outlinedBtnSmall.container}
                onPress={() => selectDate(todayISO())}
              >
                <Text style={outlinedBtnSmall.text}>Hoje ({todayISO()})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={primaryBtn.centered} onPress={() => setDateModalOpen(false)}>
                <Text style={primaryBtn.text}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* === Modais padrões === */}
      <SimpleModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Configurações"
        subtitle="Ajustes da sua experiência."
        rows={[
          { icon: "bell", label: "Notificações" },
          { icon: "shield", label: "Privacidade" },
          { icon: "users", label: "Vincular outro idoso" },
          { icon: "moon", label: "Tema (claro/escuro)" },
          { icon: "info", label: "Sobre o AssisConnect" },
          { icon: "help-circle", label: "Ajuda" },
        ]}
      />

      <ConfirmModal
        visible={visitOpen}
        onCancel={() => setVisitOpen(false)}
        onConfirm={() => {
          setVisitOpen(false);
          Alert.alert("Agendamento", `Visita agendada com sucesso para ${formattedDate}!`);
        }}
        title="Agendar Visita"
        subtitle={`Em breve: escolha data/horário. Por ora, confirme o agendamento para ${formattedDate}.`}
      />

      <ConfirmModal
        visible={callOpen}
        onCancel={() => setCallOpen(false)}
        onConfirm={() => {
          setCallOpen(false);
          Alert.alert("Telefone", `Iniciando ligação para ${dashboardData?.phone ?? "-----------"}...`);
        }}
        title="Ligar agora?"
        subtitle={`Confirmar ligação para ${dashboardData?.phone ?? "-----------"}.`}
      />

      <ConfirmModal
        visible={whatsOpen}
        onCancel={() => setWhatsOpen(false)}
        onConfirm={() => {
          setWhatsOpen(false);
          Alert.alert("WhatsApp", `Abrindo WhatsApp para ${dashboardData?.phone ?? "-----------"}...`);
        }}
        title="Abrir WhatsApp?"
        subtitle={`Vamos abrir uma conversa com ${dashboardData?.phone ?? "-----------"}.`}
      />

      <ConfirmModal
        visible={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          AsyncStorage.removeItem("session");
          navigation?.replace?.("LoginCPF");
        }}
        title="Sair do AssisConnect?"
        subtitle="Você poderá entrar novamente a qualquer momento."
        confirmText="Sair"
      />
    </SafeAreaView>
  );
}

// ====== Auxiliares ======
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

const SimpleModal = ({ visible, onClose, title, subtitle, rows = [] }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={overlayStyles.overlay}>
      <View style={modalCardStyles.card}>
        <Text style={modalCardStyles.title}>{title}</Text>
        <Text style={modalCardStyles.subtitle}>{subtitle}</Text>
        {rows.map((item) => (
          <TouchableOpacity key={item.label} style={modalCardStyles.rowItem}>
            <Feather name={item.icon} size={18} color={colors.text} />
            <Text style={modalCardStyles.rowText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={modalCardStyles.actions}>
          <TouchableOpacity style={outlinedBtnSmall.container} onPress={onClose}>
            <Text style={outlinedBtnSmall.text}>Fechar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={primaryBtn.centered} onPress={onClose}>
            <Text style={primaryBtn.text}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const ConfirmModal = ({ visible, onCancel, onConfirm, title, subtitle, confirmText = "Confirmar" }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={overlayStyles.overlay}>
      <View style={modalCardStyles.card}>
        <Text style={modalCardStyles.title}>{title}</Text>
        <Text style={modalCardStyles.subtitle}>{subtitle}</Text>
        <View style={modalCardStyles.actions}>
          <TouchableOpacity style={outlinedBtnSmall.container} onPress={onCancel}>
            <Text style={outlinedBtnSmall.text}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={primaryBtn.centered} onPress={onConfirm}>
            <Text style={primaryBtn.text}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ===== Estilos =====
const RING_OFFSET = 6;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 80 },

  topbar: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: { padding: 6, borderRadius: 10 },

  /* Date selector */
  dateRowColumn: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dateIconOnly: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2D8CF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  noRoutineCaption: {
    marginTop: 6,
    color: "#9A7F6B",
    fontSize: 12,
  },
  currentDateText: {
    marginTop: 2,
    color: "#6B543F",
    fontSize: 12,
    fontWeight: "700",
  },

  noRoutineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF8F0",
    borderColor: "#F1DEC9",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  noRoutineBannerText: { color: "#6B543F", flex: 1 },

  profileSection: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#DCC6B6",
  },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.text, textAlign: "center" },

  humorCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    alignItems: "center",
  },
  humorTitle: { fontSize: 14, color: colors.muted, marginBottom: 14 },
  humorRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },

  humorItem: {
    width: 42,
    height: 42,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  humorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  humorRing: {
    position: "absolute",
    top: -RING_OFFSET,
    left: -RING_OFFSET,
    right: -RING_OFFSET,
    bottom: -RING_OFFSET,
    borderWidth: 3,
    borderColor: BROWN,
    borderRadius: 21 + RING_OFFSET,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardText: { color: colors.text, fontSize: 15 },
  infoCardBold: { fontWeight: "bold" },
  infoCardContent: { flexDirection: "row", alignItems: "center" },

  reloadBtn: {
    backgroundColor: BROWN,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
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
    backgroundColor: BROWN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
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
    backgroundColor: BROWN,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  callText: { color: "#fff", marginLeft: 6, fontWeight: "bold", fontSize: 15 },
});

const calendarStyles = StyleSheet.create({
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 10,
  },
});

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

const primaryBtn = StyleSheet.create({
  centered: {
    backgroundColor: BROWN,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  text: { color: "#fff", fontWeight: "bold" },
});

const outlinedBtnSmall = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: BROWN,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: { color: BROWN, fontWeight: "bold" },
});
