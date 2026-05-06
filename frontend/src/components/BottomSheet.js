import React, { useEffect, useRef, useState } from 'react';
import { Modal, Animated, StyleSheet, View, Easing, Pressable } from 'react-native';

export default function BottomSheet({ visible, onClose, children }) {
  const [mounted, setMounted] = useState(visible);
  const overlayAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0.92)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      overlayAnim.setValue(0);
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 160, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Overlay: fade + toque fora fecha */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: overlayAnim }]}
        pointerEvents="none"
      />
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

      {/* Card centralizado: scale + fade, bloqueia propagação de toque */}
      <View style={styles.container} pointerEvents="box-none">
        <Animated.View
          style={[styles.sheet, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(0,0,0,0.55)' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
});
