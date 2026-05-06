import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, Switch, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useAuth } from '../contexts/AuthContext';
import BottomSheet from './BottomSheet';
import Toast from './Toast';
import { listarUsuarios, atualizarUsuario, deletarUsuario } from '../services/usuarioService';

export default function AdminUsuariosModal({ visible, onClose }) {
  const { activeColors: c, scale } = useAccessibility();
  const { user: me } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editando, setEditando] = useState(null); // usuario em edição
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  function showToast(message, type = 'info') {
    setToast({ visible: true, message, type });
  }

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listarUsuarios();
      setUsuarios(res.data || []);
    } catch {
      showToast('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega ao abrir
  const handleOpen = useCallback(() => {
    if (visible) carregar();
  }, [visible, carregar]);

  React.useEffect(() => { handleOpen(); }, [visible]);

  async function toggleAdmin(u) {
    try {
      await atualizarUsuario(u.usuario, { administrador: !u.administrador });
      setUsuarios(prev => prev.map(x =>
        x.usuario === u.usuario ? { ...x, administrador: !x.administrador } : x
      ));
      showToast(`${u.usuario} agora é ${!u.administrador ? 'admin' : 'usuário'}`, 'success');
    } catch {
      showToast('Erro ao alterar permissão', 'error');
    }
  }

  async function handleDelete(u) {
    if (u.usuario === me?.usuario) {
      showToast('Você não pode excluir sua própria conta', 'warn');
      return;
    }
    try {
      await deletarUsuario(u.usuario);
      setUsuarios(prev => prev.filter(x => x.usuario !== u.usuario));
      setConfirmDelete(null);
      showToast(`${u.usuario} removido`, 'success');
    } catch {
      showToast('Erro ao excluir usuário', 'error');
    }
  }

  async function salvarEdicao() {
    if (!editando) return;
    try {
      await atualizarUsuario(editando.usuario, {
        nome: editando.nome,
        email: editando.email,
        administrador: editando.administrador,
      });
      setUsuarios(prev => prev.map(x => x.usuario === editando.usuario ? { ...x, ...editando } : x));
      setEditando(null);
      showToast('Usuário atualizado', 'success');
    } catch {
      showToast('Erro ao salvar', 'error');
    }
  }

  const filtrados = search.trim()
    ? usuarios.filter(u =>
        u.usuario?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.nome?.toLowerCase().includes(search.toLowerCase())
      )
    : usuarios;

  function iniciais(u) {
    const nome = u.nome || u.usuario || '?';
    return nome.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <View style={[styles.card, { backgroundColor: c.white }]}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: c.primary }]}>
                <Feather name="shield" size={16} color="#fff" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Gerenciar Usuários</Text>
                <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                  {usuarios.length} conta{usuarios.length !== 1 ? 's' : ''} cadastrada{usuarios.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={c.textSecondary} />
            </Pressable>
          </View>

          {/* Busca */}
          <View style={[styles.searchRow, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Feather name="search" size={16} color={c.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar usuário..."
              placeholderTextColor={c.textSecondary}
              style={[styles.searchInput, { color: c.textPrimary }]}
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Feather name="x-circle" size={16} color={c.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Lista */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={c.primary} size="large" />
              </View>
            ) : filtrados.length === 0 ? (
              <View style={styles.center}>
                <Feather name="users" size={32} color={c.border} />
                <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nenhum usuário encontrado</Text>
              </View>
            ) : (
              filtrados.map(u => (
                <View
                  key={u.usuario}
                  style={[
                    styles.userRow,
                    { borderBottomColor: c.border },
                    u.usuario === me?.usuario && { backgroundColor: c.surface },
                  ]}
                >
                  {/* Avatar */}
                  <View style={[styles.avatar, { backgroundColor: u.administrador ? c.primary : c.accent }]}>
                    <Text style={[styles.avatarText, { color: u.administrador ? '#fff' : c.textPrimary }]}>
                      {iniciais(u)}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={[styles.userName, { color: c.textPrimary }]}>{u.usuario}</Text>
                      {u.administrador && (
                        <View style={[styles.adminBadge, { backgroundColor: c.primary }]}>
                          <Feather name="shield" size={9} color="#fff" />
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                      {u.usuario === me?.usuario && (
                        <View style={[styles.youBadge, { backgroundColor: c.border }]}>
                          <Text style={[styles.youBadgeText, { color: c.textSecondary }]}>Você</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.userEmail, { color: c.textSecondary }]} numberOfLines={1}>
                      {u.email || '—'}
                    </Text>
                  </View>

                  {/* Ações */}
                  {u.usuario !== me?.usuario && (
                    <View style={styles.actions}>
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                        onPress={() => setEditando({ ...u })}
                        hitSlop={4}
                      >
                        <Feather name="edit-2" size={14} color={c.primary} />
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                        onPress={() => setConfirmDelete(u)}
                        hitSlop={4}
                      >
                        <Feather name="trash-2" size={14} color={c.danger} />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Rodapé */}
          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <Pressable
              style={[styles.refreshBtn, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={carregar}
            >
              <Feather name="refresh-cw" size={14} color={c.primary} />
              <Text style={[styles.refreshText, { color: c.primary }]}>Atualizar</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      {/* Modal de edição */}
      {!!editando && (
        <BottomSheet visible={!!editando} onClose={() => setEditando(null)}>
          <View style={[styles.card, { backgroundColor: c.white }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Editar: {editando.usuario}</Text>
              <Pressable onPress={() => setEditando(null)} hitSlop={10}>
                <Feather name="x" size={20} color={c.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.editBody}>
              <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>NOME</Text>
              <TextInput
                value={editando.nome || ''}
                onChangeText={v => setEditando(e => ({ ...e, nome: v }))}
                placeholder="Nome completo"
                placeholderTextColor={c.textSecondary}
                style={[styles.fieldInput, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
              />
              <Text style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 12 }]}>EMAIL</Text>
              <TextInput
                value={editando.email || ''}
                onChangeText={v => setEditando(e => ({ ...e, email: v }))}
                placeholder="email@dominio.com"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={c.textSecondary}
                style={[styles.fieldInput, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
              />
              <View style={[styles.switchRow, { borderTopColor: c.border, marginTop: 16 }]}>
                <View>
                  <Text style={[styles.switchLabel, { color: c.textPrimary }]}>Administrador</Text>
                  <Text style={[styles.switchSub, { color: c.textSecondary }]}>Acesso total ao sistema</Text>
                </View>
                <Switch
                  value={editando.administrador}
                  onValueChange={v => setEditando(e => ({ ...e, administrador: v }))}
                  trackColor={{ false: c.border, true: c.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <Pressable
                style={[styles.btnOutline, { borderColor: c.border }]}
                onPress={() => setEditando(null)}
              >
                <Text style={[styles.btnOutlineText, { color: c.textSecondary }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, { backgroundColor: c.primary }]}
                onPress={salvarEdicao}
              >
                <Text style={styles.btnPrimaryText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>
      )}

      {/* Confirmação de exclusão */}
      {!!confirmDelete && (
        <BottomSheet visible={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
          <View style={[styles.card, { backgroundColor: c.white }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Confirmar exclusão</Text>
              <Pressable onPress={() => setConfirmDelete(null)} hitSlop={10}>
                <Feather name="x" size={20} color={c.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.confirmBody}>
              <View style={[styles.warningIcon, { backgroundColor: '#fef2f2' }]}>
                <Feather name="trash-2" size={28} color={c.danger} />
              </View>
              <Text style={[styles.confirmText, { color: c.textPrimary }]}>
                Remover <Text style={{ fontWeight: '800' }}>{confirmDelete.usuario}</Text>?
              </Text>
              <Text style={[styles.confirmSub, { color: c.textSecondary }]}>
                Esta ação não pode ser desfeita.
              </Text>
            </View>
            <View style={[styles.footer, { borderTopColor: c.border }]}>
              <Pressable
                style={[styles.btnOutline, { borderColor: c.border }]}
                onPress={() => setConfirmDelete(null)}
              >
                <Text style={[styles.btnOutlineText, { color: c.textSecondary }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, { backgroundColor: c.danger }]}
                onPress={() => handleDelete(confirmDelete)}
              >
                <Text style={styles.btnPrimaryText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 1 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginVertical: 12,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  list: { maxHeight: 380 },
  center: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  userInfo: { flex: 1, minWidth: 0 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  userName: { fontSize: 14, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  youBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  youBadgeText: { fontSize: 10, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1,
  },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1,
  },
  refreshText: { fontSize: 13, fontWeight: '600' },
  // Edição
  editBody: { paddingHorizontal: 20, paddingVertical: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  fieldInput: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, borderTopWidth: 1,
  },
  switchLabel: { fontSize: 15, fontWeight: '700' },
  switchSub: { fontSize: 12, marginTop: 2 },
  // Confirmação
  confirmBody: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 8 },
  warningIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  confirmSub: { fontSize: 13, textAlign: 'center' },
  // Botões
  btnOutline: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '600' },
  btnPrimary: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
