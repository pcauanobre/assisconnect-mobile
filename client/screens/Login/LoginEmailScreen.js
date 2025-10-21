import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../styles/colors.js";
import Logo from "../../components/Logo";
import { sanitizeCode } from "../../utils/validators";
import CustomPopup from "../../components/CustomPopup";
import { verifyCode, startLogin } from "../../src/services/api";

const COOLDOWN_MS = 3 * 60 * 1000; // 3min

function msToMMSS(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function LoginEmailScreen({ navigation, route }) {
  const { cpf, email } = route.params || {};
  const [code, setCode] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: "" });
  const [navOnClose, setNavOnClose] = useState(false);

  const [resendUsed, setResendUsed] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  const canResend = !resendUsed && !loadingResend;

  useEffect(() => {
    if (!cooldownEnd) return;
    intervalRef.current && clearInterval(intervalRef.current);
    setRemaining(Math.max(0, cooldownEnd - Date.now()));
    intervalRef.current = setInterval(() => {
      setRemaining(Math.max(0, cooldownEnd - Date.now()));
    }, 1000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [cooldownEnd]);

  const handleVerify = async () => {
    try {
      setLoadingVerify(true);
      const resp = await verifyCode(cpf, code);
      if (resp?.success) {
        // ✅ salva CPF na sessão para a Home saber qual documento carregar
        await AsyncStorage.setItem(
          "session",
          JSON.stringify({ loggedIn: true, timestamp: Date.now(), cpf })
        );
        setNavOnClose(true);
        setPopup({ visible: true, message: "Código validado com sucesso." });
        return;
      }
      setNavOnClose(false);
      setPopup({ visible: true, message: resp?.error || "Código inválido." });
    } catch {
      setNavOnClose(false);
      setPopup({ visible: true, message: "Erro ao verificar código." });
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoadingResend(true);
      const data = await startLogin(cpf);
      if (!data?.success) {
        setPopup({
          visible: true,
          message: data?.error || "Não foi possível reenviar o e-mail.",
        });
        return;
      }
      setResendUsed(true);
      const novoCooldown = Date.now() + COOLDOWN_MS;
      setCooldownEnd(novoCooldown);

      setPopup({
        visible: true,
        message: `Reenviamos o código para ${data.email || "o e-mail cadastrado"}.`,
      });
    } catch {
      setPopup({ visible: true, message: "Erro ao reenviar o e-mail." });
    } finally {
      setLoadingResend(false);
    }
  };

  const handleBack = () => {
    if (resendUsed && cooldownEnd && cooldownEnd > Date.now()) {
      navigation.navigate("LoginCPF", {
        cooldownForCpf: { cpf, until: cooldownEnd },
      });
      return;
    }
    navigation.goBack();
  };

  const headerMsg = useMemo(() => {
    const destino = email || "o e-mail cadastrado";
    return (
      `Enviamos um código de verificação para o e-mail: ${destino}.\n` +
      "Digite o código abaixo para continuar."
    );
  }, [email]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.backWrap}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <Logo size={90} />
          <Text style={styles.title}>Confirmação de Código</Text>
          <Text style={styles.subtitle}>{headerMsg}</Text>

          <View style={{ height: 18 }} />

          <Text style={styles.fieldLabel}>Código</Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(sanitizeCode(t))}
            placeholder="Digite o código de 6 dígitos"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={styles.input}
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.button, { opacity: code.length === 6 && !loadingVerify ? 1 : 0.6 }]}
            disabled={code.length !== 6 || loadingVerify}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>
              {loadingVerify ? "Verificando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 12 }} />

          <View style={styles.resendWrap}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              style={[styles.linkButton, !canResend && styles.linkButtonDisabled]}
            >
              <Text
                style={[styles.linkButtonText, !canResend && styles.linkButtonTextDisabled]}
              >
                {resendUsed ? "Reenvio realizado" : "Reenviar código por e-mail"}
              </Text>
            </TouchableOpacity>

            {resendUsed && (
              <Text style={styles.cooldownText}>
                {remaining > 0
                  ? `Aguarde ${msToMMSS(remaining)} para tentar novamente`
                  : "Tempo de espera encerrado"}
              </Text>
            )}
          </View>
        </View>

        <CustomPopup
          visible={popup.visible}
          message={popup.message}
          onClose={() => {
            setPopup({ visible: false, message: "" });
            if (navOnClose) {
              setNavOnClose(false);
              navigation.replace("Home");
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  backWrap: { position: "absolute", top: 28, left: 16 },
  backText: { color: colors.primary, fontWeight: "700", fontSize: 18 },
  center: { alignItems: "center", justifyContent: "center" },
  title: { textAlign: "center", fontSize: 20, fontWeight: "800", color: colors.primary, marginTop: 4 },
  subtitle: { marginTop: 8, textAlign: "center", fontSize: 12, color: colors.muted, lineHeight: 18 },
  fieldLabel: { alignSelf: "flex-start", color: colors.muted, fontSize: 12, marginBottom: 6, marginTop: 18 },
  input: { width: "100%", backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: colors.border },
  button: { width: "100%", backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, marginTop: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { color: colors.white, fontWeight: "700" },
  resendWrap: { alignItems: "center", justifyContent: "center", marginTop: 6 },
  linkButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  linkButtonDisabled: { opacity: 0.6 },
  linkButtonText: { color: colors.primary, fontWeight: "700" },
  linkButtonTextDisabled: { color: colors.muted },
  cooldownText: { marginTop: 4, fontSize: 12, color: colors.muted },
});
