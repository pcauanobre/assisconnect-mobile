// client/screens/Perfil/PerfilPessoaIdosaScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// UI
import Appheader from "../../components/Appheader";
import PersonalInfoForm from "../../components/PersonalInfoForm";
import idosoImg from "../../assets/idoso.jpeg";
import styles from "../../styles/perfilIdosoStyles";

// Firebase
import { db, storage } from "../../services/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const todayISO = () => new Date().toISOString().slice(0, 10);

// === helpers ===
const sanitize = (v) => {
  if (Array.isArray(v)) return v.map(sanitize).filter((x) => x !== undefined);
  if (v && typeof v === "object") {
    const o = {};
    Object.keys(v).forEach((k) => {
      const sv = sanitize(v[k]);
      if (sv !== undefined) o[k] = sv;
    });
    return o;
  }
  return v === undefined ? undefined : v;
};

async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão", "Precisamos de acesso à galeria para continuar.");
    return null;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (res.canceled) return null;
  return res.assets?.[0]?.uri || null;
}

async function uploadToStorage(localUri, pathInBucket) {
  if (!localUri) return null;
  const resp = await fetch(localUri);
  const blob = await resp.blob();
  const r = ref(storage, pathInBucket);
  await uploadBytes(r, blob);
  return await getDownloadURL(r);
}

