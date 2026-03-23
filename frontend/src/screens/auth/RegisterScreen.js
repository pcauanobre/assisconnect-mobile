import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { register } from '../../services/authService';
import colors from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tokenAdmin, setTokenAdmin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!usuario.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atencao', 'Preencha todos os campos obrigatorios.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atencao', 'As senhas nao conferem.');
      return;
    }

    try {
      setLoading(true);
      const isAdmin = tokenAdmin.trim() === '12345';
      await register(usuario.trim(), senha.trim(), email.trim(), isAdmin);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err?.response?.status === 409
        ? 'Usuario ja existe'
        : err?.response?.data?.message || 'Erro ao criar conta';
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
          <Text style={styles.title}>Criar Conta</Text>

          <Text style={styles.label}>Usuario</Text>
          <TextInput
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Nome de usuario"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Seu email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Crie uma senha"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Confirmar Senha</Text>
          <TextInput
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repita a senha"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Token Admin (opcional)</Text>
          <TextInput
            value={tokenAdmin}
            onChangeText={setTokenAdmin}
            placeholder="Token de administrador"
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Cadastrar</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Ja tenho conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 18,
  },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: colors.surface,
    borderRadius: 16, padding: 18, borderWidth: 2, borderColor: colors.primaryDark,
  },
  title: {
    fontSize: 22, fontWeight: '800', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border,
    fontSize: 14, color: colors.textPrimary,
  },
  btn: {
    marginTop: 16, backgroundColor: colors.primaryDark,
    paddingVertical: 16, borderRadius: 10, alignItems: 'center',
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  link: {
    marginTop: 12, color: colors.textSecondary, textAlign: 'center',
    fontSize: 14, textDecorationLine: 'underline',
  },
});
