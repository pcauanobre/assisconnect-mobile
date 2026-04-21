import api from '../api';

export const getVisitasPorIdoso = (idosoId) =>
  api.get(`/visitas/idoso/${idosoId}`);

export const createVisita = (data) => api.post('/visitas', data);

export const updateVisita = (id, data) => api.put(`/visitas/${id}`, data);

export const deleteVisita = (id) => api.delete(`/visitas/${id}`);

export const getIdososSemVisita = (dias = 30) =>
  api.get('/visitas/sem-visita', { params: { dias } });