export default function PerfilPessoaIdosaScreen() {
  const [activeTab, setActiveTab] = useState("contatos");
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);

  const [cpf, setCpf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // dados carregados do DB
  const [userData, setUserData] = useState(null);

  // modal único de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [edit, setEdit] = useState({
    nome: "",
    genero: "",
    dataNascimento: "",
    telefone: "",
    endereco: { cep: "", cidade: "", estado: "", rua: "" },
  });
  // imagens locais escolhidas no modal
  const [fotoPerfilLocal, setFotoPerfilLocal] = useState(null);
  const [rgLocal, setRgLocal] = useState(null);
  const [vacinaLocal, setVacinaLocal] = useState(null);
  const [susLocal, setSusLocal] = useState(null);

  // carrega do DB
  const loadFromDB = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem("session");
      const session = raw ? JSON.parse(raw) : null;
      const cpfSess = session?.cpf;
      if (!cpfSess) {
        Alert.alert("Sessão inválida", "Entre novamente.");
        return;
      }
      setCpf(cpfSess);

      const pessoaRef = doc(db, "pessoaIdosa", String(cpfSess));
      const pessoaSnap = await getDoc(pessoaRef);
      if (!pessoaSnap.exists()) {
        Alert.alert("Atenção", "Cadastro não encontrado.");
        return;
      }
      const p = pessoaSnap.data() || {};

      const mapped = {
        id: cpfSess,
        name: p?.nome || "—",
        sex: p?.genero || "—",
        birthDate: p?.dataNascimento || "—",
        cpf: cpfSess,
        phone: p?.contato?.telefone || "—",
        photoUrl: p?.fotoUrl || null,
        docs: {
          rgUrl: p?.documentos?.rgUrl || null,
          vacinaUrl: p?.documentos?.vacinaUrl || null,
          susUrl: p?.documentos?.susUrl || null,
        },
        address: {
          cep: p?.endereco?.cep || "—",
          cidade: p?.endereco?.cidade || "—",
          estado: p?.endereco?.estado || "—",
          rua: p?.endereco?.rua || "—",
        },
      };

      setUserData(mapped);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // dados dos documentos para a lista
  const documentsData = useMemo(
    () => [
      { id: "rg", name: "RG", description: "Registro Geral (imagem)", icon: "id-card", url: userData?.docs?.rgUrl || null },
      { id: "vacina", name: "Carteira de Vacinação", description: "Histórico (imagem)", icon: "syringe", url: userData?.docs?.vacinaUrl || null },
      { id: "sus", name: "Cartão do SUS", description: "Número (imagem)", icon: "medkit", url: userData?.docs?.susUrl || null },
    ],
    [userData]
  );

  // abre modal único preenchendo com o que veio do DB
  const openEditModal = useCallback(() => {
    if (!userData) return;
    setEdit({
      nome: userData.name === "—" ? "" : userData.name,
      genero: userData.sex === "—" ? "" : userData.sex,
      dataNascimento: userData.birthDate === "—" ? "" : userData.birthDate,
      telefone: userData.phone === "—" ? "" : userData.phone,
      endereco: {
        cep: userData.address?.cep === "—" ? "" : userData.address?.cep || "",
        cidade: userData.address?.cidade === "—" ? "" : userData.address?.cidade || "",
        estado: userData.address?.estado === "—" ? "" : userData.address?.estado || "",
        rua: userData.address?.rua === "—" ? "" : userData.address?.rua || "",
      },
    });
    // limpa seleções locais (pra saber se usuário trocou imagem)
    setFotoPerfilLocal(null);
    setRgLocal(null);
    setVacinaLocal(null);
    setSusLocal(null);
    setEditModalVisible(true);
  }, [userData]);

  // salvar: faz upload só do que tiver URI local, e setDoc merge dos campos
  const handleSaveAll = useCallback(async () => {
    if (!cpf) return;
    try {
      setSaving(true);
      const pessoaRef = doc(db, "pessoaIdosa", cpf);

      // 1) uploads condicionais
      let newFotoUrl = null;
      let newRgUrl = null;
      let newVacinaUrl = null;
      let newSusUrl = null;

      if (fotoPerfilLocal) newFotoUrl = await uploadToStorage(fotoPerfilLocal, `pessoaIdosa/${cpf}/perfil.jpg`);
      if (rgLocal) newRgUrl = await uploadToStorage(rgLocal, `pessoaIdosa/${cpf}/docs/rg.jpg`);
      if (vacinaLocal) newVacinaUrl = await uploadToStorage(vacinaLocal, `pessoaIdosa/${cpf}/docs/vacina.jpg`);
      if (susLocal) newSusUrl = await uploadToStorage(susLocal, `pessoaIdosa/${cpf}/docs/sus.jpg`);

      // 2) payload de merge
      const payload = sanitize({
        nome: (edit.nome || "").trim(),
        genero: (edit.genero || "").trim(),
        dataNascimento: (edit.dataNascimento || "").trim(),
        contato: { telefone: (edit.telefone || "").trim() },
        endereco: {
          cep: (edit.endereco?.cep || "").trim(),
          cidade: (edit.endereco?.cidade || "").trim(),
          estado: (edit.endereco?.estado || "").trim(),
          rua: (edit.endereco?.rua || "").trim(),
        },
        updatedAt: serverTimestamp(),
      });

      // 3) aplica URLs novas (se houver)
      if (newFotoUrl) payload.fotoUrl = newFotoUrl;
      if (newRgUrl || newVacinaUrl || newSusUrl) {
        payload.documentos = {
          ...(newRgUrl ? { rgUrl: newRgUrl } : {}),
          ...(newVacinaUrl ? { vacinaUrl: newVacinaUrl } : {}),
          ...(newSusUrl ? { susUrl: newSusUrl } : {}),
        };
      }

      await setDoc(pessoaRef, payload, { merge: true });

      // 4) reflete na UI
      setUserData((u) => ({
        ...(u || {}),
        name: payload.nome ?? u?.name,
        sex: payload.genero ?? u?.sex,
        birthDate: payload.dataNascimento ?? u?.birthDate,
        phone: payload?.contato?.telefone ?? u?.phone,
        photoUrl: newFotoUrl ?? u?.photoUrl,
        address: {
          cep: payload.endereco?.cep ?? u?.address?.cep,
          cidade: payload.endereco?.cidade ?? u?.address?.cidade,
          estado: payload.endereco?.estado ?? u?.address?.estado,
          rua: payload.endereco?.rua ?? u?.address?.rua,
        },
        docs: {
          rgUrl: newRgUrl ?? u?.docs?.rgUrl,
          vacinaUrl: newVacinaUrl ?? u?.docs?.vacinaUrl,
          susUrl: newSusUrl ?? u?.docs?.susUrl,
        },
      }));

      setEditModalVisible(false);
      Alert.alert("Pronto!", "Alterações salvas com sucesso.");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }, [cpf, edit, fotoPerfilLocal, rgLocal, vacinaLocal, susLocal]);

  if (loading && !userData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF6ED" }} edges={["top", "left", "right"]}>
        <Appheader styles={styles} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF6ED" }} edges={["top", "left", "right"]}>
      <Appheader styles={styles} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pessoa Idosa</Text>
          <Text style={styles.headerSubtitle}>Visualize e edite informações e documentos</Text>
        </View>

        {/* CARD: perfil (visualização) */}
        <View style={shadowCard.card}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={userData?.photoUrl ? { uri: userData.photoUrl } : idosoImg}
              style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 10 }}
            />
            <Text style={{ color: "#7A6A59" }}>{userData?.name || "—"}</Text>
          </View>
        </View>

        {/* CARD: informações pessoais (read-only) */}
        <View style={shadowCard.card}>
          <PersonalInfoForm
            userData={{
              name: userData?.name || "—",
              sex: userData?.sex || "—",
              phone: userData?.phone || "—",
              birthDate: userData?.birthDate || "—",
            }}
          />
        </View>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "documentos" && styles.tabButtonActive]}
            onPress={() => setActiveTab("documentos")}
          >
            <FontAwesome name="folder-open" size={14} color={activeTab === "documentos" ? "#fff" : "#3E2723"} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === "documentos" && styles.tabButtonTextActive]}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "contatos" && styles.tabButtonActive]}
            onPress={() => setActiveTab("contatos")}
          >
            <FontAwesome name="phone" size={14} color={activeTab === "contatos" ? "#fff" : "#3E2723"} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === "contatos" && styles.tabButtonTextActive]}>Contatos</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "contatos" && (
          <View style={shadowCard.card}>
            <Text style={styles.label}>Telefone da Pessoa Idosa</Text>
            <TextInput style={styles.personalInfoInput} value={userData?.phone || "—"} editable={false} />
          </View>
        )}

        {activeTab === "documentos" && (
          <View style={shadowCard.card}>
            <FlatList
              data={documentsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={docRow.row}>
                  <FontAwesome5 name={item.icon} size={22} color="#4B2E0F" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: "bold", color: "#4B2E0F" }}>{item.name}</Text>
                    <Text style={{ color: "#3E2723", fontSize: 12 }}>{item.description}</Text>
                    {item.url ? (
                      <TouchableOpacity onPress={() => { setCurrentPreviewUrl(item.url); setDocumentModalVisible(true); }}>
                        <Text style={{ color: "#6D4C41", marginTop: 4 }}>Ver atual</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ color: "#A38D78", marginTop: 4 }}>Sem arquivo ainda</Text>
                    )}
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled
            />
          </View>
        )}

        {/* BOTÃO ÚNICO: abre modal completão */}
        <View style={shadowCard.card}>
          <View style={{ height: 1, backgroundColor: "#CBBBA0", marginBottom: 12 }} />
          <Text style={{ color: "#7A6A59", textAlign: "center", marginBottom: 10 }}>
            Achou algo desatualizado? Edite abaixo.
          </Text>
          <TouchableOpacity style={primaryBtn.centered} onPress={openEditModal}>
            <Text style={primaryBtn.text}>Editar / Solicitar Alteração</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Preview do documento */}
      <Modal visible={documentModalVisible} transparent animationType="fade" onRequestClose={() => setDocumentModalVisible(false)}>
        <View style={overlayStyles.overlay}>
          <View style={previewStyles.card}>
            {currentPreviewUrl ? (
              <Image source={{ uri: currentPreviewUrl }} style={previewStyles.media} resizeMode="contain" />
            ) : null}
            <TouchableOpacity style={primaryBtn.centered} onPress={() => setDocumentModalVisible(false)}>
              <Text style={primaryBtn.text}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ÚNICO DE EDIÇÃO: dados + imagens */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={overlayStyles.overlay}>
          <View style={editModalStyles.card}>
            <Text style={editModalStyles.title}>Editar dados e documentos</Text>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {/* Fotos centralizadas */}
              <Text style={editModalStyles.section}>Fotos</Text>

              <CenterPickPreview
                label="Foto de Perfil"
                currentUri={userData?.photoUrl}
                pickedUri={fotoPerfilLocal}
                onPick={async () => setFotoPerfilLocal(await pickImage())}
              />

              <CenterPickPreview
                label="RG (imagem)"
                currentUri={userData?.docs?.rgUrl}
                pickedUri={rgLocal}
                onPick={async () => setRgLocal(await pickImage())}
              />

              <CenterPickPreview
                label="Carteira de Vacinação (imagem)"
                currentUri={userData?.docs?.vacinaUrl}
                pickedUri={vacinaLocal}
                onPick={async () => setVacinaLocal(await pickImage())}
              />

              <CenterPickPreview
                label="Cartão do SUS (imagem)"
                currentUri={userData?.docs?.susUrl}
                pickedUri={susLocal}
                onPick={async () => setSusLocal(await pickImage())}
              />

              {/* Campos de texto */}
              <Text style={editModalStyles.section}>Dados</Text>

              <Field label="Nome" value={edit.nome} onChange={(t) => setEdit((p) => ({ ...p, nome: t }))} />
              <Field label="Gênero" value={edit.genero} onChange={(t) => setEdit((p) => ({ ...p, genero: t }))} />
              <Field label="Data de Nascimento" value={edit.dataNascimento} onChange={(t) => setEdit((p) => ({ ...p, dataNascimento: t }))} />
              <Field label="Telefone" value={edit.telefone} onChange={(t) => setEdit((p) => ({ ...p, telefone: t }))} kb="phone-pad" />

              <Text style={editModalStyles.section}>Endereço</Text>
              <Field label="CEP" value={edit.endereco.cep} onChange={(t) => setEdit((p) => ({ ...p, endereco: { ...p.endereco, cep: t } }))} kb="number-pad" />
              <Field label="Cidade" value={edit.endereco.cidade} onChange={(t) => setEdit((p) => ({ ...p, endereco: { ...p.endereco, cidade: t } }))} />
              <Field label="Estado" value={edit.endereco.estado} onChange={(t) => setEdit((p) => ({ ...p, endereco: { ...p.endereco, estado: t } }))} />
              <Field label="Rua e número" value={edit.endereco.rua} onChange={(t) => setEdit((p) => ({ ...p, endereco: { ...p.endereco, rua: t } }))} />
            </ScrollView>

            <View style={editModalStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setEditModalVisible(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[primaryBtn.centered, { paddingHorizontal: 18, minWidth: 130 }]} onPress={handleSaveAll} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={primaryBtn.text}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ------- components auxiliares (do próprio arquivo) ------- */
function Field({ label, value, onChange, kb = "default" }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={editModalStyles.label}>{label}</Text>
      <TextInput style={editModalStyles.input} value={value} onChangeText={onChange} keyboardType={kb} />
    </View>
  );
}

