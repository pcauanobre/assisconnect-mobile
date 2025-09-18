// client/components/CustomPopup.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

export default function CustomPopup({ visible, message, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  message: {
    color: "#2e2e2e",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#5a3b2e", // marrom
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
