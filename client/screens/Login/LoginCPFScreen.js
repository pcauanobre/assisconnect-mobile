// client/screens/Login/LoginCPFScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../styles/colors.js";
import Logo from "../../components/Logo";
import { sanitizeCpfRg } from "../../utils/validators";
import CustomPopup from "../../components/CustomPopup";
import { startLogin } from "../../src/services/api";

export default function LoginCPFScreen({ navigation }) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: "" });

  const handleNext = async () => {
    try {
      setLoading(true);
      const data = await startLogin(cpf);

      if (!data?.success) {
        const raw = (data?.error || "").toLowerCase();
        const msg = raw.includes("não cadastrada")
          ? "Pessoa idosa não encontrada."
          : data?.error || "Não foi possível enviar o código por e-mail.";
        setPopup({ visible: true, message: msg });
        return;
      }

      // Encontrou → vai imediatamente para a tela de código (aguarda e-mail lá)
      navigation.navigate("LoginEmail", {
        cpf,
        email: data.email || null, // e-mail completo
      });
    } catch {
      setPopup({
        visible: true,
        message: "Erro ao iniciar envio do código por e-mail.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Logo size={130} />

        <Text style={styles.title}>AssisConnect</Text>
        <Text style={styles.subtitle}>
          Informe o CPF/RG para enviarmos um código de verificação por e-mail.
        </Text>

        <View style={{ height: 18 }} />

        <Text style={styles.fieldLabel}>CPF/RG</Text>
        <TextInput
          value={cpf}
          onChangeText={(t) => setCpf(sanitizeCpfRg(t))}
          placeholder="Digite o CPF da pessoa idosa"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, { opacity: cpf.length >= 5 && !loading ? 1 : 0.6 }]}
          disabled={cpf.length < 5 || loading}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>{loading ? "Enviando..." : "Próximo"}</Text>
        </TouchableOpacity>

        <CustomPopup
          visible={popup.visible}
          message={popup.message}
          onClose={() => setPopup({ visible: false, message: "" })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  fieldLabel: {
    alignSelf: "flex-start",
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
    marginTop: 18,
  },
  input: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700" },
});
