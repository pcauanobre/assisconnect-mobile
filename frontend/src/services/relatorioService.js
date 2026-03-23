import api from '../api';

export const getRelatorios = () => api.get('/api/relatorios');
export const getRelatorio = (mes, ano) => api.get(`/api/relatorios/${mes}/${ano}`);
export const saveRelatorio = (data) => api.post('/api/relatorios', data);
export const getEstatisticas = (mes, ano) =>
  api.get(`/api/relatorios/estatisticas/${mes}/${ano}`);
