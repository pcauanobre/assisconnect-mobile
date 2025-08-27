import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo-assisconnect.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Bem vindo ao Assisconnect!</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Usuário"
              placeholderTextColor="#B1B1B1"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#B1B1B1"
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.eye}>{showPassword ? "👁️" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, styles.shadowStrong]}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Não tem uma conta? <Text style={styles.footerLink}>Registre-se!</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#F6EBDD",        
  text: "#2B2B2B",
  sub: "#7B7B7B",
  white: "#FFFFFF",
  brown: "#4B2A17",     
  shadow: "#000",
  fieldBorder: "#ECE6DA",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 30,
    alignItems: "center",
  },

  logoContainer: { marginTop: 120, marginBottom: 16, alignItems: "center" },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    borderRadius: 60,
  },

  textContainer: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.sub,
  },

  form: {
    width: "100%",
    gap: 14,
    marginBottom: 10,
  },
  inputWrap: {
    position: "relative",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.fieldBorder,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    paddingRight: 40,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    width: 28,
  },
  eye: { fontSize: 18 },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.brown,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  shadowStrong: {
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  forgot: {
    marginTop: 8,
    textAlign: "center",
    color: COLORS.text,
    fontWeight: "500",
  },

  footer: {
    marginTop: "auto",
    marginBottom: 80,
    color: COLORS.sub,
    textAlign: "center",
  },
  footerLink: { color: COLORS.brown, fontWeight: "700" },
});
