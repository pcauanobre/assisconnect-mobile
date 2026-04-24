import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { updatePerfil } from '../services/authService';
import { getBackup } from '../services/backupService';
import colors from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [fotoBase64, setFotoBase64] = useState(user?.fotoUrl || '');
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const b64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFotoBase64(b64);
    }
  }

  async function handleSave() {
    if (!nome.trim()) {
      Alert.alert('Atencao', 'Informe o nome.');
      return;
    }

    try {
      setLoading(true);
      const data = { nome: nome.trim(), email: email.trim(), telefone: telefone.trim() };
      if (fotoBase64 && fotoBase64 !== user?.fotoUrl) {
        data.fotoBase64 = fotoBase64;
      }
      await updatePerfil(user.usuario, data);
      await updateProfile(data);
      Alert.alert('Sucesso', 'Perfil atualizado!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={pickImage} style={styles.photoContainer}>
        {fotoBase64 ? (
          <Image source={{ uri: fotoBase64 }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Feather name="camera" size={32} color={colors.textSecondary} />
          </View>
        )}
        <Text style={styles.photoLabel}>Alterar foto</Text>
      </Pressable>

      <Text style={styles.label}>Nome</Text>
      <TextInput value={nome} onChangeText={setNome} style={styles.input} placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={colors.textSecondary} />

      <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
      <TextInput value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" style={styles.input} placeholderTextColor={colors.textSecondary} />

      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Salvar</Text>
        )}
      </Pressable>

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Configuracoes</Text>

        <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Notificacoes')}>
          <Feather name="bell" size={18} color={colors.primary} />
          <Text style={styles.menuLabel}>Notificacoes</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Acessibilidade')}>
          <Feather name="eye" size={18} color={colors.primary} />
          <Text style={styles.menuLabel}>Acessibilidade</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>

        {user?.administrador && (
          <Pressable
            style={styles.menuRow}
            onPress={async () => {
              try {
                const res = await getBackup();
                const count = Object.keys(res.data).length;
                Alert.alert('Backup gerado', `JSON com ${count} colecoes baixado do servidor.`);
              } catch {
                Alert.alert('Erro', 'Falha ao gerar backup.');
              }
            }}
          >
            <Feather name="download" size={18} color={colors.primary} />
            <Text style={styles.menuLabel}>Exportar Backup (admin)</Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </Pressable>
        )}

        <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Sobre')}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={styles.menuLabel}>Sobre o App</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, alignItems: 'center' },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: { marginTop: 8, fontSize: 13, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6, alignSelf: 'flex-start' },
  input: {
    width: '100%', backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1, borderColor: colors.border, fontSize: 14, color: colors.textPrimary,
  },
  btn: {
    marginTop: 24, width: '100%', backgroundColor: colors.primaryDark,
    paddingVertical: 16, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  menuSection: { width: '100%', marginTop: 24 },
  menuTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 8, elevation: 1,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
