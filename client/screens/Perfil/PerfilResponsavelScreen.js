// client/screens/Perfil/PerfilResponsavelScreen.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// Header
import Appheader from "../../components/Appheader";

// Firebase
import { db, storage } from "../../services/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ❤️ marrom unificado
const BROWN = "#3A1F0F";

/* ---------------- helpers ---------------- */
const onlyDigits = (v = "") => String(v).replace(/\D/g, "");
const formatCpf = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length !== 11) return v;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

async function findUsuarioDocByCpf(cpfInput) {
  const digits = onlyDigits(cpfInput || "");
  const formatted = formatCpf(digits);

  // tenta por cpf formatado
  if (formatted) {
    const s1 = await getDocs(query(collection(db, "usuarios"), where("cpf", "==", formatted), where("cpf", "==", formatted)));
    if (!s1.empty) return s1.docs[0];
  }
  // tenta por cpf_digits
  if (digits) {
    const s2 = await getDocs(query(collection(db, "usuarios"), where("cpf_digits", "==", digits)));
    if (!s2.empty) return s2.docs[0];
  }
  return null;
}

async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão", "Precisamos de acesso à galeria para continuar.");
    return null;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (res.canceled) return null;
  return res.assets?.[0]?.uri || null;
}

async function uploadToStorage(localUri, path) {
  if (!localUri) return null;
  const resp = await fetch(localUri);
  const blob = await resp.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

export default function PerfilResponsavelScreen() {
  const scrollRef = useRef(null);

  const [responsavel, setResponsavel] = useState({
    nome: "—",
    sexo: "—", // opcional (não está no schema do backend, mas Firestore aceita)
    nascimento: "—", // mapeia para data_nascimento em usuarios
    parentesco: "—", // opcional
    foto: "https://i.pravatar.cc/150?img=12",
    telefone: "—",
    email: "—",
  });

  const [cpf, setCpf] = useState(null);           // cpf da sessão (responsável)
  const [usuarioId, setUsuarioId] = useState(null); // id do doc em "usuarios"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // imagem local escolhida (preview antes do upload)
  const [fotoLocalUri, setFotoLocalUri] = useState(null);

  const loadFromDB = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem("session");
      const session = raw ? JSON.parse(raw) : null;
      const cpfSess = session?.cpf;
      if (!cpfSess) {
        Alert.alert("Sessão inválida", "Entre novamente para carregar seus dados.");
        return;
      }
      setCpf(cpfSess);

      // 1) acha o usuário pelo CPF (usuarios)
      const usuarioDoc = await findUsuarioDocByCpf(cpfSess);
      if (!usuarioDoc) {
        Alert.alert("Atenção", "Responsável não encontrado.");
        return;
      }
      setUsuarioId(usuarioDoc.id);

      const u = usuarioDoc.data() || {};
      setResponsavel({
        nome: u?.nome || "—",
        sexo: u?.sexo || "—", // pode nem existir; deixamos opcional
        nascimento: u?.data_nascimento || "—",
        parentesco: u?.parentesco || "—", // opcional
        foto: u?.fotoUrl || "https://i.pravatar.cc/150?img=12",
        telefone: u?.telefone || "—",
        email: u?.email || "—",
      });

      setIsChanged(false);
      setFotoLocalUri(null);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível carregar os dados do responsável.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const handleChange = (key, value) => {
    setResponsavel((prev) => ({ ...prev, [key]: value }));
    setIsChanged(true);
  };

  // Troca de foto: faz upload e salva no Firestore IMEDIATAMENTE em usuarios/<usuarioId>
  const handlePickPhoto = async () => {
    try {
      if (!usuarioId) {
        Alert.alert("Sessão inválida", "Entre novamente para continuar.");
        return;
      }
      const uri = await pickImage();
      if (!uri) return;

      // preview instantâneo
      setFotoLocalUri(uri);

      // sobe pro Storage e salva
      const newFotoUrl = await uploadToStorage(
        uri,
        `usuarios/${usuarioId}/perfil.jpg`
      );

      await setDoc(
        doc(db, "usuarios", usuarioId),
        {
          fotoUrl: newFotoUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // reflete na UI
      setResponsavel((prev) => ({ ...prev, foto: newFotoUrl }));
      setFotoLocalUri(null); // já temos a URL definitiva
      setModalVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível atualizar a foto.");
    }
  };

  const handleSave = async () => {
    if (!usuarioId) return;
    try {
      setSaving(true);

      // normaliza "—"
      const normalize = (v) => (v === "—" ? "" : v || "");
      const payload = {
        nome: normalize(responsavel.nome),
        // esses 2 abaixo não estão no schema do model do backend,
        // mas tudo bem manter no Firestore pelo app (chaves opcionais):
        sexo: normalize(responsavel.sexo),
        parentesco: normalize(responsavel.parentesco),

        data_nascimento: normalize(responsavel.nascimento),
        telefone: normalize(responsavel.telefone),
        email: normalize(responsavel.email),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "usuarios", usuarioId), payload, { merge: true });

      setIsChanged(false);
      setModalVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !usuarioId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Appheader styles={appHeaderStyles} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
        <Text style={styles.subtitulo}>Visualize e edite suas informações pessoais</Text>

        {/* Card de Perfil */}
        <View style={styles.cardPerfil}>
          <Image
            source={{ uri: fotoLocalUri || responsavel.foto }}
            style={styles.foto}
          />
          <TouchableOpacity style={styles.btnTrocar} onPress={handlePickPhoto}>
            <Text style={styles.btnTrocarText}>Trocar foto de perfil</Text>
          </TouchableOpacity>

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
            placeholder="Feminino, Masculino, Outro..."
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            value={responsavel.nascimento}
            onChangeText={(text) => handleChange("nascimento", text)}
            keyboardType="number-pad"
            returnKeyType="next"
            placeholder="AAAA-MM-DD"
          />

          <Text style={styles.label}>Parentesco com a Pessoa Idosa</Text>
          <TextInput
            style={styles.input}
            value={responsavel.parentesco}
            onChangeText={(text) => handleChange("parentesco", text)}
            returnKeyType="next"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={responsavel.telefone}
            onChangeText={(text) => handleChange("telefone", text)}
            keyboardType="phone-pad"
            returnKeyType="next"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={responsavel.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            returnKeyType="done"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.botao, (!isChanged || saving) && styles.botaoDesabilitado]}
            disabled={!isChanged || saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Salvar Perfil</Text>
            )}
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
  safeArea: { flex: 1, backgroundColor: "#FFF6ED" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#3B2C1A", textAlign: "center" },
  subtitulo: { color: "#7A6A59", textAlign: "center", marginBottom: 16 },
  cardPerfil: {
    backgroundColor: "#fff", borderRadius: 20, alignItems: "center", padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  foto: { width: 110, height: 110, borderRadius: 55, marginBottom: 10, borderWidth: 3, borderColor: "#E7DAC8" },
  btnTrocar: { backgroundColor: BROWN, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 8 },
  btnTrocarText: { color: "#fff", fontWeight: "bold" },
  nome: { fontSize: 20, fontWeight: "bold", color: "#3B2C1A" },
  info: { color: "#7A6A59", marginBottom: 12 },
  cardInfo: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#4B2E0F" },
  tracinho: { height: 2, backgroundColor: "#4B2E0F", marginTop: 4, marginBottom: 10, borderRadius: 2 },
  label: { color: "#4B2E0F", fontWeight: "600", marginTop: 10, marginBottom: 5 },
  input: {
    backgroundColor: "#fff", borderWidth: 1.3, borderColor: "#C7A98D", borderRadius: 10, padding: 10, color: "#4B2E0F", fontSize: 14,
  },
  botao: {
    backgroundColor: BROWN, borderRadius: 10, paddingVertical: 12, marginTop: 20, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 3,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  popup: {
    backgroundColor: "#fff", width: "80%", borderRadius: 16, paddingVertical: 25, paddingHorizontal: 20,
    alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  popupTitulo: { fontSize: 18, fontWeight: "bold", color: "#4B2E0F", marginBottom: 10, textAlign: "center" },
  popupTexto: { fontSize: 14, color: "#7A6A59", textAlign: "center", marginBottom: 20 },
  popupBotao: { backgroundColor: BROWN, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 25 },
  popupBotaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

/* Appheader */
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
