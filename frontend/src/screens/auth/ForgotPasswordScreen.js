import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { resetarSenha } from '../../services/authService';
import colors from '../../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  function handleEnviarCodigo() {
    if (!email.trim()) {
      Alert.alert('Atencao', 'Informe seu email.');
      return;
    }
    Alert.alert('Codigo Enviado', 'Verifique seu email.');
    setStep(2);
  }

  function handleValidarCodigo() {
    if (codigo.trim() === '12345') {
      setStep(3);
    } else {
      Alert.alert('Erro', 'Codigo invalido.');
    }
  }

  async function handleResetarSenha() {
    if (!novaSenha.trim()) {
      Alert.alert('Atencao', 'Informe a nova senha.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atencao', 'As senhas nao conferem.');
      return;
    }

    try {
      setLoading(true);
      await resetarSenha(email.trim(), novaSenha.trim());
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao resetar senha.');
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <Text style={styles.subtitle}>Informe seu email para recuperar a senha</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Seu email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleEnviarCodigo}
          >
            <Text style={styles.btnText}>Enviar Codigo</Text>
          </Pressable>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={styles.subtitle}>Digite o codigo enviado para {email}</Text>
          <Text style={styles.label}>Codigo</Text>
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Codigo de verificacao"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleValidarCodigo}
          >
            <Text style={styles.btnText}>Validar</Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text style={styles.subtitle}>Defina sua nova senha</Text>
        <Text style={styles.label}>Nova Senha</Text>
        <TextInput
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha"
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Confirmar Senha</Text>
        <TextInput
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          placeholder="Repita a nova senha"
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={handleResetarSenha}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Alterar Senha</Text>
          )}
        </Pressable>
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Recuperar Senha</Text>
          {renderStep()}
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Voltar ao login</Text>
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
    textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 16,
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
