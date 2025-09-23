// client/screens/Login/LoginCPFScreen.js
import React, { useRef, useState } from "react";
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
import { sanitizeCpfRg } from "../../utils/validators";
import CustomPopup from "../../components/CustomPopup";

// API (backend)
import { startLogin } from "../../src/services/api";

// Firebase (Web)
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utils/firebaseClient";
import { setPhoneConfirmation } from "../../utils/phoneAuthSession";

export default function LoginCPFScreen({ navigation }) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: "" });
  const recaptchaCreatedRef = useRef(false);

  // Cria (uma vez) o reCAPTCHA invisível exigido pelo Phone Auth (Web)
  const ensureRecaptcha = () => {
    if (typeof window === "undefined") return;
    if (recaptchaCreatedRef.current) return;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    recaptchaCreatedRef.current = true;
  };

  const handleNext = async () => {
    try {
      setLoading(true);

      // 1) pergunta para o backend se o CPF existe e qual telefone usar
      const data = await startLogin(cpf);

      if (!data?.success || !data?.telefone) {
        setPopup({
          visible: true,
          message: data?.error || "❌ Não foi possível enviar o código.",
        });
        return;
      }

      // 2) dispara o SMS REAL (ou aceita número de teste) via Firebase Web
      ensureRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        data.telefone,
        window.recaptchaVerifier
      );

      // guarda o confirmationResult para a tela seguinte
      setPhoneConfirmation(confirmation);

      // 3) feedback + navegação
      const msg =
        `📲 Enviamos um SMS para ${data.telefone}.\n` +
        `Se for número de TESTE cadastrado no Firebase, insira o código fixo.`;
      setPopup({ visible: true, message: msg });

      setTimeout(() => {
        setPopup({ visible: false, message: "" });
        navigation.navigate("LoginSms", { cpf, telefone: data.telefone });
      }, 1200);
    } catch (err) {
      console.error(err);
      setPopup({
        visible: true,
        message:
          "⚠️ Não foi possível iniciar o login por telefone. Verifique reCAPTCHA e domínios autorizados.",
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

        <Text style={styles.title}>Bem vindo ao Assisconnect!</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>

        <View style={{ height: 18 }} />

        <Text style={styles.fieldLabel}>CPF/RG</Text>
        <TextInput
          value={cpf}
          onChangeText={(t) => setCpf(sanitizeCpfRg(t))}
          placeholder="Digite o CPF ou RG da pessoa idosa"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { opacity: cpf.length >= 5 && !loading ? 1 : 0.6 },
          ]}
          disabled={cpf.length < 5 || loading}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {loading ? "Enviando..." : "Próximo"}
          </Text>
        </TouchableOpacity>

        <CustomPopup
          visible={popup.visible}
          message={popup.message}
          onClose={() => setPopup({ visible: false, message: "" })}
        />

        {/* container exigido para o reCAPTCHA do Firebase Web */}
        <View id="recaptcha-container" />
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
