import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const emailTrim = email.trim();
    const senhaTrim = senha.trim();

    if (!emailTrim || !senhaTrim) {
      Alert.alert('Atencao', 'Preencha email e senha.');
      return;
    }

    try {
      setLoading(true);
      await login(emailTrim, senhaTrim);
    } catch (err) {
      const msg = err?.response?.status === 401
        ? 'Email ou senha invalidos'
        : err?.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Entrar</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Criar conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    color: colors.textPrimary,
  },
  btn: {
    marginTop: 16,
    backgroundColor: colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  link: {
    marginTop: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
