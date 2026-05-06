import api from '../api';

export const getUsuariosCount = () => api.get('/usuarios/quantidade');
export const listarUsuarios = () => api.get('/usuarios');
export const atualizarUsuario = (usuario, dados) => api.patch(`/usuarios/${usuario}`, dados);
export const deletarUsuario = (usuario) => api.delete(`/usuarios/${usuario}`);
