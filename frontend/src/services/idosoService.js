import api from '../api';

export const getIdosos = () => api.get('/idosos');
export const getIdoso = (id) => api.get(`/idosos/${id}`);
export const createIdoso = (data) => api.post('/idosos', data);
export const updateIdoso = (id, data) => api.put(`/idosos/${id}`, data);
export const deleteIdoso = (id) => api.delete(`/idosos/${id}`);
export const getIdososCount = () => api.get('/idosos/quantidade');
export const getAniversariantes = () => api.get('/idosos/aniversariantes');
export const getAniversariantesDoMes = () => api.get('/idosos/aniversariantes-do-mes');
export const getCountByMonth = (ano, mes) =>
  api.get('/idosos/quantidade-por-mes', { params: { ano, mes } });
