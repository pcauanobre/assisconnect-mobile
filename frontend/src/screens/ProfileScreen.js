import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, Switch, Platform,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { updatePerfil } from '../services/authService';
import { getBackup } from '../services/backupService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import AdminUsuariosModal from '../components/AdminUsuariosModal';
import Toast from '../components/Toast';

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { activeColors: c, scale } = useAccessibility();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [fotoBase64, setFotoBase64] = useState(user?.fotoUrl || '');
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  function showToast(message, type = 'info') {
    setToast({ visible: true, message, type });
  }

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
      showToast('Informe o nome.', 'warn');
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
      showToast('Perfil atualizado com sucesso!', 'success');
      setTimeout(() => navigation.goBack(), 900);
    } catch (err) {
      showToast('Não foi possível atualizar o perfil.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={pickImage} style={styles.photoContainer}>
        {fotoBase64 ? (
          <Image source={{ uri: fotoBase64 }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: c.accent }]}>
            <Feather name="camera" size={32} color={c.textSecondary} />
          </View>
        )}
        <Text style={[styles.photoLabel, { color: c.textSecondary, fontSize: scale(13) }]}>Alterar foto</Text>
      </Pressable>

      <Text style={[styles.label, { color: c.textPrimary, fontSize: scale(14) }]}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
        placeholderTextColor={c.textSecondary}
      />

      <Text style={[styles.label, { marginTop: 12, color: c.textPrimary, fontSize: scale(14) }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
        placeholderTextColor={c.textSecondary}
      />

      <Text style={[styles.label, { marginTop: 12, color: c.textPrimary, fontSize: scale(14) }]}>Telefone</Text>
      <TextInput
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        style={[styles.input, { backgroundColor: c.white, borderColor: c.border, color: c.textPrimary, fontSize: scale(14) }]}
        placeholderTextColor={c.textSecondary}
      />

      <Pressable
        style={({ pressed }) => [styles.btn, { backgroundColor: c.primaryDark }, pressed && { opacity: 0.8 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.btnText, { fontSize: scale(16) }]}>Salvar</Text>
        )}
      </Pressable>

      <View style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: c.textSecondary, fontSize: scale(13) }]}>Configurações</Text>

        <Pressable style={[styles.menuRow, { backgroundColor: c.white }]} onPress={() => navigation.navigate('Notificacoes')}>
          <Feather name="bell" size={18} color={c.primary} />
          <Text style={[styles.menuLabel, { color: c.textPrimary, fontSize: scale(14) }]}>Notificações</Text>
          <Feather name="chevron-right" size={18} color={c.textSecondary} />
        </Pressable>

        <Pressable style={[styles.menuRow, { backgroundColor: c.white }]} onPress={() => navigation.navigate('Acessibilidade')}>
          <Feather name="eye" size={18} color={c.primary} />
          <Text style={[styles.menuLabel, { color: c.textPrimary, fontSize: scale(14) }]}>Acessibilidade</Text>
          <Feather name="chevron-right" size={18} color={c.textSecondary} />
        </Pressable>

        {user?.administrador && (
          <Pressable
            style={[styles.menuRow, { backgroundColor: c.white }]}
            onPress={() => setShowAdmin(true)}
          >
            <Feather name="users" size={18} color={c.primary} />
            <Text style={[styles.menuLabel, { color: c.textPrimary, fontSize: scale(14) }]}>Gerenciar Usuários</Text>
            <Feather name="chevron-right" size={18} color={c.textSecondary} />
          </Pressable>
        )}

        {user?.administrador && (
          <Pressable
            style={[styles.menuRow, { backgroundColor: c.white }]}
            onPress={async () => {
              try {
                showToast('Gerando backup...', 'info');
                const res = await getBackup();
                const json = JSON.stringify(res.data, null, 2);
                const data = new Date().toISOString().split('T')[0];
                const nomeArquivo = `assisconnect-backup-${data}.json`;

                if (Platform.OS === 'web') {
                  // Web: download direto no browser
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = nomeArquivo;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`Backup baixado: ${nomeArquivo}`, 'success');
                } else {
                  // Mobile: compartilha via sistema
                  const FileSystem = require('expo-file-system');
                  const Sharing = require('expo-sharing');
                  const path = FileSystem.documentDirectory + nomeArquivo;
                  await FileSystem.writeAsStringAsync(path, json, {
                    encoding: FileSystem.EncodingType.UTF8,
                  });
                  await Sharing.shareAsync(path, {
                    mimeType: 'application/json',
                    dialogTitle: 'Salvar backup AssisConnect',
                  });
                }
              } catch (e) {
                showToast('Falha ao gerar backup', 'error');
              }
            }}
          >
            <Feather name="download" size={18} color={c.primary} />
            <Text style={[styles.menuLabel, { color: c.textPrimary, fontSize: scale(14) }]}>Exportar Backup (admin)</Text>
            <Feather name="chevron-right" size={18} color={c.textSecondary} />
          </Pressable>
        )}

        <Pressable style={[styles.menuRow, { backgroundColor: c.white }]} onPress={() => navigation.navigate('Sobre')}>
          <Feather name="info" size={18} color={c.primary} />
          <Text style={[styles.menuLabel, { color: c.textPrimary, fontSize: scale(14) }]}>Sobre o App</Text>
          <Feather name="chevron-right" size={18} color={c.textSecondary} />
        </Pressable>
      </View>
    </ScrollView>

    <AdminUsuariosModal visible={showAdmin} onClose={() => setShowAdmin(false)} />
    <Toast visible={toast.visible} message={toast.message} type={toast.type}
      onHide={() => setToast(t => ({ ...t, visible: false }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, alignItems: 'center' },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoLabel: { marginTop: 8 },
  label: { fontWeight: '700', marginBottom: 6, alignSelf: 'flex-start' },
  input: {
    width: '100%', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderWidth: 1,
  },
  btn: {
    marginTop: 24, width: '100%',
    paddingVertical: 16, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
  menuSection: { width: '100%', marginTop: 24 },
  menuTitle: { fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 8, elevation: 1,
  },
  menuLabel: { flex: 1, fontWeight: '600' },
});
