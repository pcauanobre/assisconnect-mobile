import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ⬇️ Header igual ao das outras telas
import Appheader from "../../components/Appheader";

export default function PerfilResponsavelScreen() {
  const scrollRef = useRef(null);

  const [responsavel, setResponsavel] = useState({
    nome: "Pedro Nobre",
    sexo: "Masculino",
    nascimento: "15/08/1998",
    parentesco: "Filho",
    foto: "https://i.pravatar.cc/150?img=12",
  });

  const [isChanged, setIsChanged] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setResponsavel((prev) => ({ ...prev, [key]: value }));
    setIsChanged(true);
  };

  const handleSave = () => {
    console.log("Dados salvos:", responsavel);
    setIsChanged(false);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header com logo + título */}
      <Appheader styles={appHeaderStyles} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.titulo}>Meu Perfil</Text>
        <Text style={styles.subtitulo}>
          Visualize e edite suas informações pessoais
        </Text>

        {/* Card de Perfil */}
        <View style={styles.cardPerfil}>
          <Image source={{ uri: responsavel.foto }} style={styles.foto} />
          <Text style={styles.nome}>{responsavel.nome}</Text>
          <Text style={styles.info}>{responsavel.sexo}</Text>
        </View>

        {/* Card de Informações Pessoais */}
        <View style={styles.cardInfo}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.tracinho} />

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={responsavel.nome}
            onChangeText={(text) => handleChange("nome", text)}
            returnKeyType="next"
          />

          <Text style={styles.label}>Sexo</Text>
          <TextInput
            style={styles.input}
            value={responsavel.sexo}
            onChangeText={(text) => handleChange("sexo", text)}
            returnKeyType="next"
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            value={responsavel.nascimento}
            onChangeText={(text) => handleChange("nascimento", text)}
            keyboardType="number-pad"
            returnKeyType="next"
          />

          <Text style={styles.label}>Parentesco com o Idoso</Text>
          <TextInput
            style={styles.input}
            value={responsavel.parentesco}
            onChangeText={(text) => handleChange("parentesco", text)}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[styles.botao, !isChanged && styles.botaoDesabilitado]}
            disabled={!isChanged}
            onPress={handleSave}
          >
            <Text style={styles.botaoTexto}>Salvar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Popup */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.popup}>
              <Text style={styles.popupTitulo}>✅ Perfil salvo com sucesso!</Text>
              <Text style={styles.popupTexto}>
                Suas informações foram atualizadas com êxito.
              </Text>

              <TouchableOpacity
                style={styles.popupBotao}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.popupBotaoTexto}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF6ED", // fundo bege claro
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B2C1A",
    textAlign: "center",
  },
  subtitulo: {
    color: "#7A6A59",
    textAlign: "center",
    marginBottom: 16,
  },
  cardPerfil: {
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  nome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B2C1A",
  },
  info: {
    color: "#7A6A59",
    marginBottom: 12,
  },
  cardInfo: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B2E0F",
  },
  tracinho: {
    height: 2,
    backgroundColor: "#4B2E0F",
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 2,
  },
  label: {
    color: "#4B2E0F",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.3,
    borderColor: "#C7A98D",
    borderRadius: 10,
    padding: 10,
    color: "#4B2E0F",
    fontSize: 14,
  },
  botao: {
    backgroundColor: "#4A2E12",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  botaoDesabilitado: {
    backgroundColor: "#A18B74",
    opacity: 0.6,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  popupTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2E0F",
    marginBottom: 10,
    textAlign: "center",
  },
  popupTexto: {
    fontSize: 14,
    color: "#7A6A59",
    textAlign: "center",
    marginBottom: 20,
  },
  popupBotao: {
    backgroundColor: "#4A2E12",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  popupBotaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

/* Estilos usados pelo componente <Appheader /> */
const appHeaderStyles = StyleSheet.create({
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FAF7F2",          // barra clarinha atrás do logo/título
    borderBottomWidth: 1,
    borderBottomColor: "#E2D8CF",
  },
  appLogo: {
    width: 42,
    height: 42,
    marginRight: 10,
    resizeMode: "contain",
    borderRadius: 21,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A2C1F",
  },
});
