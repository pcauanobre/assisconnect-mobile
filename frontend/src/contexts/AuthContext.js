import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, getPerfil } from '../services/authService';

const AuthContext = createContext();

const STORAGE_KEY = '@assisconnect_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.log('[AUTH] Erro ao carregar sessao:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, senha) {
    const res = await apiLogin(email, senha);
    const userData = res.data;

    let perfil = userData;
    try {
      const perfilRes = await getPerfil(userData.usuario);
      perfil = { ...userData, ...perfilRes.data };
    } catch (e) {
      console.log('[AUTH] Perfil nao encontrado, usando dados do login');
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    setUser(perfil);
    return perfil;
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  async function updateProfile(updatedData) {
    const newUser = { ...user, ...updatedData };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
