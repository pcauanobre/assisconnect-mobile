import api from '../api';

export const getUsuariosCount = () => api.get('/usuarios/quantidade');
