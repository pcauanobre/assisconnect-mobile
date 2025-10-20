import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function UpdateProfileModal({ visible, onClose, onSave, userData }) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visible && userData) {
      setName(userData.name || "");
      setSex(userData.sex || "");
      setBirthDate(userData.birthDate || "");
      setMaritalStatus(userData.maritalStatus || "");
      setRg(userData.rg || "");
      setCpf(userData.cpf || "");
      setMessage("");
    }
  }, [userData, visible]);

  const handleSave = () => {
    const updatedData = { name, sex, birthDate, maritalStatus, rg, cpf };
    onSave(updatedData);
    setMessage("Alteração de dados solicitada!");
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Atualizar Dados</Text>
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Sexo</Text>
            <TextInput style={styles.input} value={sex} onChangeText={setSex} />
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} />
            <Text style={styles.label}>Estado Civil</Text>
            <TextInput style={styles.input} value={maritalStatus} onChangeText={setMaritalStatus} />
            <Text style={styles.label}>RG</Text>
            <TextInput style={styles.input} value={rg} onChangeText={setRg} />
            <Text style={styles.label}>CPF</Text>
            <TextInput style={styles.input} value={cpf} onChangeText={setCpf} />

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 15, padding: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#3A2C1F" },
  form: { marginBottom: 15 },
  label: { fontSize: 14, color: "#444", marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: "#F5F5F5", padding: 10, borderRadius: 8, color: "#333" },
  message: { color: "green", fontWeight: "bold", marginTop: 10, textAlign: "center", fontSize: 16 },
  buttonsContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  buttonCancel: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: "#AAA", marginRight: 10 },
  buttonSave: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: "#4B2C20" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
