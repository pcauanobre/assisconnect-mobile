import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  Animated, Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { resetarSenha } from '../../services/authService';
import { useAccessibility } from '../../contexts/AccessibilityContext';

const STEPS = [
  { label: 'Email', icon: 'mail' },
  { label: 'Código', icon: 'key' },
  { label: 'Nova senha', icon: 'lock' },
];

export default function ForgotPasswordScreen({ navigation }) {
  const { activeColors: c, scale } = useAccessibility();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  // Entrada
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Transição de step
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepX = useRef(new Animated.Value(0)).current;

  // Shake
  const shakeX = useRef(new Animated.Value(0)).current;

  function runEntrance() {
    logoScale.setValue(0); logoOpacity.setValue(0);
    cardY.setValue(50); cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 90, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(70),
        Animated.parallel([
          Animated.timing(cardY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }

  useFocusEffect(useCallback(() => { runEntrance(); }, []));

  function goToStep(next) {
    Animated.parallel([
      Animated.timing(stepOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(stepX, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      stepX.setValue(30);
      Animated.parallel([
        Animated.timing(stepOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(stepX, { toValue: 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  }

  function shake() {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleEnviarCodigo() {
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) { shake(); Alert.alert('Atenção', 'Informe seu email.'); return; }
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setEmail(emailNorm);
      goToStep(2);
    } finally {
      setLoading(false);
    }
  }

  function handleValidarCodigo() {
    if (!codigo.trim()) { shake(); Alert.alert('Atenção', 'Informe o código.'); return; }
    if (codigo.trim() === '123456') goToStep(3);
    else { shake(); Alert.alert('Código inválido', 'Para teste, use: 123456'); }
  }

  async function handleResetarSenha() {
    if (!novaSenha.trim()) { shake(); Alert.alert('Atenção', 'Informe a nova senha.'); return; }
    if (novaSenha !== confirmarSenha) { shake(); Alert.alert('Atenção', 'As senhas não conferem.'); return; }
    try {
      setLoading(true);
      await resetarSenha(email, novaSenha.trim());
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      shake();
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao resetar senha.');
    } finally {
      setLoading(false);
    }
  }

  function renderStepContent() {
    if (step === 1) return (
      <>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: scale(13) }]}>
          Informe seu email para receber o código de verificação
        </Text>
        <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
          <Feather name="mail" size={18} color={c.textSecondary} style={styles.inputIcon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleEnviarCodigo}
            style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
            placeholderTextColor={c.textSecondary}
          />
        </View>
        <Pressable
          style={[styles.btn, { backgroundColor: c.primary }, loading && { opacity: 0.7 }]}
          onPress={handleEnviarCodigo}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[styles.btnText, { fontSize: scale(16) }]}>Enviar Código</Text>
          }
        </Pressable>
      </>
    );

    if (step === 2) return (
      <>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: scale(13) }]}>
          Código enviado para {'\n'}<Text style={{ fontWeight: '700', color: c.primary }}>{email}</Text>
        </Text>
        <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
          <Feather name="key" size={18} color={c.textSecondary} style={styles.inputIcon} />
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Código de verificação"
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleValidarCodigo}
            style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
            placeholderTextColor={c.textSecondary}
          />
        </View>
        <Pressable style={[styles.btn, { backgroundColor: c.primary }]} onPress={handleValidarCodigo}>
          <Text style={[styles.btnText, { fontSize: scale(16) }]}>Validar Código</Text>
        </Pressable>
        <Pressable onPress={() => goToStep(1)}>
          <Text style={[styles.linkSmall, { color: c.textSecondary, fontSize: scale(13) }]}>Reenviar código</Text>
        </Pressable>
      </>
    );

    return (
      <>
        <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: scale(13) }]}>Defina sua nova senha</Text>
        <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
          <Feather name="lock" size={18} color={c.textSecondary} style={styles.inputIcon} />
          <TextInput
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Nova senha"
            secureTextEntry={!showNova}
            returnKeyType="next"
            style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
            placeholderTextColor={c.textSecondary}
          />
          <Pressable onPress={() => setShowNova(v => !v)} style={styles.eyeBtn}>
            <Feather name={showNova ? 'eye-off' : 'eye'} size={18} color={c.textSecondary} />
          </Pressable>
        </View>
        <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
          <Feather name="lock" size={18} color={c.textSecondary} style={styles.inputIcon} />
          <TextInput
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repetir nova senha"
            secureTextEntry={!showConfirmar}
            returnKeyType="done"
            onSubmitEditing={handleResetarSenha}
            style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
            placeholderTextColor={c.textSecondary}
          />
          <Pressable onPress={() => setShowConfirmar(v => !v)} style={styles.eyeBtn}>
            <Feather name={showConfirmar ? 'eye-off' : 'eye'} size={18} color={c.textSecondary} />
          </Pressable>
        </View>
        <Pressable
          style={[styles.btn, { backgroundColor: c.primary }, loading && { opacity: 0.7 }]}
          onPress={handleResetarSenha}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[styles.btnText, { fontSize: scale(16) }]}>Alterar Senha</Text>
          }
        </Pressable>
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.bg, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={[styles.logoCircle, { backgroundColor: c.primary }]}>
            <Feather name="lock" size={32} color="#fff" />
          </View>
          <Text style={[styles.logoTitle, { color: '#fff', fontSize: scale(26) }]}>AssisConnect</Text>
          <Text style={[styles.logoSub, { color: 'rgba(255,255,255,0.75)', fontSize: scale(13) }]}>Recuperar senha</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: c.surfaceLight },
            { opacity: cardOpacity, transform: [{ translateY: cardY }, { translateX: shakeX }] },
          ]}
        >
          <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(20) }]}>Recuperar Senha</Text>

          {/* Indicador de etapas */}
          <View style={styles.stepsRow}>
            {STEPS.map((s, i) => {
              const active = step === i + 1;
              const done = step > i + 1;
              return (
                <React.Fragment key={i}>
                  <View style={styles.stepItem}>
                    <Animated.View style={[
                      styles.stepCircle,
                      { backgroundColor: done || active ? c.primary : c.border },
                    ]}>
                      <Feather
                        name={done ? 'check' : s.icon}
                        size={13}
                        color={done || active ? '#fff' : c.textSecondary}
                      />
                    </Animated.View>
                    <Text style={[
                      styles.stepLabel,
                      { color: active ? c.primary : done ? c.textSecondary : c.border },
                      active && { fontWeight: '700' },
                    ]}>
                      {s.label}
                    </Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepConnector, { backgroundColor: step > i + 1 ? c.primary : c.border }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Conteúdo da etapa com animação */}
          <Animated.View style={{
            opacity: stepOpacity,
            transform: [{ translateX: stepX }],
          }}>
            {renderStepContent()}
          </Animated.View>

          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={[styles.link, { color: c.textSecondary, fontSize: scale(14) }]}>Voltar ao login</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  logoTitle: { fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  logoSub: { fontSize: 13, marginTop: 3 },
  card: { width: '100%', maxWidth: 420, borderRadius: 20, padding: 24 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepItem: { alignItems: 'center', width: 64 },
  stepCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', marginBottom: 5,
  },
  stepLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },
  stepConnector: { flex: 1, height: 2, marginTop: -14, marginHorizontal: -4 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, marginBottom: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14 },
  eyeBtn: { padding: 4 },
  btn: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' },
  linkSmall: { marginTop: 12, textAlign: 'center', fontSize: 13 },
});
