import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function PersonalInfoForm({ userData }) {
  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>Informações Pessoais</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.personalInfoInput}
        value={userData.name}
        editable={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.personalInfoInput}
        value={userData.email}
        editable={false}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.personalInfoInput}
        value={userData.phone}
        editable={false}
      />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput
        style={styles.personalInfoInput}
        value={userData.birthDate}
        editable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF', // fundo branco total
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3A2C1F',
  },
  label: {
    fontSize: 14,
    color: '#3A2C1F',
    marginBottom: 4,
  },
  personalInfoInput: {
    backgroundColor: '#FFFFFF', // mantém branco dentro dos inputs também
    borderWidth: 1,
    borderColor: '#CBBBA0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: '#3A2C1F',
  },
});
