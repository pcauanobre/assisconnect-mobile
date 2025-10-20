// client/styles/perfilIdosoStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6ED", // <- bege correto no conteúdo
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  /** =========================
   * CABEÇALHO
   * ========================= */
  header: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A2C1F",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8A7E72",
    marginTop: 4,
    textAlign: "center",
  },

  /** =========================
   * CARD DO IDOSO
   * ========================= */
  card: {
    backgroundColor: "transparent",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    marginBottom: 25,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#DCC6B6",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A2C1F",
    textAlign: "center",
  },
  info: {
    fontSize: 14,
    color: "#7A7168",
    marginTop: 3,
    textAlign: "center",
  },

  /** =========================
   * ABAS
   * ========================= */
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5EEE6",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  tabButtonActive: { backgroundColor: "#4B2E05" },
  tabButtonText: { color: "#3E2723", fontSize: 14, fontWeight: "500" },
  tabButtonTextActive: { color: "#fff" },

  /** =========================
   * CONTATOS
   * ========================= */
  contactSection: { paddingHorizontal: 20, marginBottom: 25 },
  feedbackText: { textAlign: "center", color: "#4B2E05", marginTop: 20 },

  /** =========================
   * FORM
   * ========================= */
  personalInfoInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBBBA0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: "#3A2C1F",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A2C1F",
    marginBottom: 18,
    textAlign: "center",
  },
  label: { fontSize: 14, color: "#5A4B3F", marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#F4F1EE",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#3A2C1F",
  },

  /** =========================
   * APP HEADER (mantido)
   * ========================= */
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FAF7F2",
    borderBottomWidth: 1,
    borderBottomColor: "#E2D8CF",
  },
  appLogo: { width: 42, height: 42, marginRight: 10, resizeMode: "contain" },
  appTitle: { fontSize: 20, fontWeight: "700", color: "#3A2C1F" },
});
