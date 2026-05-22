import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import { useAccessibility } from '../contexts/AccessibilityContext';

const TYPE_CONFIG = {
  success: { icon: 'check',           ring: '#22c55e', bg: '#dcfce7' },
  error:   { icon: 'x',               ring: '#dc2626', bg: '#fee2e2' },
  warn:    { icon: 'alert-triangle',  ring: '#d97706', bg: '#fef3c7' },
  info:    { icon: 'info',            ring: '#2563eb', bg: '#dbeafe' },
};

/**
 * Icone animado: anel cresce, icone faz pop, e (no success) emite uma onda.
 */
function AnimatedIcon({ type }) {
  const ringScale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    ringScale.setValue(0);
    iconScale.setValue(0);
    ripple.setValue(0);

    Animated.sequence([
      Animated.spring(ringScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.delay(80),
      Animated.spring(iconScale, { toValue: 1, tension: 220, friction: 6, useNativeDriver: true }),
    ]).start();

    if (type === 'success') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ripple, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        { iterations: 2 },
      ).start();
    }
  }, [type, ringScale, iconScale, ripple]);

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <View style={styles.iconWrap}>
      {type === 'success' && (
        <Animated.View
          style={[
            styles.ripple,
            { borderColor: cfg.ring, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.ring,
          { backgroundColor: cfg.bg, borderColor: cfg.ring, transform: [{ scale: ringScale }] },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Feather name={cfg.icon} size={36} color={cfg.ring} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/**
 * Popup de feedback (success/error/warn/info) — substitui o Alert.alert simples.
 * Botao unico de OK; tema acompanha o tipo.
 *
 * Props:
 *   visible, onClose
 *   type: 'success' | 'error' | 'warn' | 'info'
 *   title, message
 *   confirmLabel: texto do botao (default 'OK')
 *   autoCloseMs: se setado, fecha sozinho apos N ms
 */
export default function FeedbackDialog({
  visible,
  onClose,
  type = 'info',
  title,
  message,
  confirmLabel = 'OK',
  autoCloseMs,
}) {
  const { activeColors: c, scale } = useAccessibility();
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    if (visible && autoCloseMs) {
      const t = setTimeout(() => onClose && onClose(), autoCloseMs);
      return () => clearTimeout(t);
    }
  }, [visible, autoCloseMs, onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.card, { backgroundColor: c.white }]}>
        <AnimatedIcon type={type} />

        {!!title && (
          <Text style={[styles.title, { color: c.textPrimary, fontSize: scale(18) }]}>{title}</Text>
        )}

        {!!message && (
          <Text style={[styles.message, { color: c.textSecondary, fontSize: scale(14) }]}>
            {message}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: cfg.ring },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={[styles.btnText, { fontSize: scale(14) }]}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
  },
  iconWrap: {
    width: 88, height: 88,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2,
  },
  ring: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6,
  },
  message: {
    fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  btn: {
    width: '100%', paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
