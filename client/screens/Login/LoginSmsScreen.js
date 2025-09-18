// client/screens/Login/LoginSmsScreen.js
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import colors from "../../styles/colors.js";
import Logo from "../../components/Logo";
import { sanitizeCode } from "../../utils/validators";
import CustomPopup from "../../components/CustomPopup";
import { verifyCode } from "../../src/services/api";

import { getPhoneConfirmation, clearPhoneConfirmation } from "../../utils/phoneAuthSession";

export default function LoginSmsScreen({ navigation, route }) {
  const { cpf, telefone } = route.params || {};
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: "" });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setConfirmation(getPhoneConfirmation());
  }, []);

  const handleVerify = async () => {
    try {
      setLoading(true);

      // 🔹 mock para testes locais
      if (code === "123456") {
        const resp = await verifyCode(cpf, code);
        if (resp?.success) {
          setPopup({ visible: true, message: "✅ Código mock validado!" });
          setTimeout(() => {
            setPopup({ visible: false, message: "" });
            clearPhoneConfirmation();
            navigation.replace("Home");
          }, 1200);
          return;
        } else {
          setPopup({ visible: true, message: resp?.error || "Código inválido" });
          return;
        }
      }

      // 🔹 validação real via Firebase (se houve envio por PhoneAuth)
      if (!confirmation) {
        setPopup({
          visible: true,
          message:
            "⚠️ Nenhum código foi enviado via Firebase. Volte e tente novamente.",
        });
        return;
      }

      await confirmation.confirm(code);

      setPopup({ visible: true, message: "✅ Código validado no Firebase!" });
      setTimeout(() => {
        setPopup({ visible: false, message: "" });
        clearPhoneConfirmation();
        navigation.replace("Home");
      }, 1200);
    } catch (err) {
      console.error("Erro na verificação:", err);
      setPopup({ visible: true, message: "❌ Código inválido" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Logo size={100} />
        <Text style={styles.title}>Confirme seu código SMS</Text>
        {!!telefone && (
          <Text style={styles.subtitle}>Enviado para: {telefone}</Text>
        )}

        <View style={{ height: 18 }} />

        <Text style={styles.fieldLabel}>Código</Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(sanitizeCode(t))}
          placeholder="Digite o Código…"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={6}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { opacity: code.length === 6 && !loading ? 1 : 0.6 },
          ]}
          disabled={code.length !== 6 || loading}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verificando..." : "Entrar"}
          </Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 12, color: colors.muted },
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
