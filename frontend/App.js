import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { API_BASE } from "./src/api";

function log(tag, data) {
  console.log(`[LOGIN][${tag}]`, data ?? "");
}

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [logado, setLogado] = useState(false);
  const [userData, setUserData] = useState(null);

  async function handleLogin() {
    const emailTrim = email.trim();
    const senhaTrim = senha.trim();

    if (!emailTrim || !senhaTrim) {
      Alert.alert("Atenção", "Preenche email e senha.");
      return;
    }

    const url = `${API_BASE}/auth/login`;
    const payload = { email: emailTrim, senha: senhaTrim };

    try {
      setLoading(true);
      log("REQUEST_START", { url, payload });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      log("RESPONSE_META", { status: res.status, ok: res.ok, contentType });

      const bodyText = await res.text();
      log("RESPONSE_BODY", bodyText);

      if (!res.ok) {
        if (res.status === 401) throw new Error("Email ou senha inválidos");
        throw new Error(`Falha no login (HTTP ${res.status})`);
      }

      const data = contentType.includes("application/json")
        ? JSON.parse(bodyText)
        : { raw: bodyText };

      log("LOGIN_SUCCESS", data);

      setUserData(data);
      setLogado(true);
    } catch (err) {
      log("LOGIN_ERROR", err?.message || err);
      Alert.alert("Login", err?.message || "Erro inesperado");
    } finally {
      setLoading(false);
      log("REQUEST_END");
    }
  }

  /* =========================
     HOME
     ========================= */
  if (logado) {
    return (
      <View style={styles.home}>
        <Text style={styles.homeTitle}>HOME</Text>

        <Text style={styles.homeSub}>
          Logado como: {userData?.nome || userData?.email || "ok"}
        </Text>

        <Pressable
          style={[styles.btn, styles.btnWide, { marginTop: 24 }]}
          onPress={() => {
            setLogado(false);
            setUserData(null);
            setEmail("");
            setSenha("");
          }}
        >
          <Text style={styles.btnText}>Sair</Text>
        </Pressable>
      </View>
    );
  }

  /* =========================
     LOGIN
     ========================= */
  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Acesse sua conta</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          placeholder="Digite sua senha"
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Entrar</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          API: {API_BASE} {Platform.OS === "web" ? "(web)" : "(mobile)"}
        </Text>
      </View>
    </View>
  );
}

/* =========================
   STYLES
   ========================= */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#4b2a14",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#f2eeec",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#2c1a0f",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2c1a0f",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c1a0f",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d3c7c1",
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#2c1a0f",
    paddingVertical: 16, // mais alto
    borderRadius: 10,
    alignItems: "center",
  },
  btnWide: {
    width: "90%",      // <<< AUMENTA PRA LATERAL
    maxWidth: 420,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b5a52",
    textAlign: "center",
  },
  home: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: "900",
  },
  homeSub: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
});
