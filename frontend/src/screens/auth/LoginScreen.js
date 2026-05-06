import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  Animated, Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import Toast from '../../components/Toast';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { activeColors: c, scale } = useAccessibility();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  function showToast(message, type = 'info') {
    setToast({ visible: true, message, type });
  }

  // Animações de entrada
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const fields = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  // Shake no erro
  const shakeX = useRef(new Animated.Value(0)).current;

  function runEntrance() {
    logoScale.setValue(0); logoOpacity.setValue(0);
    cardY.setValue(50); cardOpacity.setValue(0);
    fields.forEach(a => a.setValue(0));
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
      Animated.sequence([
        Animated.delay(130),
        Animated.stagger(40, fields.map(a =>
          Animated.spring(a, { toValue: 1, tension: 120, friction: 9, useNativeDriver: true })
        )),
      ]),
    ]).start();
  }

  useFocusEffect(useCallback(() => { runEntrance(); }, []));

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

  async function handleLogin() {
    const emailTrim = email.trim().toLowerCase();
    const senhaTrim = senha.trim();
    if (!emailTrim || !senhaTrim) {
      shake();
      showToast('Preencha email e senha.', 'warn');
      return;
    }
    try {
      setLoading(true);
      await login(emailTrim, senhaTrim);
    } catch (err) {
      shake();
      const msg = err?.response?.status === 401
        ? 'Email ou senha inválidos'
        : err?.response?.data?.message || 'Sem conexão com o servidor';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = (i) => ({
    opacity: fields[i],
    transform: [{ translateY: fields[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

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
            <Feather name="heart" size={32} color="#fff" />
          </View>
          <Text style={[styles.logoTitle, { color: '#fff', fontSize: scale(26) }]}>AssisConnect</Text>
          <Text style={[styles.logoSub, { color: 'rgba(255,255,255,0.75)', fontSize: scale(13) }]}>Gestão de lares de idosos</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: c.surfaceLight },
            { opacity: cardOpacity, transform: [{ translateY: cardY }, { translateX: shakeX }] },
          ]}
        >
          <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(20) }]}>Entrar na conta</Text>

          <Animated.View style={fieldStyle(0)}>
            <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
              <Feather name="mail" size={18} color={c.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
                placeholderTextColor={c.textSecondary}
              />
            </View>
          </Animated.View>

          <Animated.View style={fieldStyle(1)}>
            <View style={[styles.inputWrapper, { backgroundColor: c.white, borderColor: c.border }]}>
              <Feather name="lock" size={18} color={c.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha"
                secureTextEntry={!showSenha}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={[styles.input, { color: c.textPrimary, fontSize: scale(14) }]}
                placeholderTextColor={c.textSecondary}
              />
              <Pressable onPress={() => setShowSenha(v => !v)} style={styles.eyeBtn}>
                <Feather name={showSenha ? 'eye-off' : 'eye'} size={18} color={c.textSecondary} />
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={fieldStyle(2)}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: c.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={[styles.btnText, { fontSize: scale(16) }]}>Entrar</Text>
              }
            </Pressable>
          </Animated.View>

          <Animated.View style={[fieldStyle(3), styles.linksRow]}>
            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.link, { color: c.textSecondary, fontSize: scale(14) }]}>Esqueceu a senha?</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: c.primary, fontWeight: '700', fontSize: scale(14) }]}>Criar conta</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
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
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 22 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, marginBottom: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14 },
  eyeBtn: { padding: 4 },
  btn: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  link: { marginTop: 14, fontSize: 14, textDecorationLine: 'underline' },
});
