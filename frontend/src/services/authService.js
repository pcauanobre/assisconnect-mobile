import api from '../api';

export const login = (email, senha) =>
  api.post('/auth/login', { email, senha });

export const register = (usuario, senha, email, administrador = false) =>
  api.post('/auth/register', { nome: 'Usuario', usuario, senha, email, administrador });

export const resetarSenha = (email, novaSenha) =>
  api.post('/auth/resetar-senha', { email, novaSenha });

export const getPerfil = (usuario) =>
  api.get(`/perfil/${usuario}`);

export const updatePerfil = (usuario, data) =>
  api.post(`/perfil/${usuario}`, data);
