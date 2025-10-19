import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7F3",
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
  backgroundColor: "transparent", // ou "#F9F7F3" para combinar com o fundo da tela
  paddingVertical: 25,
  paddingHorizontal: 20,
  borderRadius: 20,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0, // remove sombra se quiser
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
  button: {
    backgroundColor: "#4B2C20",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
    marginTop: -10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /** =========================
   * ABAS DE DOCUMENTOS / CONTATOS
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
  tabButtonActive: {
    backgroundColor: "#4B2E05",
  },
  tabButtonText: {
    color: "#3E2723",
    fontSize: 14,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#fff",
  },

  /** =========================
   * SEÇÃO DE CONTATOS
   * ========================= */
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  contactLabel: {
    color: "#4B2E05",
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
    fontSize: 14,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: "#4B2E05",
    borderRadius: 10,
    padding: 10,
    color: "#4B2E05",
    backgroundColor: "#fff",
  },
  feedbackText: {
    textAlign: "center",
    color: "#4B2E05",
    marginTop: 20,
  },
  editButton: {
    backgroundColor: "#4B2E05",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  /** =========================
   * FORMULÁRIO DE INFORMAÇÕES PESSOAIS
   * ========================= */
 personalInfoInput: {
  backgroundColor: "#fff", // ou 'transparent' se preferir
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
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#5A4B3F",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F4F1EE",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#3A2C1F",
  },

  /** =========================
   * BOTÕES DE CONTATO RÁPIDO
   * ========================= */
  contactButtons: {
    marginTop: 10,
    gap: 10,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4B2C20",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },

  /** =========================
   * APP HEADER
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
  appLogo: {
    width: 42,
    height: 42,
    marginRight: 10,
    resizeMode: "contain",
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A2C1F",
  },
});