function CenterPickPreview({ label, currentUri, pickedUri, onPick }) {
  const shown = pickedUri || currentUri || null;
  return (
    <View style={pickerStyles.wrap}>
      <Text style={pickerStyles.label}>{label}</Text>
      {shown ? (
        <Image source={{ uri: shown }} style={pickerStyles.img} />
      ) : (
        <View style={pickerStyles.placeholder} />
      )}
      <TouchableOpacity style={pickerStyles.btn} onPress={onPick}>
        <Text style={pickerStyles.btnText}>Escolher imagem</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---- estilos locais ---- */
const shadowCard = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});

const docRow = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 2, borderRadius: 8 },
});

const overlayStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
});

const previewStyles = StyleSheet.create({
  card: { backgroundColor: "#fff", width: "92%", borderRadius: 16, padding: 14, alignItems: "center" },
  media: { width: "100%", height: 420, borderRadius: 10, marginBottom: 10 },
});

const primaryBtn = StyleSheet.create({
  centered: { backgroundColor: "#4b2e1e", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", alignSelf: "center", flexDirection: "row" },
  text: { color: "#fff", fontWeight: "bold" },
});

const outlinedBtnSmall = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: "#4b2e1e",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: { color: "#4b2e1e", fontWeight: "bold" },
});

const editModalStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    width: "92%",
    borderRadius: 16,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#4B2E0F", textAlign: "center", marginBottom: 10 },
  section: { color: "#7A6A59", fontWeight: "700", marginTop: 6, marginBottom: 8 },
  label: { color: "#4B2E0F", fontWeight: "600", marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.3,
    borderColor: "#C7A98D",
    borderRadius: 10,
    padding: 10,
    color: "#4B2E0F",
    fontSize: 14,
  },
  actions: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", gap: 10 },
});

const pickerStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  label: { color: "#4B2E0F", fontWeight: "600" },
  img: { width: 128, height: 128, borderRadius: 16, alignSelf: "center", backgroundColor: "#eee" },
  placeholder: { width: 128, height: 128, borderRadius: 16, alignSelf: "center", backgroundColor: "#eee" },
  btn: { backgroundColor: "#6D4C41", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { color: "#fff", fontWeight: "bold" },
});
